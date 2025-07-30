import { z } from "@/config/zod-config";

export const loginSchema = z.object({
   email: z.string().email()
});

export const cadastroSchema = z.object({
   nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
   email: z.string().email("Email inválido")
});

export type ILogin = z.infer<typeof loginSchema>;
export type ICadastro = z.infer<typeof cadastroSchema>;
