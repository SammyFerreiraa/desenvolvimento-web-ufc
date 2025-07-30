import { jwtVerify, SignJWT } from "jose";
import { env } from "@/config/env";
import type { UserRole } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);
const ACCESS_TOKEN_EXPIRES = 15 * 60; // 15 minutes

function generateUUID(): string {
   return crypto.randomUUID();
}

export type SessionUser = {
   id: string;
   email: string;
   name: string | null;
   role: UserRole;
   image: string | null;
};

export const createAccessToken = async (user: SessionUser): Promise<string> => {
   return await new SignJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image
   })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .setIssuedAt()
      .sign(JWT_SECRET);
};

export const verifyAccessToken = async (token: string): Promise<SessionUser | null> => {
   try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (
         typeof payload.id === "string" &&
         typeof payload.email === "string" &&
         typeof payload.name === "string" &&
         typeof payload.role === "string" &&
         (typeof payload.image === "string" || payload.image === null)
      ) {
         return {
            id: payload.id,
            email: payload.email,
            name: payload.name,
            role: payload.role as UserRole,
            image: payload.image
         };
      }
      return null;
   } catch {
      return null;
   }
};

export const generateRefreshToken = (): string => {
   return generateUUID();
};

export const validateRefreshTokenEdge = async (
   refreshToken: string
): Promise<{ user: SessionUser; accessToken: string } | null> => {
   try {
      const response = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/validate-refresh`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.user && data.accessToken ? { user: data.user, accessToken: data.accessToken } : null;
   } catch {
      return null;
   }
};

export { ACCESS_TOKEN_EXPIRES };
