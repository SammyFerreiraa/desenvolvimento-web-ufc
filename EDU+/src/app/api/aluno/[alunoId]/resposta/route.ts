import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "@/config/zod-config";
import { prisma } from "@/server/config/prisma";

const respostaSchema = z.object({
   questaoId: z.string().min(1, "ID da questão é obrigatório"),
   listaId: z.string().min(1, "ID da lista é obrigatório"),
   resposta: z.string().min(1, "Resposta é obrigatória"),
   tempoResposta: z.number().min(0, "Tempo de resposta deve ser positivo").optional()
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ alunoId: string }> }) {
   try {
      const { alunoId } = await params;
      const body = await request.json();
      const { questaoId, listaId, resposta, tempoResposta } = respostaSchema.parse(body);

      // Verificar se o aluno existe
      const aluno = await prisma.user.findUnique({
         where: { id: alunoId }
      });

      if (!aluno || aluno.role !== "ALUNO") {
         return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
      }

      // Buscar a questão com as informações necessárias
      const questao = await prisma.questao.findUnique({
         where: { id: questaoId },
         select: {
            id: true,
            enunciado: true,
            tipo: true,
            gabarito: true,
            explicacao: true,
            opcoes: true
         }
      });

      if (!questao) {
         return NextResponse.json({ error: "Questão não encontrada" }, { status: 404 });
      }

      // Verificar se o aluno já possui uma tentativa de lista iniciada
      let tentativaLista = await prisma.tentativaLista.findUnique({
         where: {
            alunoId_listaId: {
               alunoId,
               listaId
            }
         }
      });

      // Se não existe, criar uma nova tentativa de lista
      if (!tentativaLista) {
         tentativaLista = await prisma.tentativaLista.create({
            data: {
               alunoId,
               listaId,
               status: "EM_PROGRESSO",
               iniciadaEm: new Date()
            }
         });
      }

      // Verificar quantas tentativas o aluno já fez nesta questão DESTA LISTA
      const tentativasAnteriores = await prisma.tentativaQuestao.findMany({
         where: {
            alunoId,
            questaoId,
            tentativaListaId: tentativaLista.id // Filtrar por lista específica
         }
      });

      const numeroTentativa = tentativasAnteriores.length + 1;

      // Determinar se a resposta está correta
      let correta = false;

      if (questao.tipo === "MULTIPLA_ESCOLHA") {
         // Para múltipla escolha, comparar o ID da opção selecionada
         correta = resposta === questao.gabarito;
      } else if (questao.tipo === "NUMERO") {
         // Para questões numéricas, comparar os valores numericamente
         const respostaNum = parseFloat(resposta.replace(",", "."));
         const gabaritoNum = parseFloat(questao.gabarito.replace(",", "."));
         correta = !isNaN(respostaNum) && !isNaN(gabaritoNum) && Math.abs(respostaNum - gabaritoNum) < 0.0001;
      } else {
         // Para outros tipos, comparação exata (case-insensitive)
         correta = resposta.toLowerCase().trim() === questao.gabarito.toLowerCase().trim();
      }

      // Calcular pontuação baseada na tentativa e se acertou
      let pontuacao = 0;
      if (correta) {
         // Pontuação decresce com mais tentativas
         pontuacao = Math.max(10 - (numeroTentativa - 1) * 2, 1);
      }

      // Criar a tentativa vinculada à lista específica
      const tentativa = await prisma.tentativaQuestao.create({
         data: {
            alunoId,
            questaoId,
            tentativaListaId: tentativaLista.id, // Importante: vincular à lista
            resposta: JSON.stringify({ valor: resposta }),
            correta,
            pontuacao,
            numeroTentativa,
            tempoResposta: tempoResposta || null
         }
      });

      // Resposta para o cliente
      const response = {
         id: tentativa.id,
         resposta: resposta,
         correta,
         tentativaNumero: numeroTentativa,
         tempoResposta: tempoResposta || 0,
         createdAt: tentativa.respondidaEm.toISOString(),
         questao: {
            id: questao.id,
            enunciado: questao.enunciado,
            tipo: questao.tipo,
            gabarito: questao.gabarito,
            explicacao: questao.explicacao,
            opcoes: questao.opcoes
         }
      };

      return NextResponse.json(response);
   } catch (error) {
      console.error("Erro ao submeter resposta:", error);

      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Dados inválidos", details: error.errors }, { status: 400 });
      }

      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
