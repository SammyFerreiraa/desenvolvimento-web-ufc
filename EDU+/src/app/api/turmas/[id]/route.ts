import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { turmaUpdateSchema } from "@/common/schemas/edu-plus";
import { turmasRepository } from "@/server/routers/turmas/repository";
import { UserRole } from "@prisma/client";

// GET /api/turmas/[id] - Buscar turma por ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   try {
      const { id } = await params;
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      if (!id || typeof id !== "string") {
         return NextResponse.json({ error: "ID da turma inválido" }, { status: 400 });
      }

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      const turma = await turmasRepository.findById(id, professorId);

      if (!turma) {
         return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 });
      }

      if (session.role === UserRole.ALUNO) {
         const hasAccess = turma.alunos.some((aluno) => aluno.id === session.id);
         if (!hasAccess) {
            return NextResponse.json({ error: "Acesso negado a esta turma" }, { status: 403 });
         }
      }

      return NextResponse.json(turma);
   } catch (error) {
      console.error("Erro ao buscar turma:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}

// PUT /api/turmas/[id] - Atualizar turma
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   try {
      const { id } = await params;
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         return NextResponse.json({ error: "Sem permissão para editar turmas" }, { status: 403 });
      }

      if (!id || typeof id !== "string") {
         return NextResponse.json({ error: "ID da turma inválido" }, { status: 400 });
      }

      const body = await request.json();
      const validatedData = turmaUpdateSchema.parse(body);

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      const turma = await turmasRepository.update(id, validatedData, professorId);

      return NextResponse.json(turma);
   } catch (error) {
      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      console.error("Erro ao atualizar turma:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}

// DELETE /api/turmas/[id] - Excluir turma
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   try {
      const { id } = await params;
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         return NextResponse.json({ error: "Sem permissão para excluir turmas" }, { status: 403 });
      }

      if (!id || typeof id !== "string") {
         return NextResponse.json({ error: "ID da turma inválido" }, { status: 400 });
      }

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      await turmasRepository.delete(id, professorId);

      return NextResponse.json({ success: true, message: "Turma excluída com sucesso" });
   } catch (error) {
      console.error("Erro ao excluir turma:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
