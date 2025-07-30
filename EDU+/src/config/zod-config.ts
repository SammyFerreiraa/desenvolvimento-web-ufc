import type { ZodErrorMap } from "zod";
import { defaultErrorMap, z, ZodIssueCode } from "zod";

const globalErrorMap: ZodErrorMap = (issue, ctx) => {
   if (issue.code === ZodIssueCode.invalid_type && issue.received === "undefined") {
      return { message: "Este campo é obrigatório." };
   }

   if (issue.code === ZodIssueCode.invalid_string && issue.validation === "email") {
      return { message: "Endereço de e-mail inválido." };
   }

   if (issue.code === ZodIssueCode.too_small && issue.minimum === 1) {
      return { message: "Este campo deve conter pelo menos 1 caractere." };
   }

   if (issue.code === ZodIssueCode.too_small && issue.type === "string" && issue.minimum === 1) {
      return { message: "Este campo deve conter pelo menos 1 caractere." };
   }

   return defaultErrorMap(issue, ctx);
};

z.setErrorMap(globalErrorMap);

export { z };
