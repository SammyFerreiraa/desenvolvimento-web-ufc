import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { validateRefreshTokenEdge, verifyAccessToken } from "@/common/auth-edge";
import { publicRoutes } from "./config/route-control";
import { checkRoutePermission } from "./interface/utils/check-route-permission";
import { applySecurityHeaders } from "./server/auth/security-headers";

export default async function middleware(req: NextRequest) {
   if (process.env.NODE_ENV === "production" && !req.headers.get("x-forwarded-proto")?.includes("https")) {
      return NextResponse.redirect(`https://${req.headers.get("host")}${req.url}`);
   }

   const accessToken = req.cookies.get("accessToken")?.value;
   const refreshToken = req.cookies.get("refreshToken")?.value;

   if (req.nextUrl.pathname === "/login") {
      if (accessToken) {
         const user = await verifyAccessToken(accessToken);
         if (user) {
            return NextResponse.redirect(new URL("/", req.nextUrl));
         }
      }

      if (refreshToken) {
         const refreshResult = await validateRefreshTokenEdge(refreshToken);
         if (refreshResult) {
            return NextResponse.redirect(new URL("/", req.nextUrl));
         }
      }
   }

   const isPublicRoute = publicRoutes.some((route) => req.nextUrl.pathname.startsWith(route));

   if (isPublicRoute) {
      const response = NextResponse.next();
      return applySecurityHeaders(response);
   }

   if (accessToken) {
      const user = await verifyAccessToken(accessToken);

      if (user) {
         const hasPermission = checkRoutePermission(req.nextUrl.pathname, user.role);

         if (hasPermission) {
            const response = NextResponse.next();
            return applySecurityHeaders(response);
         } else {
            const response = NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
            return applySecurityHeaders(response);
         }
      }
   }

   if (refreshToken) {
      const refreshResult = await validateRefreshTokenEdge(refreshToken);

      if (refreshResult) {
         const hasPermission = checkRoutePermission(req.nextUrl.pathname, refreshResult.user.role);

         if (hasPermission) {
            const response = NextResponse.next();
            response.cookies.set("accessToken", refreshResult.accessToken, {
               httpOnly: true,
               secure: process.env.NODE_ENV === "production",
               sameSite: "lax",
               maxAge: 15 * 60,
               path: "/"
            });

            return applySecurityHeaders(response);
         } else {
            const response = NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
            return applySecurityHeaders(response);
         }
      }
   }

   const response = NextResponse.redirect(new URL("/login", req.nextUrl));
   response.cookies.delete("accessToken");
   response.cookies.delete("refreshToken");

   return applySecurityHeaders(response);
}

export const config = {
   matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"]
};
