import { cookies } from "next/headers";
import {
   clearAuthCookies,
   invalidateAllUserSessions,
   invalidateSession,
   refreshAccessToken,
   setAuthCookies
} from "@/common/auth";
import { procedures } from "@/server/config/trpc";
import { TRPCError } from "@trpc/server";

export const getSession = procedures.protected.query(({ ctx }) => {
   return {
      authenticated: true,
      user: ctx.session
   };
});

export const refreshToken = procedures.public.mutation(async () => {
   const cookieStore = await cookies();
   const refreshTokenValue = cookieStore.get("refreshToken")?.value;

   if (!refreshTokenValue) {
      throw new TRPCError({
         code: "UNAUTHORIZED",
         message: "Refresh token não encontrado"
      });
   }

   const result = await refreshAccessToken(refreshTokenValue);

   if (!result) {
      await clearAuthCookies();
      throw new TRPCError({
         code: "UNAUTHORIZED",
         message: "Refresh token inválido ou expirado"
      });
   }

   await setAuthCookies(result.accessToken, result.refreshToken);

   return {
      success: true,
      user: result.user
   };
});

export const signOut = procedures.protected.mutation(async () => {
   const cookieStore = await cookies();
   const refreshTokenValue = cookieStore.get("refreshToken")?.value;

   if (refreshTokenValue) {
      await invalidateSession(refreshTokenValue);
   }

   await clearAuthCookies();

   return { success: true };
});

export const signOutAll = procedures.protected.mutation(async ({ ctx }) => {
   await invalidateAllUserSessions(ctx.session!.id);
   await clearAuthCookies();

   return { success: true };
});
