import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/server/config/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ alunoId: string }> }) {
   try {
      const { alunoId } = await params;

      // Verificar se o aluno existe e obter sua turma
      const aluno = await prisma.user.findUnique({
         where: { id: alunoId },
         include: {
            turmasParticipa: {
               select: { id: true }
            }
         }
      });

      if (!aluno || aluno.role !== "ALUNO") {
         return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }

      const turmaId = aluno.turmasParticipa[0]?.id;
      if (!turmaId) {
         return NextResponse.json({ error: "Aluno não está matriculado em uma turma" }, { status: 400 });
      }

      // Buscar todos os alunos da turma com suas estatísticas
      const alunosDaTurma = await prisma.user.findMany({
         where: {
            role: "ALUNO",
            turmasParticipa: {
               some: { id: turmaId }
            }
         },
         include: {
            respostas: {
               select: {
                  id: true,
                  correta: true,
                  questaoId: true
               }
            }
         }
      });

      // Calcular estatísticas e montar ranking
      const rankingData = alunosDaTurma.map((alunoItem) => {
         const tentativas = alunoItem.respostas;
         const totalTentativas = tentativas.length;
         const totalAcertos = tentativas.filter((t) => t.correta).length;
         const percentualAcerto = totalTentativas > 0 ? (totalAcertos / totalTentativas) * 100 : 0;
         const questoesRespondidas = new Set(tentativas.map((t) => t.questaoId)).size;

         return {
            aluno: {
               id: alunoItem.id,
               nome: alunoItem.name || "Aluno"
            },
            estatisticas: {
               totalAcertos,
               percentualAcerto: Math.round(percentualAcerto * 100) / 100,
               questoesRespondidas,
               medalhas: 0 // Implementar sistema de medalhas posteriormente
            }
         };
      });

      // Ordenar por critérios de ranking
      // 1º: Maior percentual de acerto
      // 2º: Maior número de acertos
      // 3º: Maior número de questões respondidas
      const rankingOrdenado = rankingData
         .sort((a, b) => {
            // Primeiro critério: percentual de acerto
            if (b.estatisticas.percentualAcerto !== a.estatisticas.percentualAcerto) {
               return b.estatisticas.percentualAcerto - a.estatisticas.percentualAcerto;
            }

            // Segundo critério: total de acertos
            if (b.estatisticas.totalAcertos !== a.estatisticas.totalAcertos) {
               return b.estatisticas.totalAcertos - a.estatisticas.totalAcertos;
            }

            // Terceiro critério: questões respondidas
            return b.estatisticas.questoesRespondidas - a.estatisticas.questoesRespondidas;
         })
         .map((item, index) => ({
            posicao: index + 1,
            ...item
         }));

      return NextResponse.json(rankingOrdenado);
   } catch (error) {
      console.error("Erro ao buscar ranking:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
