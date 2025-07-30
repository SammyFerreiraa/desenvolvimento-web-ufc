import { prisma } from "@/server/config/prisma";
import { StudentProgressStatus, type HabilidadeBNCC } from "@prisma/client";

export const tentativasRepository = {
   // Buscar tentativa por aluno e lista
   findByAlunoAndLista: async (alunoId: string, listaId: string) => {
      return await prisma.tentativaLista.findUnique({
         where: {
            alunoId_listaId: {
               alunoId,
               listaId
            }
         },
         include: {
            tentativasQuestao: {
               include: {
                  questao: true
               }
            },
            lista: {
               include: {
                  questoes: {
                     include: {
                        questao: true
                     },
                     orderBy: { ordem: "asc" }
                  }
               }
            }
         }
      });
   },

   // Criar nova tentativa de lista
   createTentativaLista: async (alunoId: string, listaId: string) => {
      return await prisma.tentativaLista.create({
         data: {
            alunoId,
            listaId,
            status: StudentProgressStatus.EM_PROGRESSO,
            iniciadaEm: new Date()
         }
      });
   },

   // Criar tentativa de questão
   createTentativaQuestao: async (data: {
      alunoId: string;
      questaoId: string;
      tentativaListaId?: string;
      resposta: string;
      correta: boolean;
      pontuacao: number;
      tempoResposta?: number;
   }) => {
      return await prisma.tentativaQuestao.create({
         data
      });
   },

   // Atualizar tentativa de lista
   updateTentativaLista: async (
      tentativaListaId: string,
      data: {
         status?: StudentProgressStatus;
         pontuacaoTotal?: number;
         finalizadaEm?: Date;
      }
   ) => {
      return await prisma.tentativaLista.update({
         where: { id: tentativaListaId },
         data
      });
   },

   // Buscar tentativas por aluno com paginação
   findByAluno: async (alunoId: string, page: number = 0, limit: number = 10) => {
      const offset = page * limit;

      const tentativas = await prisma.tentativaLista.findMany({
         where: { alunoId },
         include: {
            lista: {
               include: {
                  turma: true
               }
            }
         },
         orderBy: { updatedAt: "desc" },
         skip: offset,
         take: limit
      });

      const total = await prisma.tentativaLista.count({
         where: { alunoId }
      });

      return {
         tentativas,
         total,
         pages: Math.ceil(total / limit)
      };
   },

   // Buscar tentativa por ID
   findById: async (tentativaListaId: string) => {
      return await prisma.tentativaLista.findUnique({
         where: { id: tentativaListaId },
         include: {
            lista: {
               include: {
                  questoes: {
                     include: {
                        questao: true
                     },
                     orderBy: { ordem: "asc" }
                  }
               }
            },
            tentativasQuestao: {
               include: {
                  questao: true
               }
            }
         }
      });
   },

   // Atualizar ou criar desempenho de habilidade
   upsertDesempenhoHabilidade: async (alunoId: string, habilidade: HabilidadeBNCC, correta: boolean) => {
      const desempenhoAtual = await prisma.desempenhoHabilidade.findUnique({
         where: {
            alunoId_habilidade: {
               alunoId,
               habilidade
            }
         }
      });

      if (desempenhoAtual) {
         const novoTotalTentativas = desempenhoAtual.totalTentativas + 1;
         const novosAcertos = correta ? desempenhoAtual.acertos + 1 : desempenhoAtual.acertos;
         const novoPercentual = (novosAcertos / novoTotalTentativas) * 100;

         return await prisma.desempenhoHabilidade.update({
            where: {
               alunoId_habilidade: {
                  alunoId,
                  habilidade
               }
            },
            data: {
               totalTentativas: novoTotalTentativas,
               acertos: novosAcertos,
               percentualAcerto: novoPercentual,
               ultimaAtualizacao: new Date()
            }
         });
      } else {
         return await prisma.desempenhoHabilidade.create({
            data: {
               alunoId,
               habilidade,
               totalTentativas: 1,
               acertos: correta ? 1 : 0,
               percentualAcerto: correta ? 100 : 0
            }
         });
      }
   },

   // Buscar questão com validação de acesso
   findQuestaoComAcesso: async (questaoId: string, alunoId: string) => {
      return await prisma.questao.findFirst({
         where: {
            id: questaoId,
            listas: {
               some: {
                  lista: {
                     status: "PUBLICADO",
                     turma: {
                        alunos: {
                           some: { id: alunoId }
                        }
                     }
                  }
               }
            }
         }
      });
   },

   // Verificar se lista está disponível para aluno
   findListaComAcesso: async (listaId: string, alunoId: string) => {
      return await prisma.listaExercicio.findFirst({
         where: {
            id: listaId,
            status: "PUBLICADO",
            turma: {
               alunos: {
                  some: { id: alunoId }
               }
            }
         },
         include: {
            questoes: {
               include: {
                  questao: true
               },
               orderBy: { ordem: "asc" }
            }
         }
      });
   }
};
