import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { cadastrarAlunoSchema, editarAlunoSchema } from "@/common/schemas/aluno";
import { turmasRepository } from "@/server/routers/turmas/repository";
import { UserRole } from "@prisma/client";

// POST /api/turmas/alunos - Cadastrar novo aluno
export async function POST(request: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         return NextResponse.json({ error: "Sem permissão para cadastrar alunos" }, { status: 403 });
      }

      const body = await request.json();
      const validatedData = cadastrarAlunoSchema.parse(body);

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      const aluno = await turmasRepository.cadastrarAluno({
         nome: validatedData.nome,
         dataNascimento: validatedData.dataNascimento ? new Date(validatedData.dataNascimento) : undefined,
         responsavel: validatedData.responsavel,
         turmaId: validatedData.turmaId,
         professorId
      });

      return NextResponse.json(aluno, { status: 201 });
   } catch (error) {
      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      console.error("Erro ao cadastrar aluno:", error);
      return NextResponse.json(
         {
            error: error instanceof Error ? error.message : "Erro ao cadastrar aluno"
         },
         { status: 500 }
      );
   }
}

// PUT /api/turmas/alunos - Editar dados do aluno
export async function PUT(request: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         return NextResponse.json({ error: "Sem permissão para editar alunos" }, { status: 403 });
      }

      const body = await request.json();
      const validatedData = editarAlunoSchema.parse(body);

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      const aluno = await turmasRepository.updateAluno(
         validatedData.id,
         {
            nome: validatedData.nome,
            responsavel: validatedData.responsavel,
            dataNascimento: validatedData.dataNascimento ? new Date(validatedData.dataNascimento) : undefined
         },
         professorId
      );

      return NextResponse.json(aluno);
   } catch (error) {
      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      console.error("Erro ao editar aluno:", error);
      return NextResponse.json(
         {
            error: error instanceof Error ? error.message : "Erro ao editar aluno"
         },
         { status: 500 }
      );
   }
}
