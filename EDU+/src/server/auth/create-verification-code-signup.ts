import { randomUUID } from "crypto";
import { addMinutes } from "date-fns";
import { prisma } from "@/server/config/prisma";
import { UserRole } from "@prisma/client";

const CODE_EXPIRATION_MINUTES = 5;

export const createVerificationCodeForSignup = async (email: string, nome: string) => {
   let user = await prisma.user.findUnique({ where: { email } });

   if (!user) {
      user = await prisma.user.create({
         data: {
            email,
            name: nome,
            role: UserRole.PROFESSOR
         }
      });
   }

   await prisma.verificationCode.updateMany({
      where: {
         userId: user.id
      },
      data: {
         used: true
      }
   });

   const code = randomUUID();
   const expiresAt = addMinutes(new Date(), CODE_EXPIRATION_MINUTES).toISOString();

   return prisma.verificationCode.create({
      data: {
         userId: user.id,
         code,
         expiresAt
      }
   });
};
