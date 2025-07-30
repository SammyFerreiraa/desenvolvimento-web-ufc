import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { listaExerciciosRepository } from "@/server/routers/lista-exercicios/repository";

const updateSchema = z.object({
   titulo: z.string().min(1).optional(),
   descricao: z.string().optional(),
   dataLiberacao: z.string().optional(),
   dataLimite: z.string().optional(),
   questoesIds: z.array(z.string()).optional()
});

// PUT - Atualizar lista de exercícios
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   try {
      const session = await getAuthSession();

      if (!session) {
         return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.UPDATE])) {
         return NextResponse.json({ error: "Sem permissão para editar listas de exercícios" }, { status: 403 });
      }

      const { id } = await params;
      const body = await request.json();
      const validatedData = updateSchema.parse(body);

      const lista = await listaExerciciosRepository.update(id, session.id, validatedData);

      return NextResponse.json(lista, { status: 200 });
   } catch (error: unknown) {
      console.error("Erro ao atualizar lista de exercícios:", error);

      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      return NextResponse.json(
         { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
         { status: 500 }
      );
   }
}

// DELETE - Deletar lista de exercícios
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   try {
      const session = await getAuthSession();

      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.DELETE_LISTA])) {
         return NextResponse.json({ error: "Sem permissão para deletar listas de exercícios" }, { status: 403 });
      }

      const { id } = await params;

      await listaExerciciosRepository.delete(id, session.id);

      return NextResponse.json({ success: true }, { status: 200 });
   } catch (error: unknown) {
      console.error("Erro ao deletar lista de exercícios:", error);
      return NextResponse.json(
         { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
         { status: 500 }
      );
   }
}
