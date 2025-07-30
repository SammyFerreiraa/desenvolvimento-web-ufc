import { isBefore } from "date-fns";
import { createVerificationCode } from "@/server/auth/create-verification-code";
import { prisma } from "@/server/config/prisma";
import { sendMagicLinkEmail } from "@/server/external/email/templates/magic-link";
import type { AuthCredentials, AuthProvider, AuthResult } from "./core";

const sendMagicLink = async (email: string): Promise<AuthResult> => {
   try {
      const verificationCode = await createVerificationCode(email);

      await sendMagicLinkEmail({
         email,
         token: verificationCode.code
      });

      return {
         success: true,
         requiresVerification: true,
         verificationToken: verificationCode.code
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
   } catch (error) {
      return { success: false, error: "Failed to send magic link" };
   }
};

const verifyCode = async (email: string, code: string): Promise<AuthResult> => {
   try {
      const verification = await prisma.verificationCode.findFirst({
         where: {
            code,
            user: { email },
            used: false
         },
         include: { user: true }
      });

      if (!verification) {
         return { success: false, error: "Invalid or expired code" };
      }

      if (isBefore(verification.expiresAt, new Date())) {
         return { success: false, error: "Code has expired" };
      }

      await prisma.verificationCode.update({
         where: { id: verification.id },
         data: { used: true }
      });

      return {
         success: true,
         user: {
            id: verification.user.id,
            email: verification.user.email,
            name: verification.user.name ?? "",
            emailVerified: true
         }
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
   } catch (error) {
      return { success: false, error: "Code verification failed" };
   }
};

const authenticate = async (credentials: AuthCredentials): Promise<AuthResult> => {
   const { email, code } = credentials;

   if (!email) {
      return { success: false, error: "Email is required" };
   }

   return code ? verifyCode(email, code) : sendMagicLink(email);
};

export const magicLinkProvider: AuthProvider = {
   name: "magic-link",
   type: "email",
   authenticate
};
