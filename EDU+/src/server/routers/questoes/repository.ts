import { prisma } from "@/server/config/prisma";
import type { HabilidadeBNCC, QuestionType, SerieLevel } from "@prisma/client";

export const questoesRepository = {
   // Listar questões do professor
   findByProfessor: async (
      professorId: string,
      filters?: {
         serie?: SerieLevel;
         tipo?: QuestionType;
         habilidade?: HabilidadeBNCC;
         search?: string;
         page?: number;
         limit?: number;
      }
   ) => {
      const page = filters?.page ?? 0;
      const limit = filters?.limit ?? 10;
      const offset = page * limit;

      const where: any = {
         professorId,
         ativa: true
      };

      if (filters?.serie) {
         where.serie = filters.serie;
      }

      if (filters?.tipo) {
         where.tipo = filters.tipo;
      }

      if (filters?.habilidade) {
         where.habilidades = {
            has: filters.habilidade
         };
      }

      if (filters?.search) {
         where.enunciado = {
            contains: filters.search,
            mode: "insensitive"
         };
      }

      const [questoes, total] = await Promise.all([
         prisma.questao.findMany({
            where,
            include: {
               _count: {
                  select: {
                     listas: true,
                     tentativas: true
                  }
               }
            },
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit
         }),
         prisma.questao.count({ where })
      ]);

      return {
         questoes,
         total,
         hasNext: offset + limit < total,
         hasPrev: page > 0
      };
   },

   // Buscar questão por ID
   findById: async (id: string, professorId?: string) => {
      const where = professorId ? { id, professorId, ativa: true } : { id, ativa: true };

      return await prisma.questao.findUnique({
         where,
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
                  listas: true,
                  tentativas: true
               }
            }
         }
      });
   },

   // Criar nova questão
   create: async (
      data: {
         enunciado: string;
         tipo: QuestionType;
         gabarito: string;
         explicacao?: string;
         opcoes?: string;
         dificuldade: number;
         habilidades: HabilidadeBNCC[];
         serie: SerieLevel;
      },
      professorId: string
   ) => {
      return await prisma.questao.create({
         data: {
            ...data,
            professorId
         },
         include: {
            _count: {
               select: {
                  listas: true,
                  tentativas: true
               }
            }
         }
      });
   },

   // Atualizar questão
   update: async (
      id: string,
      data: {
         enunciado?: string;
         tipo?: QuestionType;
         gabarito?: string;
         explicacao?: string;
         opcoes?: string;
         dificuldade?: number;
         habilidades?: HabilidadeBNCC[];
         serie?: SerieLevel;
      },
      professorId?: string
   ) => {
      const where = professorId ? { id, professorId, ativa: true } : { id, ativa: true };

      return await prisma.questao.update({
         where,
         data,
         include: {
            _count: {
               select: {
                  listas: true,
                  tentativas: true
               }
            }
         }
      });
   },

   // Excluir questão (soft delete)
   delete: async (id: string, professorId?: string) => {
      const where = professorId ? { id, professorId } : { id };

      return await prisma.questao.update({
         where,
         data: { ativa: false }
      });
   },

   // Buscar questões para lista (com filtros)
   findForLista: async (filters: {
      serie: SerieLevel;
      habilidades?: HabilidadeBNCC[];
      professorId?: string;
      excludeIds?: string[];
      search?: string;
      limit?: number;
   }) => {
      const where: any = {
         serie: filters.serie,
         ativa: true
      };

      if (filters.professorId) {
         where.professorId = filters.professorId;
      }

      if (filters.habilidades && filters.habilidades.length > 0) {
         where.habilidades = {
            hasSome: filters.habilidades
         };
      }

      if (filters.excludeIds && filters.excludeIds.length > 0) {
         where.id = {
            notIn: filters.excludeIds
         };
      }

      if (filters.search) {
         where.enunciado = {
            contains: filters.search,
            mode: "insensitive"
         };
      }

      return await prisma.questao.findMany({
         where,
         select: {
            id: true,
            enunciado: true,
            tipo: true,
            dificuldade: true,
            habilidades: true,
            serie: true,
            professor: {
               select: {
                  name: true
               }
            }
         },
         orderBy: [{ dificuldade: "asc" }, { createdAt: "desc" }],
         take: filters.limit ?? 50
      });
   },

   // Obter estatísticas das questões do professor
   getEstatisticas: async (professorId: string) => {
      const [total, porSerie, porTipo, porDificuldade] = await Promise.all([
         prisma.questao.count({
            where: { professorId, ativa: true }
         }),

         prisma.questao.groupBy({
            by: ["serie"],
            where: { professorId, ativa: true },
            _count: true
         }),

         prisma.questao.groupBy({
            by: ["tipo"],
            where: { professorId, ativa: true },
            _count: true
         }),

         prisma.questao.groupBy({
            by: ["dificuldade"],
            where: { professorId, ativa: true },
            _count: true
         })
      ]);

      return {
         total,
         porSerie: porSerie.map((item) => ({
            serie: item.serie,
            quantidade: item._count
         })),
         porTipo: porTipo.map((item) => ({
            tipo: item.tipo,
            quantidade: item._count
         })),
         porDificuldade: porDificuldade.map((item) => ({
            dificuldade: item.dificuldade,
            quantidade: item._count
         }))
      };
   }
};
