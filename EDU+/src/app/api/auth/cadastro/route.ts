import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createVerificationCodeForSignup } from "@/server/auth/create-verification-code-signup";
import { sendMagicLinkEmail } from "@/server/external/email/templates/magic-link";

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { nome, email } = body;

      if (!nome || !email) {
         return NextResponse.json({ error: "Nome e email são obrigatórios" }, { status: 400 });
      }

      const code = await createVerificationCodeForSignup(email, nome);

      await sendMagicLinkEmail({
         email: email,
         token: code.code
      });

      return NextResponse.json({
         success: true,
         message: "Cadastro realizado! Foi enviado um link de acesso para o seu e-mail"
      });
   } catch (error) {
      console.error("Erro no cadastro:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
