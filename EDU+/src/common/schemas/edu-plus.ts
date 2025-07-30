import { z } from "@/config/zod-config";
import { HabilidadeBNCC, QuestionType, SerieLevel } from "@prisma/client";

// Schema para Turma
export const turmaCreateSchema = z.object({
   nome: z.string().min(3, "Nome da turma deve ter pelo menos 3 caracteres").max(100, "Nome muito longo"),
   serie: z.nativeEnum(SerieLevel, { message: "Série inválida" }),
   anoLetivo: z.number().min(2020, "Ano letivo inválido").max(2050, "Ano letivo inválido")
});

export const turmaUpdateSchema = turmaCreateSchema.partial();

export type TurmaCreateInput = z.infer<typeof turmaCreateSchema>;
export type TurmaUpdateInput = z.infer<typeof turmaUpdateSchema>;

// Schema para Questão
export const questaoCreateSchema = z.object({
   enunciado: z.string().min(3, "Enunciado deve ter pelo menos 3 caracteres").max(2000, "Enunciado muito longo"),
   tipo: z.nativeEnum(QuestionType, { message: "Tipo de questão inválido" }),
   gabarito: z.string().min(1, "Gabarito é obrigatório"),
   explicacao: z
      .string()
      .min(10, "Explicação deve ter pelo menos 10 caracteres")
      .max(1000, "Explicação muito longa")
      .optional()
      .or(z.literal("")), // Permitir string vazia para explicação opcional
   opcoes: z.string().optional(), // JSON string para múltipla escolha
   dificuldade: z.number().min(1, "Dificuldade mínima é 1").max(5, "Dificuldade máxima é 5").default(1),
   habilidades: z.array(z.nativeEnum(HabilidadeBNCC)).min(1, "Pelo menos uma habilidade da BNCC deve ser selecionada"),
   serie: z.nativeEnum(SerieLevel, { message: "Série inválida" })
});

export const questaoUpdateSchema = questaoCreateSchema.partial();

export type QuestaoCreateInput = z.infer<typeof questaoCreateSchema>;
export type QuestaoUpdateInput = z.infer<typeof questaoUpdateSchema>;

// Schema específico para questão de múltipla escolha
export const questaoMultiplaEscolhaSchema = questaoCreateSchema.extend({
   tipo: z.literal(QuestionType.MULTIPLA_ESCOLHA),
   opcoes: z.string().min(1, "Opções são obrigatórias para questões de múltipla escolha")
});

// Schema para Lista de Exercícios
const listaExercicioBaseSchema = z.object({
   titulo: z.string().min(5, "Título deve ter pelo menos 5 caracteres").max(200, "Título muito longo"),
   descricao: z.string().max(1000, "Descrição muito longa").optional(),
   turmaId: z.string().uuid("ID da turma inválido"),
   dataLiberacao: z.date().optional(),
   dataLimite: z.date().optional(),
   questoesIds: z.array(z.string().uuid("ID de questão inválido")).min(1, "Pelo menos uma questão deve ser adicionada")
});

export const listaExercicioCreateSchema = listaExercicioBaseSchema.refine(
   (data) => {
      if (data.dataLiberacao && data.dataLimite) {
         return data.dataLiberacao <= data.dataLimite;
      }
      return true;
   },
   {
      message: "Data de liberação deve ser anterior à data limite",
      path: ["dataLimite"]
   }
);

export const listaExercicioUpdateSchema = listaExercicioBaseSchema.partial();

export type ListaExercicioCreateInput = z.infer<typeof listaExercicioCreateSchema>;
export type ListaExercicioUpdateInput = z.infer<typeof listaExercicioUpdateSchema>;

// Schema para Resposta do Aluno
export const respostaAlunoSchema = z.object({
   questaoId: z.string().uuid("ID da questão inválido"),
   resposta: z.string().min(1, "Resposta é obrigatória"),
   tentativaListaId: z.string().uuid("ID da tentativa inválido").optional(),
   tempoResposta: z.number().min(0, "Tempo de resposta inválido").optional()
});

export type RespostaAlunoInput = z.infer<typeof respostaAlunoSchema>;

// Schema para iniciar uma lista de exercícios
export const iniciarListaSchema = z.object({
   listaId: z.string().uuid("ID da lista inválido")
});

export type IniciarListaInput = z.infer<typeof iniciarListaSchema>;

// Schema para finalizar uma lista de exercícios
export const finalizarListaSchema = z.object({
   tentativaListaId: z.string().uuid("ID da tentativa inválido")
});

export type FinalizarListaInput = z.infer<typeof finalizarListaSchema>;

// Schema para UserProfile
export const userProfileCreateSchema = z.object({
   // Campos específicos para professores
   especialidade: z.string().max(100, "Especialidade muito longa").optional(),
   biografia: z.string().max(500, "Biografia muito longa").optional(),

   // Campos específicos para alunos
   dataNascimento: z.date().max(new Date(), "Data de nascimento não pode ser no futuro").optional(),
   responsavel: z.string().max(200, "Nome do responsável muito longo").optional()
});

export const userProfileUpdateSchema = userProfileCreateSchema.partial();

export type UserProfileCreateInput = z.infer<typeof userProfileCreateSchema>;
export type UserProfileUpdateInput = z.infer<typeof userProfileUpdateSchema>;

// Schema para filtros de relatório
export const relatorioFiltroSchema = z
   .object({
      turmaId: z.string().uuid("ID da turma inválido").optional(),
      alunoId: z.string().uuid("ID do aluno inválido").optional(),
      habilidade: z.nativeEnum(HabilidadeBNCC).optional(),
      dataInicio: z.date().optional(),
      dataFim: z.date().optional(),
      serie: z.nativeEnum(SerieLevel).optional()
   })
   .refine(
      (data) => {
         if (data.dataInicio && data.dataFim) {
            return data.dataInicio <= data.dataFim;
         }
         return true;
      },
      {
         message: "Data de início deve ser anterior à data fim",
         path: ["dataFim"]
      }
   );

export type RelatorioFiltroInput = z.infer<typeof relatorioFiltroSchema>;

// Schema para adição/remoção de alunos em turma
export const gerenciarAlunosTurmaSchema = z.object({
   turmaId: z.string().uuid("ID da turma inválido"),
   alunosIds: z.array(z.string().uuid("ID de aluno inválido")).min(1, "Pelo menos um aluno deve ser selecionado")
});

export type GerenciarAlunosTurmaInput = z.infer<typeof gerenciarAlunosTurmaSchema>;

// Schema para busca/filtros
export const buscaSchema = z.object({
   query: z.string().min(1, "Termo de busca é obrigatório").max(100, "Termo de busca muito longo"),
   page: z.number().min(1, "Página deve ser maior que 0").default(1),
   limit: z.number().min(1, "Limite deve ser maior que 0").max(100, "Limite máximo é 100").default(10)
});

export type BuscaInput = z.infer<typeof buscaSchema>;

// Schema para listas de exercícios
export const listaExerciciosCreateSchema = z.object({
   titulo: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(200, "Título muito longo"),
   descricao: z.string().max(1000, "Descrição muito longa").optional(),
   turmaId: z.string().uuid("ID da turma inválido"),
   questoesIds: z
      .array(z.string().uuid("ID de questão inválido"))
      .min(1, "Pelo menos uma questão deve ser selecionada"),
   dataLiberacao: z.string().optional(),
   dataLimite: z.string().optional()
});

export const listaExerciciosUpdateSchema = listaExerciciosCreateSchema.partial().omit({ turmaId: true });

export type ListaExerciciosCreateInput = z.infer<typeof listaExerciciosCreateSchema>;
export type ListaExerciciosUpdateInput = z.infer<typeof listaExerciciosUpdateSchema>;
