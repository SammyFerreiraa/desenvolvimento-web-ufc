import axios from "axios";
import type { QuestionType, SerieLevel } from "@prisma/client";

type TentativaResponse = {
   id: string;
   resposta: string;
   correta: boolean;
   tentativaNumero: number;
   tempoResposta: number;
   createdAt: string;
   questao: {
      id: string;
      enunciado: string;
      tipo: QuestionType;
      explicacao?: string;
      gabarito: string;
      opcoes?:
         | string
         | Array<{
              id: string;
              texto: string;
              correta: boolean;
           }>;
   };
};

type QuestaoExercicio = {
   id: string;
   enunciado: string;
   tipo: QuestionType;
   opcoes?:
      | string
      | Array<{
           id: string;
           texto: string;
           correta: boolean;
        }>;
   gabarito: string;
   explicacao?: string;
   dificuldade: number;
   tentativas: TentativaResponse[];
   acertou: boolean;
   numeroTentativas: number;
};

type ListaExerciciosResponse = {
   id: string;
   titulo: string;
   descricao?: string;
   dataInicio: string;
   dataFim?: string;
   ativa: boolean;
   questoes: QuestaoExercicio[];
   progresso: {
      total: number;
      respondidas: number;
      corretas: number;
      percentualAcerto: number;
   };
};

type TurmaResponse = {
   id: string;
   nome: string;
   serie: SerieLevel;
   professor: {
      id: string;
      name: string;
   };
   _count: {
      alunos: number;
   };
};

type AlunoTurmaResponse = {
   id: string;
   nome: string;
   codigoAcesso: string;
   turma: TurmaResponse;
   estatisticas: {
      totalTentativas: number;
      totalAcertos: number;
      percentualAcerto: number;
      questoesRespondidas: number;
      medalhas: number;
   };
   conquistas: Array<{
      id: string;
      tipo: string;
      titulo: string;
      descricao: string;
      icone: string;
      dataConquista: string;
   }>;
};

type RankingResponse = {
   posicao: number;
   aluno: {
      id: string;
      nome: string;
   };
   estatisticas: {
      totalAcertos: number;
      percentualAcerto: number;
      questoesRespondidas: number;
      medalhas: number;
   };
}[];

type SubmitRespostaData = {
   questaoId: string;
   listaId: string;
   resposta: string;
   tempoResposta: number;
};

export const alunoApi = {
   // Acessar turma com código individual do aluno
   acessarTurma: async (codigoAcesso: string): Promise<AlunoTurmaResponse> => {
      const response = await axios.post("/api/aluno/acesso", {
         codigoAcesso
      });
      return response.data;
   },

   // Listar atividades disponíveis
   listarAtividades: async (alunoId: string): Promise<ListaExerciciosResponse[]> => {
      const response = await axios.get(`/api/aluno/${alunoId}/atividades`);
      return response.data;
   },

   // Obter detalhes de uma atividade específica
   obterAtividade: async (alunoId: string, listaId: string): Promise<ListaExerciciosResponse> => {
      const response = await axios.get(`/api/aluno/${alunoId}/atividades/${listaId}`);
      return response.data;
   },

   // Submeter resposta para uma questão
   submeterResposta: async (alunoId: string, data: SubmitRespostaData): Promise<TentativaResponse> => {
      const response = await axios.post(`/api/aluno/${alunoId}/resposta`, data);
      return response.data;
   },

   // Obter ranking da turma
   obterRanking: async (alunoId: string): Promise<RankingResponse> => {
      const response = await axios.get(`/api/aluno/${alunoId}/ranking`);
      return response.data;
   },

   // Obter conquistas do aluno
   obterConquistas: async (alunoId: string): Promise<AlunoTurmaResponse["conquistas"]> => {
      const response = await axios.get(`/api/aluno/${alunoId}/conquistas`);
      return response.data;
   },

   // Obter estatísticas detalhadas
   obterEstatisticas: async (alunoId: string): Promise<AlunoTurmaResponse["estatisticas"]> => {
      const response = await axios.get(`/api/aluno/${alunoId}/estatisticas`);
      return response.data;
   }
};

export type {
   AlunoTurmaResponse,
   ListaExerciciosResponse,
   QuestaoExercicio,
   TentativaResponse,
   RankingResponse,
   SubmitRespostaData,
   TurmaResponse
};
