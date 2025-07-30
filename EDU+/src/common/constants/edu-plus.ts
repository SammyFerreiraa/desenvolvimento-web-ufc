import { HabilidadeBNCC, QuestionType, SerieLevel } from "@prisma/client";

// Mapeamento das habilidades da BNCC por série
export const HABILIDADES_POR_SERIE: Record<SerieLevel, HabilidadeBNCC[]> = {
   [SerieLevel.PRIMEIRO_ANO]: [
      HabilidadeBNCC.EF01MA01,
      HabilidadeBNCC.EF01MA02,
      HabilidadeBNCC.EF01MA03,
      HabilidadeBNCC.EF01MA04,
      HabilidadeBNCC.EF01MA05,
      HabilidadeBNCC.EF01MA06,
      HabilidadeBNCC.EF01MA07,
      HabilidadeBNCC.EF01MA08
   ],
   [SerieLevel.SEGUNDO_ANO]: [
      HabilidadeBNCC.EF02MA01,
      HabilidadeBNCC.EF02MA02,
      HabilidadeBNCC.EF02MA03,
      HabilidadeBNCC.EF02MA04,
      HabilidadeBNCC.EF02MA05,
      HabilidadeBNCC.EF02MA06
   ],
   [SerieLevel.TERCEIRO_ANO]: [
      HabilidadeBNCC.EF03MA01,
      HabilidadeBNCC.EF03MA02,
      HabilidadeBNCC.EF03MA03,
      HabilidadeBNCC.EF03MA04,
      HabilidadeBNCC.EF03MA05,
      HabilidadeBNCC.EF03MA06,
      HabilidadeBNCC.EF03MA07,
      HabilidadeBNCC.EF03MA08
   ],
   [SerieLevel.QUARTO_ANO]: [
      HabilidadeBNCC.EF04MA01,
      HabilidadeBNCC.EF04MA02,
      HabilidadeBNCC.EF04MA03,
      HabilidadeBNCC.EF04MA04,
      HabilidadeBNCC.EF04MA05,
      HabilidadeBNCC.EF04MA06,
      HabilidadeBNCC.EF04MA07
   ],
   [SerieLevel.QUINTO_ANO]: [
      HabilidadeBNCC.EF05MA01,
      HabilidadeBNCC.EF05MA02,
      HabilidadeBNCC.EF05MA03,
      HabilidadeBNCC.EF05MA04,
      HabilidadeBNCC.EF05MA05,
      HabilidadeBNCC.EF05MA06,
      HabilidadeBNCC.EF05MA07,
      HabilidadeBNCC.EF05MA08
   ]
};

// Descrições das habilidades da BNCC
export const DESCRICOES_HABILIDADES: Record<HabilidadeBNCC, string> = {
   // 1º ano
   [HabilidadeBNCC.EF01MA01]: "Utilizar números naturais como indicador de quantidade",
   [HabilidadeBNCC.EF01MA02]: "Contar de maneira exata ou aproximada",
   [HabilidadeBNCC.EF01MA03]: "Estimar e comparar quantidades",
   [HabilidadeBNCC.EF01MA04]: "Contar a quantidade de objetos de coleções",
   [HabilidadeBNCC.EF01MA05]: "Comparar números naturais de até duas ordens",
   [HabilidadeBNCC.EF01MA06]: "Construir fatos básicos da adição",
   [HabilidadeBNCC.EF01MA07]: "Compor e decompor número de até duas ordens",
   [HabilidadeBNCC.EF01MA08]: "Resolver e elaborar problemas de adição e subtração",

   // 2º ano
   [HabilidadeBNCC.EF02MA01]: "Comparar e ordenar números naturais",
   [HabilidadeBNCC.EF02MA02]: "Fazer estimativas por meio de estratégias diversas",
   [HabilidadeBNCC.EF02MA03]: "Comparar quantidades de objetos de dois conjuntos",
   [HabilidadeBNCC.EF02MA04]: "Compor e decompor números naturais de até três ordens",
   [HabilidadeBNCC.EF02MA05]: "Construir fatos básicos da adição e subtração",
   [HabilidadeBNCC.EF02MA06]: "Resolver e elaborar problemas de adição e subtração",

   // 3º ano
   [HabilidadeBNCC.EF03MA01]: "Ler, escrever e comparar números naturais de até a ordem de unidade de milhar",
   [HabilidadeBNCC.EF03MA02]: "Identificar características do sistema de numeração decimal",
   [HabilidadeBNCC.EF03MA03]: "Construir e utilizar fatos básicos da adição e da multiplicação",
   [HabilidadeBNCC.EF03MA04]: "Estabelecer a relação entre números naturais e pontos da reta numérica",
   [HabilidadeBNCC.EF03MA05]: "Utilizar diferentes procedimentos de cálculo mental e escrito",
   [HabilidadeBNCC.EF03MA06]: "Resolver e elaborar problemas de adição e subtração",
   [HabilidadeBNCC.EF03MA07]: "Resolver e elaborar problemas de multiplicação",
   [HabilidadeBNCC.EF03MA08]: "Resolver e elaborar problemas de divisão",

   // 4º ano
   [HabilidadeBNCC.EF04MA01]: "Ler, escrever e ordenar números naturais até a ordem de dezenas de milhar",
   [HabilidadeBNCC.EF04MA02]:
      "Mostrar, por decomposição e composição, que todo número natural pode ser escrito por meio de adições e multiplicações por potências de dez",
   [HabilidadeBNCC.EF04MA03]: "Resolver e elaborar problemas com números naturais envolvendo adição e subtração",
   [HabilidadeBNCC.EF04MA04]: "Utilizar as relações entre adição e subtração, bem como entre multiplicação e divisão",
   [HabilidadeBNCC.EF04MA05]: "Utilizar as propriedades das operações para desenvolver estratégias de cálculo",
   [HabilidadeBNCC.EF04MA06]: "Resolver e elaborar problemas envolvendo diferentes significados da multiplicação",
   [HabilidadeBNCC.EF04MA07]: "Resolver e elaborar problemas de divisão cujo divisor tenha no máximo dois algarismos",

   // 5º ano
   [HabilidadeBNCC.EF05MA01]: "Ler, escrever e ordenar números naturais até a ordem das centenas de milhar",
   [HabilidadeBNCC.EF05MA02]: "Ler, escrever e ordenar números racionais na forma decimal",
   [HabilidadeBNCC.EF05MA03]: "Identificar e representar frações",
   [HabilidadeBNCC.EF05MA04]: "Identificar frações equivalentes",
   [HabilidadeBNCC.EF05MA05]: "Comparar e ordenar números racionais positivos",
   [HabilidadeBNCC.EF05MA06]: "Associar as representações 10%, 25%, 50%, 75% e 100%",
   [HabilidadeBNCC.EF05MA07]: "Resolver e elaborar problemas de adição e subtração com números naturais",
   [HabilidadeBNCC.EF05MA08]: "Resolver e elaborar problemas de multiplicação e divisão"
};

// Nomes amigáveis para as séries
export const SERIES_LABELS: Record<SerieLevel, string> = {
   [SerieLevel.PRIMEIRO_ANO]: "1º Ano",
   [SerieLevel.SEGUNDO_ANO]: "2º Ano",
   [SerieLevel.TERCEIRO_ANO]: "3º Ano",
   [SerieLevel.QUARTO_ANO]: "4º Ano",
   [SerieLevel.QUINTO_ANO]: "5º Ano"
};

// Nomes amigáveis para os tipos de questão
export const NOMES_TIPOS_QUESTAO: Record<QuestionType, string> = {
   [QuestionType.MULTIPLA_ESCOLHA]: "Múltipla Escolha",
   [QuestionType.VERDADEIRO_FALSO]: "Verdadeiro ou Falso",
   [QuestionType.NUMERO]: "Resposta Numérica",
   [QuestionType.TEXTO_CURTO]: "Texto Curto"
};

// Cores para as séries (para uso em gráficos e interfaces)
export const CORES_SERIES: Record<SerieLevel, string> = {
   [SerieLevel.PRIMEIRO_ANO]: "#ef4444", // red-500
   [SerieLevel.SEGUNDO_ANO]: "#f97316", // orange-500
   [SerieLevel.TERCEIRO_ANO]: "#eab308", // yellow-500
   [SerieLevel.QUARTO_ANO]: "#22c55e", // green-500
   [SerieLevel.QUINTO_ANO]: "#3b82f6" // blue-500
};

// Ícones para os tipos de questão
export const ICONES_TIPOS_QUESTAO: Record<QuestionType, string> = {
   [QuestionType.MULTIPLA_ESCOLHA]: "checklist",
   [QuestionType.VERDADEIRO_FALSO]: "thumbs-up-down",
   [QuestionType.NUMERO]: "hash",
   [QuestionType.TEXTO_CURTO]: "type"
};

// Níveis de dificuldade
export const NIVEIS_DIFICULDADE = [
   { valor: 1, nome: "Muito Fácil", cor: "#22c55e" },
   { valor: 2, nome: "Fácil", cor: "#84cc16" },
   { valor: 3, nome: "Médio", cor: "#eab308" },
   { valor: 4, nome: "Difícil", cor: "#f97316" },
   { valor: 5, nome: "Muito Difícil", cor: "#ef4444" }
];

// Status de progresso do aluno
export const STATUS_PROGRESSO = {
   NAO_INICIADO: { nome: "Não Iniciado", cor: "#6b7280" },
   EM_PROGRESSO: { nome: "Em Progresso", cor: "#f59e0b" },
   CONCLUIDO: { nome: "Concluído", cor: "#10b981" }
};

// Metas de desempenho (percentuais)
export const METAS_DESEMPENHO = {
   EXCELENTE: 90,
   BOM: 70,
   REGULAR: 50,
   INSUFICIENTE: 0
};

// Cores para os níveis de desempenho
export const CORES_DESEMPENHO = {
   EXCELENTE: "#10b981", // green-500
   BOM: "#3b82f6", // blue-500
   REGULAR: "#f59e0b", // amber-500
   INSUFICIENTE: "#ef4444" // red-500
};
