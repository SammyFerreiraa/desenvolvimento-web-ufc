import { z } from "@/config/zod-config";
import { authManager } from "@/server/auth";
import { procedures } from "@/server/config/trpc";
import { TRPCError } from "@trpc/server";

export const getAuthUrl = procedures.public
   .input(z.object({ provider: z.string(), state: z.string().optional() }))
   .mutation(async ({ input }) => {
      const url = await authManager.getAuthUrl(input.provider, input.state);

      if (!url) {
         throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Provider not found or doesn't support OAuth"
         });
      }

      return { url };
   });

export const authenticate = procedures.public
   .input(
      z.object({
         provider: z.string(),
         credentials: z.record(z.any())
      })
   )
   .mutation(async ({ input }) => {
      const result = await authManager.authenticate(input.provider, input.credentials);

      if (!result.success) {
         throw new TRPCError({
            code: "BAD_REQUEST",
            message: result.error || "Authentication failed"
         });
      }

      if (result.requiresVerification) {
         return {
            success: true,
            requiresVerification: true,
            message: "Verification code sent"
         };
      }

      if (result.tokens && result.user) {
         const { setAuthCookies } = await import("@/common/auth");
         await setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);
      }

      return {
         success: true,
         user: result.user
      };
   });
