import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/common/auth";
import { updatePerfilSchema } from "@/common/schemas/perfil";
import { prisma } from "@/server/config/prisma";

export async function GET() {
   try {
      const session = await getAuthSession();

      if (!session) {
         return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }

      // Buscar dados do usuário com perfil
      const user = await prisma.user.findUnique({
         where: { id: session.id },
         include: {
            profile: true
         }
      });

      if (!user) {
         return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      }

      return NextResponse.json({
         user: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            profile: user.profile
         }
      });
   } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}

export async function PUT(request: NextRequest) {
   try {
      const session = await getAuthSession();

      if (!session) {
         return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }

      const body = await request.json();

      // Validar dados com schema Zod
      const validationResult = updatePerfilSchema.safeParse(body);
      if (!validationResult.success) {
         return NextResponse.json(
            { error: "Dados inválidos", details: validationResult.error.issues },
            { status: 400 }
         );
      }

      const { name, especialidade, biografia } = validationResult.data;

      // Atualizar dados do usuário
      const updatedUser = await prisma.user.update({
         where: { id: session.id },
         data: {
            name: name
         },
         include: {
            profile: true
         }
      });

      // Atualizar ou criar perfil
      const updatedProfile = await prisma.userProfile.upsert({
         where: { userId: session.id },
         update: {
            especialidade,
            biografia
         },
         create: {
            userId: session.id,
            especialidade,
            biografia
         }
      });

      return NextResponse.json({
         user: {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            image: updatedUser.image,
            role: updatedUser.role,
            profile: updatedProfile
         }
      });
   } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
