import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { questaoUpdateSchema } from "@/common/schemas/edu-plus";
import { questoesRepository } from "@/server/routers/questoes/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
   try {
      const params = await context.params;
      // Verificar autenticação
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.READ])) {
         return NextResponse.json({ error: "Sem permissão para visualizar questões" }, { status: 403 });
      }

      const questaoId = params.id;

      // Buscar questão
      const questao = await questoesRepository.findById(questaoId);
      if (!questao) {
         return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 });
      }

      // Verificar se a questão pertence ao professor
      if (questao.professorId !== session.id) {
         return NextResponse.json({ error: "Sem permissão para visualizar esta questão" }, { status: 403 });
      }

      return NextResponse.json(questao);
   } catch (error) {
      console.error("Erro ao buscar questão:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
   try {
      const params = await context.params;
      // Verificar autenticação
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.UPDATE])) {
         return NextResponse.json({ error: "Sem permissão para editar questões" }, { status: 403 });
      }

      const questaoId = params.id;

      // Verificar se a questão existe e pertence ao professor
      const questaoExistente = await questoesRepository.findById(questaoId);
      if (!questaoExistente) {
         return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 });
      }

      if (questaoExistente.professorId !== session.id) {
         return NextResponse.json({ error: "Sem permissão para editar esta questão" }, { status: 403 });
      }

      // Validar dados de entrada
      const body = await request.json();
      const validatedData = questaoUpdateSchema.parse(body);

      // Atualizar questão
      const questaoAtualizada = await questoesRepository.update(questaoId, validatedData);

      return NextResponse.json(questaoAtualizada);
   } catch (error) {
      console.error("Erro ao atualizar questão:", error);

      if (error instanceof Error && error.name === "ZodError") {
         return NextResponse.json({ error: "Dados inválidos", details: error.message }, { status: 400 });
      }

      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
   try {
      const params = await context.params;
      // Verificar autenticação
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.DELETE])) {
         return NextResponse.json({ error: "Sem permissão para excluir questões" }, { status: 403 });
      }

      const questaoId = params.id;

      // Verificar se a questão existe e pertence ao professor
      const questaoExistente = await questoesRepository.findById(questaoId);
      if (!questaoExistente) {
         return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 });
      }

      if (questaoExistente.professorId !== session.id) {
         return NextResponse.json({ error: "Sem permissão para excluir esta questão" }, { status: 403 });
      }

      // Excluir questão (soft delete)
      await questoesRepository.delete(questaoId, session.id);

      return NextResponse.json({ success: true });
   } catch (error) {
      console.error("Erro ao excluir questão:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
