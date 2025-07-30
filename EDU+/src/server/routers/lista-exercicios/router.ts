import { z } from "zod";
import { checkPermission, Permissions } from "@/common/permissions";
import { listaExerciciosCreateSchema } from "@/common/schemas/edu-plus";
import { createTRPCRouter, procedures } from "@/server/config/trpc";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { listaExerciciosRepository } from "./repository";

const p = procedures.protected;

export const listaExerciciosRouter = createTRPCRouter({
   // Listar listas de exercícios do professor ou da turma
   list: p
      .input(
         z
            .object({
               turmaId: z.string().optional(),
               ativo: z.boolean().optional(),
               search: z.string().optional(),
               limit: z.number().min(1).max(100).default(50),
               cursor: z.string().optional()
            })
            .optional()
      )
      .query(async ({ ctx, input: _input }) => {
         const { session } = ctx;

         if (!session) {
            throw new Error("Não autenticado");
         }

         // TODO: Implementar via repository
         throw new Error("Função ainda não implementada - aguardando implementação dos repositories");
      }),

   // Buscar uma lista específica com detalhes
   byId: p.input(z.string()).query(async ({ ctx, input: _input }) => {
      const { session } = ctx;

      if (!session) {
         throw new Error("Não autenticado");
      }

      // TODO: Implementar via repository
      throw new Error("Função ainda não implementada - aguardando implementação dos repositories");
   }),

   // Criar nova lista de exercícios
   create: p.input(listaExerciciosCreateSchema).mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado"
         });
      }

      if (!checkPermission(session.role, [Permissions.CREATE])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para criar listas de exercícios"
         });
      }

      try {
         return await listaExerciciosRepository.create({
            ...input,
            professorId: session.id
         });
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar lista de exercícios"
         });
      }
   }),

   // Buscar listas por turma
   findByTurma: p.input(z.object({ turmaId: z.string().uuid() })).query(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado"
         });
      }

      if (!checkPermission(session.role, [Permissions.READ])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para visualizar listas de exercícios"
         });
      }

      return await listaExerciciosRepository.findByTurma(input.turmaId, session.id);
   }),

   // Atualizar lista de exercícios
   update: p
      .input(
         z.object({
            id: z.string(),
            titulo: z.string().min(1).optional(),
            descricao: z.string().optional(),
            dataLiberacao: z.string().optional(),
            dataLimite: z.string().optional(),
            questoesIds: z.array(z.string()).optional()
         })
      )
      .mutation(async ({ ctx, input }) => {
         const { session } = ctx;

         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Usuário não autenticado"
            });
         }

         if (!checkPermission(session.role, [Permissions.EDIT_LISTA])) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Sem permissão para editar listas de exercícios"
            });
         }

         try {
            return await listaExerciciosRepository.update(input.id, session.id, input);
         } catch (_error) {
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Erro ao atualizar lista de exercícios"
            });
         }
      }),

   // Deletar lista de exercícios
   delete: p.input(z.string()).mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado"
         });
      }

      if (!checkPermission(session.role, [Permissions.DELETE_LISTA])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para deletar listas de exercícios"
         });
      }

      try {
         await listaExerciciosRepository.delete(input, session.id);
         return { success: true };
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao deletar lista de exercícios"
         });
      }
   }),

   // Ativar/Desativar lista
   toggleActive: p
      .input(
         z.object({
            id: z.string(),
            ativo: z.boolean()
         })
      )
      .mutation(async ({ ctx, input: _input }) => {
         const { session } = ctx;

         if (!session || (session.role !== UserRole.PROFESSOR && session.role !== UserRole.ADMIN)) {
            throw new Error("Acesso negado");
         }

         // TODO: Implementar via repository
         throw new Error("Função ainda não implementada - aguardando implementação dos repositories");
      }),

   // Obter estatísticas da lista (para professores)
   getStats: p.input(z.string()).query(async ({ ctx, input: _input }) => {
      const { session } = ctx;

      if (!session || (session.role !== UserRole.PROFESSOR && session.role !== UserRole.ADMIN)) {
         throw new Error("Acesso negado");
      }

      // TODO: Implementar via repository
      throw new Error("Função ainda não implementada - aguardando implementação dos repositories");
   })
});
