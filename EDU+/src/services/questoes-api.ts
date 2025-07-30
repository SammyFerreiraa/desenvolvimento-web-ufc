import axios from "axios";
import type { z } from "zod";
import type { questaoCreateSchema, questaoUpdateSchema } from "@/common/schemas/edu-plus";
import type { HabilidadeBNCC, QuestionType, SerieLevel } from "@prisma/client";

// Tipos baseados nos schemas
type QuestaoCreateData = z.infer<typeof questaoCreateSchema>;
type QuestaoUpdateData = z.infer<typeof questaoUpdateSchema>;

// Tipos para filtros e parâmetros
type QuestoesFilters = {
   serie?: SerieLevel;
   tipo?: QuestionType;
   habilidade?: HabilidadeBNCC;
   search?: string;
   page?: number;
   limit?: number;
};

type QuestaoResponse = {
   id: string;
   enunciado: string;
   tipo: QuestionType;
   serie: SerieLevel;
   habilidades: HabilidadeBNCC[];
   opcoes?:
      | string
      | Array<{
           id: string;
           texto: string;
           correta: boolean;
        }>;
   gabarito?: string;
   explicacao?: string | null;
   dificuldade: number;
   ativa: boolean;
   createdAt: string;
   updatedAt: string;
   professor: {
      id: string;
      name: string;
   };
};

export type { QuestaoResponse };

type QuestoesListResponse = {
   questoes: QuestaoResponse[];
   total: number;
   page: number;
   limit: number;
   totalPages: number;
};

const api = axios.create({
   baseURL: "/api",
   headers: {
      "Content-Type": "application/json"
   }
});

api.interceptors.response.use(
   (response) => response,
   (error) => {
      console.error("Erro na API de questões:", error.response?.data || error.message);

      return Promise.reject(error);
   }
);

export const questoesApi = {
   list: async (filters?: QuestoesFilters): Promise<QuestoesListResponse> => {
      const searchParams = new URLSearchParams();

      if (filters?.serie) searchParams.set("serie", filters.serie);
      if (filters?.tipo) searchParams.set("tipo", filters.tipo);
      if (filters?.habilidade) searchParams.set("habilidade", filters.habilidade);
      if (filters?.search) searchParams.set("search", filters.search);
      if (filters?.page !== undefined) searchParams.set("page", filters.page.toString());
      if (filters?.limit !== undefined) searchParams.set("limit", filters.limit.toString());

      const url = `/questoes${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      const response = await api.get(url);
      return response.data;
   },

   // Buscar questão por ID
   getById: async (id: string): Promise<QuestaoResponse> => {
      const response = await api.get(`/questoes/${id}`);
      return response.data;
   },

   // Criar nova questão
   create: async (data: QuestaoCreateData): Promise<QuestaoResponse> => {
      const response = await api.post("/questoes", data);
      return response.data;
   },

   // Atualizar questão
   update: async (id: string, data: QuestaoUpdateData): Promise<QuestaoResponse> => {
      const response = await api.put(`/questoes/${id}`, data);
      return response.data;
   },

   // Excluir questão
   delete: async (id: string): Promise<{ success: boolean }> => {
      const response = await api.delete(`/questoes/${id}`);
      return response.data;
   },

   // Buscar questões para uma lista de exercícios
   findForLista: async (listaId: string): Promise<QuestaoResponse[]> => {
      const response = await api.get(`/questoes/for-lista?listaId=${listaId}`);
      return response.data;
   },

   // Obter estatísticas das questões
   getEstatisticas: async (): Promise<{
      total: number;
      porTipo: Record<QuestionType, number>;
      porSerie: Record<SerieLevel, number>;
      porHabilidade: Record<HabilidadeBNCC, number>;
   }> => {
      const response = await api.get("/questoes/estatisticas");
      return response.data;
   }
};
