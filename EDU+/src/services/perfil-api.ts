import axios from "axios";

const api = axios.create({
   baseURL: "/api",
   timeout: 10000
});

api.interceptors.response.use(
   (response) => response,
   (error) => {
      if (error.response?.data?.error) {
         throw new Error(error.response.data.error);
      }
      throw error;
   }
);

export type UserProfile = {
   id: string;
   userId: string;
   especialidade?: string;
   biografia?: string;
   dataNascimento?: string;
   responsavel?: string;
   codigoAcesso?: string;
   ativo: boolean;
   createdAt: string;
   updatedAt: string;
};

export type UserWithProfile = {
   id: string;
   name: string;
   email: string;
   image?: string;
   role: string;
   profile?: UserProfile;
};

export type UpdateProfileData = {
   name: string;
   especialidade?: string;
   biografia?: string;
};

export const perfilApi = {
   // Buscar dados do perfil
   async getPerfil(): Promise<{ user: UserWithProfile }> {
      const response = await api.get("/perfil");
      return response.data;
   },

   // Atualizar perfil
   async updatePerfil(data: UpdateProfileData): Promise<{ user: UserWithProfile }> {
      const response = await api.put("/perfil", data);
      return response.data;
   }
};

export default perfilApi;
