import { z } from "@/config/zod-config";
import { createVerificationCode } from "@/server/auth/create-verification-code";
import { procedures } from "@/server/config/trpc";
import { sendMagicLinkEmail } from "@/server/external/email/templates/magic-link";

export const signInEmail = procedures.public
   .input(z.object({ email: z.string().email() }))
   .mutation(async ({ input }) => {
      const code = await createVerificationCode(input.email);

      await sendMagicLinkEmail({
         email: input.email,
         token: code.code
      });

      return { success: true };
   });
