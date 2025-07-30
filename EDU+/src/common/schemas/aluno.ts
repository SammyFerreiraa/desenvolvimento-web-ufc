import { z } from "@/config/zod-config";

// Schema para cadastro de aluno pelo professor
export const cadastrarAlunoSchema = z.object({
   nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
   dataNascimento: z.string().optional(), // Data como string para facilitar input
   responsavel: z.string().min(2, "Nome do responsável deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
   turmaId: z.string().uuid("ID da turma inválido")
});

// Schema para editar aluno
export const editarAlunoSchema = z.object({
   id: z.string().uuid("ID do aluno inválido"),
   nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
   dataNascimento: z.string().optional(), // Data como string para facilitar input
   responsavel: z.string().min(2, "Nome do responsável deve ter pelo menos 2 caracteres").max(100, "Nome muito longo")
});

// Schema para login do aluno com código
export const loginAlunoSchema = z.object({
   codigoAcesso: z
      .string()
      .min(6, "Código deve ter pelo menos 6 caracteres")
      .max(10, "Código deve ter no máximo 10 caracteres")
      .regex(/^[A-Z0-9]+$/, "Código deve conter apenas letras maiúsculas e números")
});

// Schema para buscar aluno por código
export const buscarAlunoPorCodigoSchema = z.object({
   codigoAcesso: z.string().min(6, "Código inválido")
});

// Tipos inferidos
export type CadastrarAlunoInput = z.infer<typeof cadastrarAlunoSchema>;
export type EditarAlunoInput = z.infer<typeof editarAlunoSchema>;
export type LoginAlunoInput = z.infer<typeof loginAlunoSchema>;
export type BuscarAlunoPorCodigoInput = z.infer<typeof buscarAlunoPorCodigoSchema>;
