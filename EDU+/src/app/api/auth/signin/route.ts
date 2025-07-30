import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createVerificationCode } from "@/server/auth/create-verification-code";
import { sendMagicLinkEmail } from "@/server/external/email/templates/magic-link";

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { email } = body;

      if (!email) {
         return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
      }

      const code = await createVerificationCode(email);

      await sendMagicLinkEmail({
         email: email,
         token: code.code
      });

      return NextResponse.json({
         success: true,
         message: "Foi enviado um link de acesso para o seu e-mail"
      });
   } catch (error) {
      console.error("Erro no signin:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
