import { z } from "zod";
import { checkPermission, Permissions } from "@/common/permissions";
import { questaoCreateSchema, questaoUpdateSchema } from "@/common/schemas/edu-plus";
import { createTRPCRouter, procedures } from "@/server/config/trpc";
import { HabilidadeBNCC, QuestionType, SerieLevel, UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { questoesRepository } from "./repository";

const p = procedures.protected;

export const questoesRouter = createTRPCRouter({
   // Listar questões do professor
   list: p
      .input(
         z.object({
            serie: z.nativeEnum(SerieLevel).optional(),
            tipo: z.nativeEnum(QuestionType).optional(),
            habilidade: z.nativeEnum(HabilidadeBNCC).optional(),
            search: z.string().optional(),
            page: z.number().min(0).default(0),
            limit: z.number().min(1).max(50).default(10)
         })
      )
      .query(async ({ ctx, input }) => {
         const { session } = ctx;
         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Usuário não autenticado"
            });
         }

         // Verificar permissões
         if (!session || !checkPermission(session.role, [Permissions.READ])) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Sem permissão para visualizar questões"
            });
         }

         try {
            return await questoesRepository.findByProfessor(session.id, input);
         } catch (_error) {
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Erro ao buscar questões"
            });
         }
      }),

   // Buscar questão por ID
   byId: p.input(z.object({ id: z.string().min(1, "ID é obrigatório") })).query(async ({ ctx, input }) => {
      const { session } = ctx;
      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado"
         });
      }
      const { id } = input;

      const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
      const questao = await questoesRepository.findById(id, professorId);

      if (!questao) {
         throw new TRPCError({
            code: "NOT_FOUND",
            message: "Questão não encontrada"
         });
      }

      return questao;
   }),

   // Criar nova questão
   create: p.input(questaoCreateSchema).mutation(async ({ ctx, input }) => {
      const { session } = ctx;

      // Verificar permissões
      if (!session || !checkPermission(session.role, [Permissions.CREATE_QUESTAO])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para criar questões"
         });
      }

      try {
         return await questoesRepository.create(input, session.id);
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar questão"
         });
      }
   }),

   // Atualizar questão
   update: p
      .input(
         z.object({
            id: z.string().min(1, "ID é obrigatório"),
            data: questaoUpdateSchema
         })
      )
      .mutation(async ({ ctx, input }) => {
         const { session } = ctx;
         const { id, data } = input;

         // Verificar permissões
         if (!session || !checkPermission(session.role, [Permissions.EDIT_QUESTAO])) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Sem permissão para editar questões"
            });
         }

         try {
            const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
            return await questoesRepository.update(id, data, professorId);
         } catch (_error) {
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Erro ao atualizar questão"
            });
         }
      }),

   // Excluir questão
   delete: p.input(z.object({ id: z.string().min(1, "ID é obrigatório") })).mutation(async ({ ctx, input }) => {
      const { session } = ctx;
      const { id } = input;

      // Verificar permissões
      if (!session || !checkPermission(session.role, [Permissions.DELETE_QUESTAO])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para excluir questões"
         });
      }

      try {
         const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
         return await questoesRepository.delete(id, professorId);
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao excluir questão"
         });
      }
   }),

   // Buscar questões para adicionar em lista
   findForLista: p
      .input(
         z.object({
            serie: z.nativeEnum(SerieLevel),
            habilidades: z.array(z.nativeEnum(HabilidadeBNCC)).optional(),
            excludeIds: z.array(z.string()).optional(),
            search: z.string().optional(),
            limit: z.number().min(1).max(100).default(50)
         })
      )
      .query(async ({ ctx, input }) => {
         const { session } = ctx;

         // Verificar permissões
         if (!session || !checkPermission(session.role, [Permissions.READ])) {
            throw new TRPCError({
               code: "FORBIDDEN",
               message: "Sem permissão para visualizar questões"
            });
         }

         try {
            const professorId = session.role === UserRole.PROFESSOR ? session.id : undefined;
            return await questoesRepository.findForLista({
               ...input,
               professorId
            });
         } catch (_error) {
            throw new TRPCError({
               code: "INTERNAL_SERVER_ERROR",
               message: "Erro ao buscar questões"
            });
         }
      }),

   // Obter estatísticas das questões
   estatisticas: p.query(async ({ ctx }) => {
      const { session } = ctx;

      // Verificar permissões
      if (!session || !checkPermission(session.role, [Permissions.VIEW_RELATORIOS])) {
         throw new TRPCError({
            code: "FORBIDDEN",
            message: "Sem permissão para visualizar estatísticas"
         });
      }

      try {
         return await questoesRepository.getEstatisticas(session.id);
      } catch (_error) {
         throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao obter estatísticas"
         });
      }
   })
});
