import axios from "axios";

const api = axios.create({
   baseURL: "/api",
   headers: {
      "Content-Type": "application/json"
   }
});

api.interceptors.response.use(
   (response) => response,
   (error) => {
      console.error("Erro na API de listas:", error.response?.data || error.message);
      return Promise.reject(error);
   }
);

export interface ListaExercicio {
   id: string;
   titulo: string;
   descricao?: string | null;
   dataLiberacao?: Date | null;
   dataLimite?: Date | null;
   status: string;
   turmaId: string;
   professorId: string;
   createdAt: Date;
   updatedAt: Date;
   questoes?: Array<{
      id: string;
      ordem: number;
      questao: {
         id: string;
         titulo: string;
         serie: string;
      };
   }>;
   turma?: {
      id: string;
      nome: string;
      serie: string;
   };
   professor?: {
      id: string;
      name: string;
   };
}

interface CreateListaData {
   titulo: string;
   descricao?: string;
   turmaId: string;
   questoesIds: string[];
   dataLiberacao?: string;
   dataLimite?: string;
}

interface UpdateListaData {
   id: string;
   titulo?: string;
   descricao?: string;
   dataLiberacao?: string;
   dataLimite?: string;
   questoesIds?: string[];
}

export const listasApi = {
   // Buscar listas por turma
   findByTurma: async (turmaId: string): Promise<ListaExercicio[]> => {
      const response = await api.get(`/listas-exercicio/turma/${turmaId}`);
      return response.data;
   },

   // Criar nova lista
   create: async (data: CreateListaData): Promise<ListaExercicio> => {
      const response = await api.post("/listas-exercicio", data);
      return response.data;
   },

   // Atualizar lista
   update: async (data: UpdateListaData): Promise<ListaExercicio> => {
      const { id, ...updateData } = data;
      const response = await api.put(`/listas-exercicio/${id}`, updateData);
      return response.data;
   },

   // Deletar lista
   delete: async (id: string): Promise<{ success: boolean }> => {
      const response = await api.delete(`/listas-exercicio/${id}`);
      return response.data;
   }
};
