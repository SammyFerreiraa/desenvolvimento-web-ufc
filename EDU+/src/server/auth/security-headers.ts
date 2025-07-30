import type { NextResponse } from "next/server";

// More information about the security headers can be found at:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy

export const securityHeaders = {
   "X-Frame-Options": "DENY",

   "X-Content-Type-Options": "nosniff",

   "Referrer-Policy": "strict-origin-when-cross-origin"
};

export const applySecurityHeaders = (response: NextResponse): NextResponse => {
   Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
   });

   return response;
};

export const apiSecurityHeaders = {
   ...securityHeaders,
   "Content-Security-Policy": "default-src 'none'",
   "X-API-Version": "1.0"
};

export const applyAPISecurityHeaders = (response: NextResponse): NextResponse => {
   Object.entries(apiSecurityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
   });

   return response;
};
