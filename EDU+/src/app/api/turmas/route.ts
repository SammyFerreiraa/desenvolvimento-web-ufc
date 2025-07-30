import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { turmaCreateSchema } from "@/common/schemas/edu-plus";
import { turmasRepository } from "@/server/routers/turmas/repository";
import { UserRole } from "@prisma/client";

// GET /api/turmas - Listar turmas
export async function GET(request: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "0");
      const limit = parseInt(searchParams.get("limit") || "10");

      if (page < 0 || limit < 1 || limit > 50) {
         return NextResponse.json({ error: "Parâmetros de paginação inválidos" }, { status: 400 });
      }

      let result;

      switch (session.role) {
         case UserRole.ADMIN:
            // Admin vê todas as turmas
            result = await turmasRepository.findAll(page, limit);
            break;

         case UserRole.PROFESSOR:
            // Professor vê apenas suas turmas
            result = await turmasRepository.findByProfessor(session.id, page, limit);
            break;

         default:
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }

      return NextResponse.json(result);
   } catch (error) {
      console.error("Erro ao listar turmas:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}

// POST /api/turmas - Criar nova turma
export async function POST(request: NextRequest) {
   try {
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Sessão inválida ou expirada" }, { status: 401 });
      }

      if (!checkPermission(session.role, [Permissions.CREATE_TURMA])) {
         return NextResponse.json({ error: "Sem permissão para criar turmas" }, { status: 403 });
      }

      const body = await request.json();
      const validatedData = turmaCreateSchema.parse(body);

      const turma = await turmasRepository.create(validatedData, session.id);

      return NextResponse.json(turma, { status: 201 });
   } catch (error) {
      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      console.error("Erro ao criar turma:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
