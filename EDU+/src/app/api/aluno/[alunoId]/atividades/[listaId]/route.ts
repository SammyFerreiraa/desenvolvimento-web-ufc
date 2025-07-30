import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/server/config/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ alunoId: string; listaId: string }> }) {
   try {
      const { alunoId, listaId } = await params;

      // Verificar se o aluno existe
      const aluno = await prisma.user.findUnique({
         where: { id: alunoId }
      });

      if (!aluno || aluno.role !== "ALUNO") {
         return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }

      // Buscar a lista de exercícios específica
      const lista = await prisma.listaExercicio.findUnique({
         where: { id: listaId },
         include: {
            questoes: {
               include: {
                  questao: true
               },
               orderBy: { ordem: "asc" }
            },
            // Buscar tentativas específicas desta lista
            tentativas: {
               where: { alunoId },
               include: {
                  tentativasQuestao: true
               }
            }
         }
      });

      if (!lista) {
         return NextResponse.json({ error: "Lista de exercícios não encontrada" }, { status: 404 });
      }

      if (lista.status !== "PUBLICADO") {
         return NextResponse.json({ error: "Esta atividade ainda não está disponível" }, { status: 400 });
      }

      // Processar dados para incluir progresso
      let questoesRespondidas = 0;
      let questoesCorretas = 0;

      // Obter tentativas desta lista específica
      const tentativaLista = lista.tentativas[0]; // Só pode haver uma tentativa por aluno/lista
      const tentativasQuestoes = tentativaLista?.tentativasQuestao || [];

      const questoesComTentativas = lista.questoes.map((questaoLista) => {
         const questao = questaoLista.questao;

         // Buscar tentativas desta questão específica NESTA lista
         const tentativasDestaQuestao = tentativasQuestoes.filter((t) => t.questaoId === questao.id);
         const acertou = tentativasDestaQuestao.some((t) => t.correta);

         if (tentativasDestaQuestao.length > 0) {
            questoesRespondidas++;
            if (acertou) {
               questoesCorretas++;
            }
         }

         return {
            id: questao.id,
            enunciado: questao.enunciado,
            tipo: questao.tipo,
            opcoes: questao.opcoes,
            gabarito: questao.gabarito,
            explicacao: questao.explicacao,
            dificuldade: questao.dificuldade,
            tentativas: tentativasDestaQuestao.map((t) => ({
               id: t.id,
               resposta: t.resposta,
               correta: t.correta,
               tentativaNumero: t.numeroTentativa,
               tempoResposta: t.tempoResposta,
               createdAt: t.respondidaEm.toISOString()
            })),
            acertou,
            numeroTentativas: tentativasDestaQuestao.length
         };
      });

      const response = {
         id: lista.id,
         titulo: lista.titulo,
         descricao: lista.descricao,
         dataInicio: lista.dataLiberacao?.toISOString() || lista.createdAt.toISOString(),
         dataFim: lista.dataLimite?.toISOString(),
         ativa: lista.status === "PUBLICADO",
         questoes: questoesComTentativas,
         progresso: {
            total: lista.questoes.length,
            respondidas: questoesRespondidas,
            corretas: questoesCorretas,
            percentualAcerto: questoesRespondidas > 0 ? (questoesCorretas / questoesRespondidas) * 100 : 0
         }
      };

      return NextResponse.json(response);
   } catch (error) {
      console.error("Erro ao buscar atividade:", error);
      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
