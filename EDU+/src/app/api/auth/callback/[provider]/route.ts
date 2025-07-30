import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authManager } from "@/server/auth";
import { callbackRateLimit, createRateLimitResponse } from "@/server/auth/rate-limit";
import { getClientIP, getUserAgent } from "@/server/auth/utils";

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
   try {
      const { provider } = await params;

      const clientIP = getClientIP(request);
      const rateLimitResult = callbackRateLimit(`oauth_callback:${clientIP}`);

      if (!rateLimitResult.allowed) {
         return createRateLimitResponse(rateLimitResult.resetTime, rateLimitResult.blocked, request);
      }

      const { searchParams } = new URL(request.url);
      const code = searchParams.get("code");
      const error = searchParams.get("error");
      const state = searchParams.get("state");

      if (error) {
         return NextResponse.redirect(new URL(`/login?error=oauth_error&provider=${provider}`, request.url));
      }

      if (!code) {
         return NextResponse.redirect(new URL(`/login?error=missing_code&provider=${provider}`, request.url));
      }

      const userAgent = getUserAgent(request);

      const result = await authManager.handleCallback(provider, code, state || undefined, {
         ipAddress: clientIP,
         userAgent
      });

      if (!result.success) {
         return NextResponse.redirect(
            new URL(
               `/login?error=oauth_failed&provider=${provider}&message=${encodeURIComponent("Authentication failed")}`,
               request.url
            )
         );
      }

      // ✅ Sucesso: Redirecionar para home
      return NextResponse.redirect(new URL("/", request.url));
   } catch (error) {
      const { provider } = await params;
      console.error(`${provider} OAuth error:`, error);
      return NextResponse.redirect(new URL(`/login?error=oauth_failed&provider=${provider}`, request.url));
   }
}
