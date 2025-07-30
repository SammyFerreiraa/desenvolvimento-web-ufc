import { z } from "@/config/zod-config";

export const criarTurmaSchema = z.object({
   nome: z.string().min(1, "Nome da turma é obrigatório"),
   serie: z.enum(["PRIMEIRO_ANO", "SEGUNDO_ANO", "TERCEIRO_ANO", "QUARTO_ANO", "QUINTO_ANO"]),
   anoLetivo: z.number().min(2020).max(2030),
   periodo: z.enum(["MANHA", "TARDE", "NOITE"]),
   nomeCoordenador: z.string().min(1, "Nome do coordenador é obrigatório"),
   telefoneCoordenador: z.string().min(1, "Telefone do coordenador é obrigatório"),
   emailCoordenador: z.string().email("Email inválido"),
   descricao: z.string().optional()
});

export type CriarTurmaInput = z.infer<typeof criarTurmaSchema>;
