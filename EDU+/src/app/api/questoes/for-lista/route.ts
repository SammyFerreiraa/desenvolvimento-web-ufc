import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { questoesRepository } from "@/server/routers/questoes/repository";
import type { HabilidadeBNCC, SerieLevel } from "@prisma/client";

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
      const serie = searchParams.get("serie") as SerieLevel;
      const habilidadesParam = searchParams.get("habilidades");
      const excludeIdsParam = searchParams.get("excludeIds");
      const search = searchParams.get("search") || undefined;
      const limit = parseInt(searchParams.get("limit") || "20");

      if (!serie) {
         return NextResponse.json({ error: "Parâmetro 'serie' é obrigatório" }, { status: 400 });
      }

      // Processar habilidades
      const habilidades = habilidadesParam ? (habilidadesParam.split(",") as HabilidadeBNCC[]) : undefined;

      // Processar IDs para excluir
      const excludeIds = excludeIdsParam ? excludeIdsParam.split(",") : undefined;

      // Buscar questões para lista
      const questoes = await questoesRepository.findForLista({
         serie,
         habilidades,
         professorId: session.id,
         excludeIds,
         search,
         limit
      });

      return NextResponse.json(questoes);
   } catch (error) {
      console.error("Erro ao buscar questões para lista:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
