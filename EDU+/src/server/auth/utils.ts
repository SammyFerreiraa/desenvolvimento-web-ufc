import type { NextRequest } from "next/server";

function isIPv4(ip: string): boolean {
   const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
   return ipv4Regex.test(ip);
}

function isIPv6(ip: string): boolean {
   const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
   return ipv6Regex.test(ip) || ip.includes(":");
}

function extractPreferredIP(ipString: string): string {
   const ips = ipString.split(",").map((ip) => ip.trim());

   // First, try to find an IPv4 address
   const ipv4Address = ips.find((ip) => isIPv4(ip));
   if (ipv4Address) {
      return ipv4Address;
   }

   // If no IPv4 found, return the first non-localhost IPv6
   const ipv6Address = ips.find((ip) => isIPv6(ip) && ip !== "::1");
   if (ipv6Address) {
      return ipv6Address;
   }

   // Fallback to first IP
   return ips[0] || "unknown";
}

export function getClientIP(req: NextRequest | Request): string {
   const forwarded = req.headers.get("x-forwarded-for");
   if (forwarded) {
      return extractPreferredIP(forwarded);
   }

   const realIP = req.headers.get("x-real-ip");
   if (realIP) {
      return extractPreferredIP(realIP);
   }

   // Cloudflare
   const cfConnectingIP = req.headers.get("cf-connecting-ip");
   if (cfConnectingIP) {
      return extractPreferredIP(cfConnectingIP);
   }

   // Vercel
   const vercelForwardedIP = req.headers.get("x-vercel-forwarded-for");
   if (vercelForwardedIP) {
      return extractPreferredIP(vercelForwardedIP);
   }

   // Fallback
   return "unknown";
}
export function getUserAgent(req: NextRequest | Request): string | undefined {
   return req.headers.get("user-agent") || undefined;
}
