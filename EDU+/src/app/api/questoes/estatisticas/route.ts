import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthSession } from "@/common/auth";
import { checkPermission, Permissions } from "@/common/permissions";
import { questoesRepository } from "@/server/routers/questoes/repository";

export async function GET(_request: NextRequest) {
   try {
      // Verificar autenticação
      const session = await getAuthSession();
      if (!session) {
         return NextResponse.json({ error: "Usuário não autenticado" }, { status: 401 });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.READ])) {
         return NextResponse.json({ error: "Sem permissão para visualizar estatísticas" }, { status: 403 });
      }

      // Buscar estatísticas das questões do professor
      const estatisticas = await questoesRepository.getEstatisticas(session.id);

      return NextResponse.json(estatisticas);
   } catch (error) {
      console.error("Erro ao buscar estatísticas das questões:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
