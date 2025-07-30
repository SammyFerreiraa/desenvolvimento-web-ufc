import { prisma } from "@/server/config/prisma";
import { gerarCodigoAcesso } from "@/server/utils/codigo-acesso";
import type { SerieLevel } from "@prisma/client";
import { UserRole } from "@prisma/client";

export const turmasRepository = {
   // Listar turmas do professor
   findByProfessor: async (professorId: string, page = 0, limit = 10) => {
      const offset = page * limit;

      const [turmas, total] = await Promise.all([
         prisma.turma.findMany({
            where: { professorId },
            include: {
               _count: {
                  select: {
                     alunos: true,
                     listas: true
                  }
               }
            },
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit
         }),
         prisma.turma.count({
            where: { professorId }
         })
      ]);

      return {
         turmas,
         total,
         hasNext: offset + limit < total,
         hasPrev: page > 0
      };
   },

   // Listar todas as turmas (apenas admin)
   findAll: async (page = 0, limit = 10) => {
      const offset = page * limit;

      const [turmas, total] = await Promise.all([
         prisma.turma.findMany({
            include: {
               professor: {
                  select: {
                     id: true,
                     name: true,
                     email: true
                  }
               },
               _count: {
                  select: {
                     alunos: true,
                     listas: true
                  }
               }
            },
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit
         }),
         prisma.turma.count()
      ]);

      return {
         turmas,
         total,
         hasNext: offset + limit < total,
         hasPrev: page > 0
      };
   },

   // Buscar turma por ID
   findById: async (id: string, professorId?: string) => {
      const where = professorId
         ? { id, professorId } // Professor só vê suas turmas
         : { id }; // Admin vê qualquer turma

      return await prisma.turma.findUnique({
         where,
         include: {
            professor: {
               select: {
                  id: true,
                  name: true,
                  email: true
               }
            },
            alunos: {
               select: {
                  id: true,
                  name: true,
                  email: true,
                  profile: {
                     select: {
                        responsavel: true,
                        dataNascimento: true,
                        codigoAcesso: true
                     }
                  }
               }
            },
            listas: {
               select: {
                  id: true,
                  titulo: true,
                  status: true,
                  createdAt: true
               }
            },
            _count: {
               select: {
                  alunos: true,
                  listas: true
               }
            }
         }
      });
   },

   // Criar nova turma
   create: async (
      data: {
         nome: string;
         serie: SerieLevel;
         anoLetivo: number;
      },
      professorId: string
   ) => {
      return await prisma.turma.create({
         data: {
            ...data,
            professorId
         },
         include: {
            _count: {
               select: {
                  alunos: true,
                  listas: true
               }
            }
         }
      });
   },

   // Atualizar turma
   update: async (
      id: string,
      data: {
         nome?: string;
         serie?: SerieLevel;
         anoLetivo?: number;
         ativa?: boolean;
      },
      professorId?: string
   ) => {
      const where = professorId
         ? { id, professorId } // Professor só edita suas turmas
         : { id }; // Admin edita qualquer turma

      return await prisma.turma.update({
         where,
         data,
         include: {
            _count: {
               select: {
                  alunos: true,
                  listas: true
               }
            }
         }
      });
   },

   // Excluir turma (soft delete)
   delete: async (id: string, professorId?: string) => {
      const where = professorId
         ? { id, professorId } // Professor só exclui suas turmas
         : { id }; // Admin exclui qualquer turma

      return await prisma.turma.delete({
         where
      });
   },

   // Adicionar alunos à turma
   addAlunos: async (turmaId: string, alunosIds: string[], professorId?: string) => {
      // Verificar se professor tem permissão para editar a turma
      if (professorId) {
         const turma = await prisma.turma.findFirst({
            where: { id: turmaId, professorId }
         });
         if (!turma) {
            throw new Error("Turma não encontrada ou sem permissão");
         }
      }

      // Verificar se os usuários são alunos
      const alunos = await prisma.user.findMany({
         where: {
            id: { in: alunosIds },
            role: UserRole.ALUNO
         }
      });

      if (alunos.length !== alunosIds.length) {
         throw new Error("Alguns usuários não são alunos válidos");
      }

      return await prisma.turma.update({
         where: { id: turmaId },
         data: {
            alunos: {
               connect: alunosIds.map((id) => ({ id }))
            }
         },
         include: {
            alunos: {
               select: {
                  id: true,
                  name: true,
                  email: true
               }
            }
         }
      });
   },

   // Remover alunos da turma
   removeAlunos: async (turmaId: string, alunosIds: string[], professorId?: string) => {
      // Verificar se professor tem permissão para editar a turma
      if (professorId) {
         const turma = await prisma.turma.findFirst({
            where: { id: turmaId, professorId }
         });
         if (!turma) {
            throw new Error("Turma não encontrada ou sem permissão");
         }
      }

      return await prisma.turma.update({
         where: { id: turmaId },
         data: {
            alunos: {
               disconnect: alunosIds.map((id) => ({ id }))
            }
         },
         include: {
            alunos: {
               select: {
                  id: true,
                  name: true,
                  email: true
               }
            }
         }
      });
   },

   // Buscar turmas do aluno
   findByAluno: async (alunoId: string) => {
      return await prisma.turma.findMany({
         where: {
            alunos: {
               some: { id: alunoId }
            },
            ativa: true
         },
         include: {
            professor: {
               select: {
                  id: true,
                  name: true,
                  email: true
               }
            },
            _count: {
               select: {
                  alunos: true,
                  listas: true
               }
            }
         },
         orderBy: { createdAt: "desc" }
      });
   },

   // Cadastrar novo aluno na turma
   cadastrarAluno: async (data: {
      nome: string;
      dataNascimento?: Date;
      responsavel: string;
      turmaId: string;
      professorId?: string;
   }) => {
      const { nome, dataNascimento, responsavel, turmaId, professorId } = data;

      // Verificar se a turma existe e pertence ao professor (se não for admin)
      const turma = await prisma.turma.findFirst({
         where: {
            id: turmaId,
            ...(professorId && { professorId })
         }
      });

      if (!turma) {
         throw new Error("Turma não encontrada ou você não tem permissão para gerenciá-la");
      }

      // Gerar código de acesso único
      let codigoAcesso: string;
      let tentativas = 0;
      const maxTentativas = 10;

      do {
         codigoAcesso = gerarCodigoAcesso();
         tentativas++;

         const existeProfile = await prisma.userProfile.findUnique({
            where: { codigoAcesso }
         });

         if (!existeProfile) break;

         if (tentativas >= maxTentativas) {
            throw new Error("Não foi possível gerar um código único. Tente novamente.");
         }
      } while (tentativas < maxTentativas);

      // Criar usuário aluno
      const usuario = await prisma.user.create({
         data: {
            name: nome,
            email: `${codigoAcesso.toLowerCase()}@aluno.edu`,
            role: UserRole.ALUNO,
            profile: {
               create: {
                  dataNascimento,
                  responsavel,
                  codigoAcesso,
                  ativo: true
               }
            }
         },
         include: {
            profile: true
         }
      });

      // Matricular o aluno na turma
      await prisma.turma.update({
         where: { id: turmaId },
         data: {
            alunos: {
               connect: { id: usuario.id }
            }
         }
      });

      return {
         id: usuario.id,
         nome: usuario.name,
         codigoAcesso,
         responsavel,
         dataNascimento,
         email: usuario.email
      };
   },

   // Atualizar dados do aluno
   updateAluno: async (
      alunoId: string,
      data: {
         nome: string;
         responsavel: string;
         dataNascimento?: Date;
      },
      professorId?: string
   ) => {
      // Se for professor, verificar se o aluno está em uma turma dele
      if (professorId) {
         const alunoNaTurma = await prisma.user.findFirst({
            where: {
               id: alunoId,
               turmasParticipa: {
                  some: {
                     professorId
                  }
               }
            }
         });

         if (!alunoNaTurma) {
            throw new Error("Aluno não encontrado ou sem permissão para editar");
         }
      }

      // Atualizar dados do usuário
      const usuario = await prisma.user.update({
         where: { id: alunoId },
         data: {
            name: data.nome
         }
      });

      // Atualizar perfil do aluno
      const profile = await prisma.userProfile.upsert({
         where: { userId: alunoId },
         update: {
            responsavel: data.responsavel,
            dataNascimento: data.dataNascimento
         },
         create: {
            userId: alunoId,
            responsavel: data.responsavel,
            dataNascimento: data.dataNascimento
         }
      });

      return {
         id: usuario.id,
         nome: usuario.name,
         responsavel: profile.responsavel,
         dataNascimento: profile.dataNascimento,
         codigoAcesso: profile.codigoAcesso
      };
   }
};
