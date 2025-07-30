import { randomUUID } from "crypto";
import { addMinutes } from "date-fns";
import { prisma } from "@/server/config/prisma";

const CODE_EXPIRATION_MINUTES = 5;

export const createVerificationCode = async (email: string) => {
   await prisma.verificationCode.updateMany({
      where: {
         user: { email }
      },
      data: {
         used: true
      }
   });

   const code = randomUUID();
   const expiresAt = addMinutes(new Date(), CODE_EXPIRATION_MINUTES).toISOString();

   const user = await prisma.user.findUnique({ where: { email } });
   if (!user) throw new Error("Usuário não encontrado");

   return prisma.verificationCode.create({
      data: {
         userId: user.id,
         code,
         expiresAt
      }
   });
};
