import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";

export const errorMap: Record<TRPC_ERROR_CODE_KEY, string> = {
   BAD_REQUEST: "Dados inválidos. Verifique e tente novamente.",
   UNAUTHORIZED: "Você não tem permissão para acessar este recurso.",
   FORBIDDEN: "Acesso negado.",
   NOT_FOUND: "Recurso não encontrado.",
   METHOD_NOT_SUPPORTED: "Método não suportado pelo servidor.",
   TIMEOUT: "Conexão encerrada por inatividade.",
   CONFLICT: "Conflito com o estado atual do recurso.",
   PRECONDITION_FAILED: "Pré-condição não atendida para acessar o recurso.",
   PAYLOAD_TOO_LARGE: "A requisição é muito grande para ser processada.",
   UNSUPPORTED_MEDIA_TYPE: "Formato de mídia não suportado pelo servidor.",
   UNPROCESSABLE_CONTENT: "O conteúdo da requisição não pôde ser processado.",
   TOO_MANY_REQUESTS: "Muitas requisições. Tente novamente mais tarde.",
   CLIENT_CLOSED_REQUEST: "Acesso ao recurso foi negado.",
   INTERNAL_SERVER_ERROR: "Houve um erro inesperado. Contate o suporte para mais informações.",
   NOT_IMPLEMENTED: "Funcionalidade não implementada no servidor.",
   BAD_GATEWAY: "Servidor indisponível. Tente novamente mais tarde.",
   SERVICE_UNAVAILABLE: "Servidor temporariamente indisponível. Tente novamente mais tarde.",
   GATEWAY_TIMEOUT: "Tempo de resposta excedido pelo servidor.",
   PARSE_ERROR: "Erro de sintaxe. Verifique e tente novamente."
};
