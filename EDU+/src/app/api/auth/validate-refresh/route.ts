import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createAccessToken, type SessionUser } from "@/common/auth-edge";
import { createRateLimitJsonResponse, getClientIP, refreshTokenRateLimit } from "@/server/auth/rate-limit";
import { applyAPISecurityHeaders } from "@/server/auth/security-headers";
import { prisma } from "@/server/config/prisma";

export async function POST(req: NextRequest) {
   try {
      const clientIP = getClientIP(req);
      const rateLimitResult = refreshTokenRateLimit(`refresh:${clientIP}`);

      if (!rateLimitResult.allowed) {
         const response = createRateLimitJsonResponse(rateLimitResult.resetTime, rateLimitResult.blocked);
         return applyAPISecurityHeaders(response);
      }

      const { refreshToken } = await req.json();

      if (!refreshToken) {
         const response = NextResponse.json({ error: "No refresh token provided" }, { status: 400 });
         return applyAPISecurityHeaders(response);
      }

      const session = await prisma.session.findUnique({
         where: { sessionToken: refreshToken },
         include: {
            user: {
               select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                  image: true
               }
            }
         }
      });

      if (!session || session.expires < new Date()) {
         const response = NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
         return applyAPISecurityHeaders(response);
      }

      const user: SessionUser = {
         id: session.user.id,
         email: session.user.email,
         name: session.user.name,
         role: session.user.role,
         image: session.user.image
      };

      const newAccessToken = await createAccessToken(user);

      const response = NextResponse.json({
         user,
         accessToken: newAccessToken
      });

      return applyAPISecurityHeaders(response);
   } catch (error) {
      console.error("Error validating refresh token:", error);
      const response = NextResponse.json({ error: "Internal server error" }, { status: 500 });
      return applyAPISecurityHeaders(response);
   }
}
