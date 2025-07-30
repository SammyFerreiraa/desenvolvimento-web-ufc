import axios from "axios";
import type { z } from "zod";
import type { cadastrarAlunoSchema, editarAlunoSchema } from "@/common/schemas/aluno";
import type { turmaCreateSchema, turmaUpdateSchema } from "@/common/schemas/edu-plus";

type TurmaCreateData = z.infer<typeof turmaCreateSchema>;
type TurmaUpdateData = z.infer<typeof turmaUpdateSchema>;
type CadastrarAlunoData = z.infer<typeof cadastrarAlunoSchema>;
type EditarAlunoData = z.infer<typeof editarAlunoSchema>;

const api = axios.create({
   baseURL: "/api",
   headers: {
      "Content-Type": "application/json"
   }
});

api.interceptors.response.use(
   (response) => response,
   (error) => {
      console.error("Erro na API:", error.response?.data || error.message);

      return Promise.reject(error);
   }
);

export const turmasApi = {
   // Listar turmas
   list: async (params?: { page?: number; limit?: number }) => {
      const searchParams = new URLSearchParams();
      if (params?.page !== undefined) searchParams.set("page", params.page.toString());
      if (params?.limit !== undefined) searchParams.set("limit", params.limit.toString());

      const url = `/turmas${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      const response = await api.get(url);
      return response.data;
   },

   // Buscar turma por ID
   getById: async (id: string) => {
      const response = await api.get(`/turmas/${id}`);
      return response.data;
   },

   // Criar nova turma
   create: async (data: TurmaCreateData) => {
      const response = await api.post("/turmas", data);
      return response.data;
   },

   // Atualizar turma
   update: async (id: string, data: TurmaUpdateData) => {
      const response = await api.put(`/turmas/${id}`, data);
      return response.data;
   },

   // Excluir turma
   delete: async (id: string) => {
      const response = await api.delete(`/turmas/${id}`);
      return response.data;
   },

   // Adicionar alunos à turma
   addAlunos: async (turmaId: string, alunosIds: string[]) => {
      const response = await api.post(`/turmas/${turmaId}/alunos`, { alunosIds });
      return response.data;
   },

   // Remover alunos da turma
   removeAlunos: async (turmaId: string, alunosIds: string[]) => {
      const response = await api.delete(`/turmas/${turmaId}/alunos`, {
         data: { alunosIds }
      });
      return response.data;
   },

   // Cadastrar novo aluno na turma
   cadastrarAluno: async (data: CadastrarAlunoData) => {
      const response = await api.post("/turmas/alunos", data);
      return response.data;
   },

   // Editar dados do aluno
   editarAluno: async (data: EditarAlunoData) => {
      const response = await api.put("/turmas/alunos", data);
      return response.data;
   }
};

export default turmasApi;
