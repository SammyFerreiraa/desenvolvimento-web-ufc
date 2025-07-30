import axios from "axios";

const api = axios.create({
   baseURL: "/api",
   timeout: 10000
});

export interface LoginData {
   email: string;
}

export interface CadastroData {
   nome: string;
   email: string;
}

export const authApi = {
   login: async (data: LoginData) => {
      const response = await api.post("/auth/signin", data);
      return response.data;
   },

   cadastro: async (data: CadastroData) => {
      const response = await api.post("/auth/cadastro", data);
      return response.data;
   }
};
