export const parseCookies = (headers: Headers): Record<string, string> => {
   const cookieHeader = headers.get("cookie") ?? "";

   return Object.fromEntries(
      cookieHeader
         .split(";")
         .map((cookie) => cookie.trim())
         .filter(Boolean)
         .map((cookie) => {
            const [key, ...v] = cookie.split("=");
            return [key, decodeURIComponent(v.join("="))];
         })
   );
};

export const setCookie = (
   headers: Headers,
   name: string,
   value: string,
   options: {
      path?: string;
      maxAge?: number;
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "lax" | "strict" | "none";
   } = {}
) => {
   const cookieParts: string[] = [];
   cookieParts.push(`${name}=${encodeURIComponent(value)}`);
   if (options.path) {
      cookieParts.push(`Path=${options.path}`);
   }
   if (options.sameSite) {
      cookieParts.push(`SameSite=${options.sameSite}`);
   }
   if (options.maxAge) {
      cookieParts.push(`Max-Age=${options.maxAge}`);
   }
   if (options.secure) {
      cookieParts.push("Secure");
   }
   if (options.httpOnly) {
      cookieParts.push("HttpOnly");
   }
   headers.set("set-cookie", cookieParts.join("; "));
};
