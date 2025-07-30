import { isBefore } from "date-fns";
import type { SessionUser } from "@/common/auth";
import { prisma } from "@/server/config/prisma";
import type { UserRole } from "@prisma/client";

type UserRecord = {
   id: string;
   email: string;
   name: string | null;
   role: UserRole;
   image: string | null;
};

export const authRepository = {
   findVerificationCode: async (token: string) => {
      return await prisma.verificationCode.findFirst({
         where: { code: token, used: false },
         include: { user: true }
      });
   },

   markVerificationCodeAsUsed: async (id: string) => {
      return await prisma.verificationCode.update({
         where: { id },
         data: { used: true }
      });
   },

   isVerificationCodeExpired: (record: { expiresAt: Date }) => {
      return isBefore(record.expiresAt, new Date());
   },

   buildSessionUser: (user: UserRecord): SessionUser => {
      return {
         id: user.id,
         email: user.email,
         name: user.name,
         role: user.role,
         image: user.image
      };
   }
};
