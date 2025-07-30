import { z } from "zod";
import { checkPermission, Permissions } from "@/common/permissions";
import { cadastrarAlunoSchema, editarAlunoSchema } from "@/common/schemas/aluno";
import { gerenciarAlunosTurmaSchema, turmaCreateSchema, turmaUpdateSchema } from "@/common/schemas/edu-plus";
import { createTRPCRouter, procedures } from "@/server/config/trpc";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { turmasRepository } from "./repository";

const p = procedures.protected;

export const turmasRouter = createTRPCRouter({
   // Listar turmas baseado no role do usuário
   list: p
      .input(
         z.object({
            page: z.number().min(0).default(0),
            limit: z.number().min(1).max(50).default(10)
         })
      )
      .query(async ({ ctx, input }) => {
         const { session } = ctx;
         const { page, limit } = input;

         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Sessão não encontrada"
            });
         }

         switch (session.role) {
            case UserRole.ADMIN:
               // Admin vê todas as turmas
               return await turmasRepository.findAll(page, limit);

            case UserRole.PROFESSOR:
               // Professor vê apenas suas turmas
               return await turmasRepository.findByProfessor(session.id, page, limit);

            case UserRole.ALUNO: {
               // Aluno vê apenas suas turmas
               const turmas = await turmasRepository.findByAluno(session.id);
               return {
                  turmas,
                  total: turmas.length,
                  hasNext: false,
                  hasPrev: false
               };
            }

            default:
               throw new TRPCError({
                  code: "FORBIDDEN",
                  message: "Acesso negado"
               });
         }
      }),

   // Buscar turma por ID
   byId: p.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
      const { session } = ctx;
      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado"
         });
      }
      const { id } = input;

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      const turma = await turmasRepository.findById(id, professorId);

      if (!turma) {
         throw new TRPCError({
            code: "NOT_FOUND",
            message: "Turma não encontrada"
         });
      }

      // Verificar se aluno tem acesso à turma
      if (session.role === UserRole.ALUNO) {
         const hasAccess = turma.alunos.some((aluno) => aluno.id === session.id);
         if (!hasAccess) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Acesso negado a esta turma"
            });
         }
      }

      return turma;
   }),

   // Criar nova turma (apenas professores e admins)
   create: p.input(turmaCreateSchema).mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Sessão não encontrada"
         });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.CREATE_TURMA])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para criar turmas"
         });
      }

      try {
         return await turmasRepository.create(input, session.id);
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar turma"
         });
      }
   }),

   // Atualizar turma
   update: p
      .input(
         z.object({
            id: z.string().uuid(),
            data: turmaUpdateSchema
         })
      )
      .mutation(async ({ ctx, input }) => {
         const { session } = ctx;
         const { id, data } = input;

         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Sessão não encontrada"
            });
         }

         // Verificar permissões
         if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Sem permissão para editar turmas"
            });
         }

         try {
            const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
            return await turmasRepository.update(id, data, professorId);
         } catch (_error) {
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Erro ao atualizar turma"
            });
         }
      }),

   delete: p.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { id } = input;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Sessão não encontrada"
         });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para excluir turmas"
         });
      }

      try {
         const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
         return await turmasRepository.delete(id, professorId);
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao excluir turma"
         });
      }
   }),

   // Adicionar alunos à turma
   addAlunos: p.input(gerenciarAlunosTurmaSchema).mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { turmaId, alunosIds } = input;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Sessão não encontrada"
         });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para gerenciar alunos da turma"
         });
      }

      try {
         const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
         return await turmasRepository.addAlunos(turmaId, alunosIds, professorId);
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: _error instanceof Error ? _error.message : "Erro ao adicionar alunos"
         });
      }
   }),

   // Remover alunos da turma
   removeAlunos: p.input(gerenciarAlunosTurmaSchema).mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { turmaId, alunosIds } = input;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Sessão não encontrada"
         });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para gerenciar alunos da turma"
         });
      }

      try {
         const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
         return await turmasRepository.removeAlunos(turmaId, alunosIds, professorId);
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: _error instanceof Error ? _error.message : "Erro ao remover alunos"
         });
      }
   }),

   // Remover um único aluno da turma
   removeAluno: p
      .input(
         z.object({
            turmaId: z.string().uuid("ID da turma inválido"),
            alunoId: z.string().uuid("ID do aluno inválido")
         })
      )
      .mutation(async ({ ctx, input }) => {
         const { session } = ctx;
         const { turmaId, alunoId } = input;

         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Sessão não encontrada"
            });
         }

         // Verificar permissões
         if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Sem permissão para remover alunos da turma"
            });
         }

         try {
            const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
            return await turmasRepository.removeAlunos(turmaId, [alunoId], professorId);
         } catch (_error) {
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: _error instanceof Error ? _error.message : "Erro ao remover aluno"
            });
         }
      }),

   // Cadastrar novo aluno na turma
   cadastrarAluno: p.input(cadastrarAlunoSchema).mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { nome, dataNascimento, responsavel, turmaId } = input;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Sessão não encontrada"
         });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para cadastrar alunos"
         });
      }

      try {
         const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
         return await turmasRepository.cadastrarAluno({
            nome,
            dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
            responsavel,
            turmaId,
            professorId
         });
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: _error instanceof Error ? _error.message : "Erro ao cadastrar aluno"
         });
      }
   }),

   // Editar dados do aluno
   editarAluno: p.input(editarAlunoSchema).mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { id, nome, dataNascimento, responsavel } = input;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Sessão não encontrada"
         });
      }

      // Verificar permissões
      if (!checkPermission(session.role, [Permissions.MANAGE_TURMA])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para editar alunos"
         });
      }

      try {
         const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
         return await turmasRepository.updateAluno(
            id,
            {
               nome,
               responsavel,
               dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined
            },
            professorId
         );
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: _error instanceof Error ? _error.message : "Erro ao editar aluno"
         });
      }
   })
});
