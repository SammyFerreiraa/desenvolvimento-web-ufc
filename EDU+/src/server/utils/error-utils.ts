import type { TRPC_ERROR_CODE_KEY } from "@trpc/server/unstable-core-do-not-import";
import { errorMap } from "./errors-code";

export const trpcCustomMessage = (code: TRPC_ERROR_CODE_KEY, message?: string): string => {
   if (code === "INTERNAL_SERVER_ERROR") {
      return errorMap.INTERNAL_SERVER_ERROR;
   }

   const customMessage = message && errorMap[message as TRPC_ERROR_CODE_KEY];
   if (customMessage) {
      return customMessage;
   }

   return message || errorMap[code] || errorMap.INTERNAL_SERVER_ERROR;
};

type ValidationError = {
   code: string;
   expected: string;
   received: string;
   path: string[];
   message: string;
};

export const formatValidationErrorsFromString = (errorString: string): string => {
   try {
      const errors: ValidationError[] = JSON.parse(errorString);

      return errors
         .map((error) => {
            const fieldName = error.path.join(".");
            let baseMessage: string;

            switch (error.code) {
               case "invalid_type":
                  baseMessage = `O campo "${fieldName}" possui um formato inválido.`;
                  break;
               case "required":
                  baseMessage = `O campo "${fieldName}" é obrigatório.`;
                  break;
               case "too_small":
                  baseMessage = `O campo "${fieldName}" é muito pequeno.`;
                  break;
               case "too_big":
                  baseMessage = `O campo "${fieldName}" é muito grande.`;
                  break;
               case "invalid_enum_value":
                  baseMessage = `O campo "${fieldName}" possui um valor inválido.`;
                  break;
               case "invalid_union":
                  baseMessage = `O campo "${fieldName}" não corresponde a nenhum dos tipos esperados.`;
                  break;
               case "invalid_literal":
                  baseMessage = `O campo "${fieldName}" deve ter um valor específico.`;
                  break;
               case "invalid_date":
                  baseMessage = `O campo "${fieldName}" possui uma data inválida.`;
                  break;
               case "invalid_string":
                  baseMessage = `O campo "${fieldName}" possui um formato de string inválido.`;
                  break;
               case "invalid_number":
                  baseMessage = `O campo "${fieldName}" possui um valor numérico inválido.`;
                  break;
               case "custom":
                  baseMessage = `Erro no campo "${fieldName}": ${error.message}`;
                  break;
               default:
                  baseMessage = `Erro no campo "${fieldName}": ${error.message}`;
                  break;
            }

            return baseMessage;
         })
         .join("\n");
   } catch (error) {
      console.error("Erro ao processar a string de erro:", error);
      return "Erro ao processar a string de erro.";
   }
};
