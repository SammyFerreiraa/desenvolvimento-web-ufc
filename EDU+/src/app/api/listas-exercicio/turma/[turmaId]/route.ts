import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuthSession } from "@/common/auth";
import { listaExerciciosRepository } from "@/server/routers/lista-exercicios/repository";

export async function GET(request: NextRequest, { params }: { params: Promise<{ turmaId: string }> }) {
   try {
      // Verificar autenticação
      const session = await getAuthSession();

      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      const { turmaId } = await params;

      if (!turmaId) {
         return NextResponse.json({ error: "ID da turma é obrigatório" }, { status: 400 });
      }

      // Buscar listas da turma
      const listas = await listaExerciciosRepository.findByTurma(turmaId, session.id);

      return NextResponse.json(listas, { status: 200 });
   } catch (error: unknown) {
      console.error("Erro ao buscar listas da turma:", error);
      return NextResponse.json(
         { error: "Erro interno do servidor", details: error instanceof Error ? error.message : "Erro desconhecido" },
         { status: 500 }
      );
   }
}
