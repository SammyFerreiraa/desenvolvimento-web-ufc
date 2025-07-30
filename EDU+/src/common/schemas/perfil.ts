import { z } from "@/config/zod-config";

export const updatePerfilSchema = z.object({
   name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
   especialidade: z.string().max(100, "Especialidade deve ter no máximo 100 caracteres").optional(),
   biografia: z.string().max(500, "Biografia deve ter no máximo 500 caracteres").optional()
});

export type UpdatePerfilInput = z.infer<typeof updatePerfilSchema>;
