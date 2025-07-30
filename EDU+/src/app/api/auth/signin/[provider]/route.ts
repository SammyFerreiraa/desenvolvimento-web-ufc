import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authManager } from "@/server/auth";
import { createRateLimitResponse, getClientIP, signinRateLimit } from "@/server/auth/rate-limit";

export async function GET(request: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
   try {
      // ✅ Await params before using
      const { provider } = await params;

      // ✅ Rate limiting por IP
      const clientIP = getClientIP(request);
      const rateLimitKey = `oauth_signin:${clientIP}`;
      const rateLimitResult = signinRateLimit(rateLimitKey);

      if (!rateLimitResult.allowed) {
         return createRateLimitResponse(rateLimitResult.resetTime, rateLimitResult.blocked, request);
      }

      const { searchParams } = new URL(request.url);
      const redirectUrl = searchParams.get("redirectUrl");

      // ✅ CSRF Protection: Gerar URL com state automático
      const authUrl = await authManager.getAuthUrl(provider, redirectUrl || undefined);

      if (!authUrl) {
         return NextResponse.redirect(new URL(`/login?error=provider_not_found&provider=${provider}`, request.url));
      }

      return NextResponse.redirect(authUrl);
   } catch (error) {
      const { provider } = await params;
      console.error(`${provider} signin error:`, error);
      return NextResponse.redirect(new URL(`/login?error=signin_failed&provider=${provider}`, request.url));
   }
}
