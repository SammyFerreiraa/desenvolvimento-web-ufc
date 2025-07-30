import { prisma } from "@/server/config/prisma";
import type { ExerciseStatus } from "@prisma/client";

export const listaExerciciosRepository = {
   async create(data: {
      titulo: string;
      descricao?: string;
      turmaId: string;
      professorId: string;
      questoesIds: string[];
      dataLiberacao?: string;
      dataLimite?: string;
   }) {
      return await prisma.listaExercicio.create({
         data: {
            titulo: data.titulo,
            descricao: data.descricao,
            turmaId: data.turmaId,
            professorId: data.professorId,
            dataLiberacao: data.dataLiberacao ? new Date(data.dataLiberacao) : null,
            dataLimite: data.dataLimite ? new Date(data.dataLimite) : null,
            status: "PUBLICADO" as ExerciseStatus,
            questoes: {
               create: data.questoesIds.map((questaoId, index) => ({
                  questaoId,
                  ordem: index + 1
               }))
            }
         },
         include: {
            questoes: {
               include: {
                  questao: true
               },
               orderBy: {
                  ordem: "asc"
               }
            },
            turma: true,
            professor: true
         }
      });
   },

   async findByTurma(turmaId: string, professorId: string) {
      return await prisma.listaExercicio.findMany({
         where: {
            turmaId,
            professorId
         },
         include: {
            questoes: {
               include: {
                  questao: true
               },
               orderBy: {
                  ordem: "asc"
               }
            },
            _count: {
               select: {
                  tentativas: true
               }
            }
         },
         orderBy: {
            createdAt: "desc"
         }
      });
   },

   async findById(id: string, professorId: string) {
      return await prisma.listaExercicio.findFirst({
         where: {
            id,
            professorId
         },
         include: {
            questoes: {
               include: {
                  questao: true
               },
               orderBy: {
                  ordem: "asc"
               }
            },
            turma: true,
            tentativas: {
               include: {
                  aluno: true
               }
            }
         }
      });
   },

   async update(
      id: string,
      professorId: string,
      data: {
         titulo?: string;
         descricao?: string;
         dataLiberacao?: string;
         dataLimite?: string;
         questoesIds?: string[];
         status?: ExerciseStatus;
      }
   ) {
      // Se questoesIds foi fornecido, precisamos atualizar as questões
      if (data.questoesIds) {
         // Usar transação para garantir consistência
         return await prisma.$transaction(async (tx) => {
            // Primeiro, remover todas as questões existentes
            await tx.questaoLista.deleteMany({
               where: {
                  listaId: id
               }
            });

            // Depois, adicionar as novas questões
            if (data.questoesIds && data.questoesIds.length > 0) {
               await tx.questaoLista.createMany({
                  data: data.questoesIds.map((questaoId, index) => ({
                     listaId: id,
                     questaoId: questaoId,
                     ordem: index + 1
                  }))
               });
            }

            // Por fim, atualizar os dados da lista
            return await tx.listaExercicio.update({
               where: {
                  id,
                  professorId
               },
               data: {
                  titulo: data.titulo,
                  descricao: data.descricao,
                  dataLiberacao: data.dataLiberacao ? new Date(data.dataLiberacao) : undefined,
                  dataLimite: data.dataLimite ? new Date(data.dataLimite) : undefined,
                  status: data.status
               },
               include: {
                  questoes: {
                     include: {
                        questao: true
                     },
                     orderBy: {
                        ordem: "asc"
                     }
                  },
                  turma: true
               }
            });
         });
      } else {
         // Se não há questões para atualizar, apenas atualizar os dados básicos
         return await prisma.listaExercicio.update({
            where: {
               id,
               professorId
            },
            data: {
               titulo: data.titulo,
               descricao: data.descricao,
               dataLiberacao: data.dataLiberacao ? new Date(data.dataLiberacao) : undefined,
               dataLimite: data.dataLimite ? new Date(data.dataLimite) : undefined,
               status: data.status
            },
            include: {
               questoes: {
                  include: {
                     questao: true
                  },
                  orderBy: {
                     ordem: "asc"
                  }
               },
               turma: true
            }
         });
      }
   },

   async delete(id: string, professorId: string) {
      // Usar transação para garantir integridade referencial
      return await prisma.$transaction(async (tx) => {
         // Primeiro, deletar todas as questões relacionadas
         await tx.questaoLista.deleteMany({
            where: {
               listaId: id
            }
         });

         // Depois, deletar todas as tentativas relacionadas
         await tx.tentativaLista.deleteMany({
            where: {
               listaId: id
            }
         });

         // Por fim, deletar a lista
         return await tx.listaExercicio.delete({
            where: {
               id,
               professorId
            }
         });
      });
   }
};
