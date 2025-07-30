import nodemailer from "nodemailer";
import { env } from "@/config/env";
import { TRPCError } from "@trpc/server";

const transporter = nodemailer.createTransport({
   host: env.EMAIL_HOST,
   port: env.EMAIL_PORT,
   secure: env.NODE_ENV === "production",
   auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS
   },
   logger: true
});

type ISendEmailProps = {
   to: string;
   subject: string;
   html: string;
   attachments?: nodemailer.SendMailOptions["attachments"];
};

export const sendEmail = async ({ to, subject, html, attachments }: ISendEmailProps) => {
   try {
      await transporter.sendMail({
         from: env.EMAIL_FROM,
         to,
         subject,
         html,
         attachments
      });
      return { success: true };
   } catch (error) {
      throw new TRPCError({
         code: "INTERNAL_SERVER_ERROR",
         message: "Erro ao enviar e-mail",
         cause: error
      });
   }
};
