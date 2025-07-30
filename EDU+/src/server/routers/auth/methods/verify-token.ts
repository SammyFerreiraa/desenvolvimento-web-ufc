import { createTokens, setAuthCookies } from "@/common/auth";
import { z } from "@/config/zod-config";
import { procedures } from "@/server/config/trpc";
import { TRPCError } from "@trpc/server";
import { authRepository } from "../repository";

export const verifyToken = procedures.public.input(z.object({ token: z.string() })).mutation(async ({ input }) => {
   const record = await authRepository.findVerificationCode(input.token);

   if (!record) {
      throw new TRPCError({
         code: "BAD_REQUEST",
         message: "Token inválido ou já utilizado"
      });
   }

   if (authRepository.isVerificationCodeExpired(record)) {
      throw new TRPCError({
         code: "BAD_REQUEST",
         message: "Token expirado"
      });
   }

   // Mark token as used
   await authRepository.markVerificationCodeAsUsed(record.id);

   const user = authRepository.buildSessionUser(record.user);

   const { accessToken, refreshToken } = await createTokens(user);
   await setAuthCookies(accessToken, refreshToken);

   return {
      success: true,
      user
   };
});
