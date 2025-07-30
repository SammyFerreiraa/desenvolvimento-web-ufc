import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { listaExerciciosCreateSchema } from "@/common/schemas/edu-plus";
import { listaExerciciosRepository } from "@/server/routers/lista-exercicios/repository";

// POST - Criar lista de exercícios
export async function POST(request: NextRequest) {
   try {
      const session = await getAuthSession();

      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.CREATE])) {
         return NextResponse.json({ error: "Sem permissão para criar listas de exercícios" }, { status: 403 });
      }

      const body = await request.json();
      const validatedData = listaExerciciosCreateSchema.parse(body);

      const lista = await listaExerciciosRepository.create({
         ...validatedData,
         professorId: session.id
      });

      return NextResponse.json(lista, { status: 201 });
   } catch (error: unknown) {
      console.error("Erro ao criar lista de exercícios:", error);

      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      return NextResponse.json(
         { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
         { status: 500 }
      );
   }
}
