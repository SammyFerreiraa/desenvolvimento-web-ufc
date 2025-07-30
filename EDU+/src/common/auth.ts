import { cookies } from "next/headers";
import { prisma } from "@/server/config/prisma";
import {
   ACCESS_TOKEN_EXPIRES,
   createAccessToken,
   generateRefreshToken,
   verifyAccessToken,
   type SessionUser
} from "./auth-edge";

const REFRESH_TOKEN_EXPIRES = 7 * 24 * 60 * 60; // 7 days

export { verifyAccessToken };
export type { SessionUser };

export const createTokens = async (user: SessionUser, options?: { ipAddress?: string; userAgent?: string }) => {
   const accessToken = await createAccessToken(user);
   const refreshToken = generateRefreshToken();

   await prisma.session.create({
      data: {
         sessionToken: refreshToken,
         userId: user.id,
         expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 1000),
         ipAddress: options?.ipAddress,
         userAgent: options?.userAgent
      }
   });

   return { accessToken, refreshToken };
};

export const refreshAccessToken = async (
   refreshToken: string,
   options?: { ipAddress?: string; userAgent?: string }
) => {
   const session = await prisma.session.findUnique({
      where: { sessionToken: refreshToken },
      include: { user: true }
   });

   if (!session || session.expires < new Date()) {
      return null;
   }

   const user: SessionUser = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      image: session.user.image
   };

   const { accessToken, refreshToken: newRefreshToken } = await createTokens(user, {
      ipAddress: options?.ipAddress || session.ipAddress || undefined,
      userAgent: options?.userAgent || session.userAgent || undefined
   });

   // Update refresh token, mantendo ou atualizando IP/userAgent
   await prisma.session.update({
      where: { sessionToken: refreshToken },
      data: {
         sessionToken: newRefreshToken,
         expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 1000),
         ipAddress: options?.ipAddress || session.ipAddress,
         userAgent: options?.userAgent || session.userAgent
      }
   });

   return { accessToken, refreshToken: newRefreshToken, user };
};

export const setAuthCookies = async (accessToken: string, refreshToken: string) => {
   const cookieStore = await cookies();

   cookieStore.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ACCESS_TOKEN_EXPIRES,
      path: "/"
   });

   cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: REFRESH_TOKEN_EXPIRES,
      path: "/"
   });
};

export const clearAuthCookies = async () => {
   const cookieStore = await cookies();
   cookieStore.delete("accessToken");
   cookieStore.delete("refreshToken");
};

export const getAuthSession = async (): Promise<SessionUser | null> => {
   const cookieStore = await cookies();
   const accessToken = cookieStore.get("accessToken")?.value;

   if (!accessToken) {
      return null;
   }

   return verifyAccessToken(accessToken);
};

export const invalidateSession = async (sessionToken: string) => {
   await prisma.session.delete({
      where: { sessionToken }
   });
};

export const invalidateAllUserSessions = async (userId: string) => {
   await prisma.session.deleteMany({
      where: { userId }
   });
};
