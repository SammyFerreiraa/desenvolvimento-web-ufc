import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { gerenciarAlunosTurmaSchema } from "@/common/schemas/edu-plus";
import { turmasRepository } from "@/server/routers/turmas/repository";
import { UserRole } from "@prisma/client";

// POST /api/turmas/[id]/alunos - Adicionar alunos à turma
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   try {
      const { id: turmaId } = await params;
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         return NextResponse.json({ error: "Sem permissão para gerenciar alunos da turma" }, { status: 403 });
      }

      if (!turmaId || typeof turmaId !== "string") {
         return NextResponse.json({ error: "ID da turma inválido" }, { status: 400 });
      }

      const body = await request.json();
      const validatedData = gerenciarAlunosTurmaSchema.parse({
         turmaId,
         alunosIds: body.alunosIds
      });

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      const result = await turmasRepository.addAlunos(validatedData.turmaId, validatedData.alunosIds, professorId);

      return NextResponse.json(result);
   } catch (error) {
      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      console.error("Erro ao adicionar alunos:", error);
      return NextResponse.json(
         {
            error: error instanceof Error ? error.message : "Erro ao adicionar alunos"
         },
         { status: 500 }
      );
   }
}

// DELETE /api/turmas/[id]/alunos - Remover alunos da turma
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
   try {
      const { id: turmaId } = await params;
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         return NextResponse.json({ error: "Sem permissão para gerenciar alunos da turma" }, { status: 403 });
      }

      if (!turmaId || typeof turmaId !== "string") {
         return NextResponse.json({ error: "ID da turma inválido" }, { status: 400 });
      }

      const body = await request.json();
      const validatedData = gerenciarAlunosTurmaSchema.parse({
         turmaId,
         alunosIds: body.alunosIds
      });

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      const result = await turmasRepository.removeAlunos(validatedData.turmaId, validatedData.alunosIds, professorId);

      return NextResponse.json(result);
   } catch (error) {
      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      console.error("Erro ao remover alunos:", error);
      return NextResponse.json(
         {
            error: error instanceof Error ? error.message : "Erro ao remover alunos"
         },
         { status: 500 }
      );
   }
}
