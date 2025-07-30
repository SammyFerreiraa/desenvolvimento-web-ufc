import { NextResponse } from "next/server";

type RateLimitEntry = {
   count: number;
   resetTime: number;
   blocked: boolean;
   blockUntil?: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();

const RATE_LIMITS = {
   signin: {
      maxAttempts: 5,
      windowMs: 60 * 1000, // 60 seconds
      blockDurationMs: 60 * 1000 // 60 seconds block after limit exceeded
   },
   callback: {
      maxAttempts: 10,
      windowMs: 60 * 1000, // 60 seconds
      blockDurationMs: 60 * 1000 // 60 seconds block after limit exceeded
   },
   refreshToken: {
      maxAttempts: 10,
      windowMs: 60 * 1000, // 60 seconds
      blockDurationMs: 60 * 1000 // 60 seconds block after limit exceeded
   }
} as const;

type RateLimitResult = {
   allowed: boolean;
   count: number;
   resetTime: number;
   blocked: boolean;
};

const rateLimit = (key: string, maxAttempts: number, windowMs: number, blockDurationMs: number): RateLimitResult => {
   const now = Date.now();
   const entry = rateLimitStore.get(key);

   // Clean up expired entries periodically
   if (Math.random() < 0.01) {
      cleanupExpiredEntries();
   }

   if (!entry) {
      // First request for this key
      const resetTime = now + windowMs;
      rateLimitStore.set(key, {
         count: 1,
         resetTime,
         blocked: false
      });

      return {
         allowed: true,
         count: 1,
         resetTime,
         blocked: false
      };
   }

   // Check if currently blocked
   if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
      return {
         allowed: false,
         count: entry.count,
         resetTime: entry.blockUntil,
         blocked: true
      };
   }

   // Check if window has expired
   if (now >= entry.resetTime) {
      // Reset the window
      const resetTime = now + windowMs;
      rateLimitStore.set(key, {
         count: 1,
         resetTime,
         blocked: false
      });

      return {
         allowed: true,
         count: 1,
         resetTime,
         blocked: false
      };
   }

   entry.count++;

   if (entry.count > maxAttempts) {
      entry.blocked = true;
      entry.blockUntil = now + blockDurationMs;

      return {
         allowed: false,
         count: entry.count,
         resetTime: entry.blockUntil,
         blocked: true
      };
   }

   return {
      allowed: true,
      count: entry.count,
      resetTime: entry.resetTime,
      blocked: false
   };
};

const cleanupExpiredEntries = () => {
   const now = Date.now();
   for (const [key, entry] of rateLimitStore.entries()) {
      const isExpired = entry.blocked ? entry.blockUntil && now >= entry.blockUntil : now >= entry.resetTime;

      if (isExpired) {
         rateLimitStore.delete(key);
      }
   }
};

export const signinRateLimit = (key: string): RateLimitResult => {
   const config = RATE_LIMITS.signin;
   return rateLimit(key, config.maxAttempts, config.windowMs, config.blockDurationMs);
};

export const callbackRateLimit = (key: string): RateLimitResult => {
   const config = RATE_LIMITS.callback;
   return rateLimit(key, config.maxAttempts, config.windowMs, config.blockDurationMs);
};

export const refreshTokenRateLimit = (key: string): RateLimitResult => {
   const config = RATE_LIMITS.refreshToken;
   return rateLimit(key, config.maxAttempts, config.windowMs, config.blockDurationMs);
};

export const createRateLimitResponse = (
   resetTime: number,
   blocked: boolean = false,
   request?: Request
): NextResponse => {
   const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

   if (request) {
      const url = new URL(request.url);
      const rateLimitUrl = new URL("/login/rate-limit", url.origin);

      // rateLimitUrl.searchParams.set("retryAfter", retryAfter.toString());
      // rateLimitUrl.searchParams.set("resetTime", new Date(resetTime).toISOString());

      return NextResponse.redirect(rateLimitUrl);
   }

   return NextResponse.json(
      {
         error: blocked ? "Too many failed attempts. Please try again later." : "Rate limit exceeded",
         retryAfter
      },
      {
         status: 429,
         headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Reset": new Date(resetTime).toISOString()
         }
      }
   );
};

export const createRateLimitJsonResponse = (resetTime: number, blocked: boolean = false): NextResponse => {
   const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

   return NextResponse.json(
      {
         error: blocked ? "Too many failed attempts. Please try again later." : "Rate limit exceeded",
         retryAfter
      },
      {
         status: 429,
         headers: {
            "Retry-After": retryAfter.toString(),
            "X-RateLimit-Reset": new Date(resetTime).toISOString()
         }
      }
   );
};

export const getClientIP = (req: Request): string => {
   const forwarded = req.headers.get("x-forwarded-for");
   if (forwarded) {
      return forwarded.split(",")[0]?.trim() || "anonymous";
   }

   const realIP = req.headers.get("x-real-ip");
   if (realIP) {
      return realIP;
   }

   const cfConnectingIP = req.headers.get("cf-connecting-ip");
   if (cfConnectingIP) {
      return cfConnectingIP;
   }

   return "anonymous";
};

export const clearRateLimit = (key: string): void => {
   if (process.env.NODE_ENV === "development") {
      rateLimitStore.delete(key);
   }
};

export const clearAllRateLimits = (): void => {
   if (process.env.NODE_ENV === "development") {
      rateLimitStore.clear();
   }
};

// Get current rate limit status for a key (for debugging)
export const getRateLimitStatus = (key: string): RateLimitEntry | null => {
   return rateLimitStore.get(key) || null;
};
