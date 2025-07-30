import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { questaoCreateSchema } from "@/common/schemas/edu-plus";
import { questoesRepository } from "@/server/routers/questoes/repository";
import type { HabilidadeBNCC, QuestionType, SerieLevel } from "@prisma/client";

export async function GET(request: NextRequest) {
   try {
      // Verificar autenticação
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.READ])) {
         return NextResponse.json({ error: "Sem permissão para visualizar questões" }, { status: 403 });
      }

      // Extrair parâmetros de busca
      const { searchParams } = new URL(request.url);
      const serie = searchParams.get("serie") as SerieLevel | undefined;
      const tipo = searchParams.get("tipo") as QuestionType | undefined;
      const habilidade = searchParams.get("habilidade") as HabilidadeBNCC | undefined;
      const search = searchParams.get("search") || undefined;
      const page = parseInt(searchParams.get("page") || "0");
      const limit = parseInt(searchParams.get("limit") || "10");

      // Buscar questões do professor
      const result = await questoesRepository.findByProfessor(session.id, {
         serie,
         tipo,
         habilidade,
         search,
         page,
         limit
      });

      return NextResponse.json(result);
   } catch (error) {
      console.error("Erro ao listar questões:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}

export async function POST(request: NextRequest) {
   try {
      // Verificar autenticação
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.CREATE])) {
         return NextResponse.json({ error: "Sem permissão para criar questões" }, { status: 403 });
      }

      // Validar dados de entrada
      const body = await request.json();
      const validatedData = questaoCreateSchema.parse(body);

      // Criar questão
      const questao = await questoesRepository.create(validatedData, session.id);

      return NextResponse.json(questao, { status: 201 });
   } catch (error) {
      console.error("Erro ao criar questão:", error);

      if (error instanceof Error && error.name === "ZodError") {
         return NextResponse.json({ error: "Dados inválidos", details: error.message }, { status: 400 });
      }

      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
