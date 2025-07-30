import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { env } from "@/config/env";

const CSRF_SECRET = env.AUTH_SECRET;
const CSRF_TOKEN_EXPIRY = 10 * 60 * 1000; // 10 minutos

interface CSRFPayload {
   timestamp: number;
   nonce: string;
   redirectUrl?: string;
}

export const generateCSRFState = (redirectUrl?: string): string => {
   const payload: CSRFPayload = {
      timestamp: Date.now(),
      nonce: randomBytes(16).toString("hex"),
      redirectUrl
   };

   const payloadStr = JSON.stringify(payload);
   const payloadBase64 = Buffer.from(payloadStr).toString("base64url");

   const signature = createHmac("sha256", CSRF_SECRET).update(payloadBase64).digest("base64url");

   return `${payloadBase64}.${signature}`;
};

export const validateCSRFState = (state: string): { valid: boolean; redirectUrl?: string } => {
   try {
      if (!state || !state.includes(".")) {
         return { valid: false };
      }

      const [payloadBase64, receivedSignature] = state.split(".");

      if (!payloadBase64 || !receivedSignature) {
         return { valid: false };
      }

      const expectedSignature = createHmac("sha256", CSRF_SECRET).update(payloadBase64).digest("base64url");

      const signatureBuffer = Buffer.from(receivedSignature, "base64url");
      const expectedBuffer = Buffer.from(expectedSignature, "base64url");

      if (signatureBuffer.length !== expectedBuffer.length) {
         return { valid: false };
      }

      if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
         return { valid: false };
      }

      const payloadStr = Buffer.from(payloadBase64, "base64url").toString("utf-8");
      const payload: CSRFPayload = JSON.parse(payloadStr);

      const now = Date.now();
      if (now - payload.timestamp > CSRF_TOKEN_EXPIRY) {
         return { valid: false };
      }

      return {
         valid: true,
         redirectUrl: payload.redirectUrl
      };
   } catch (_error) {
      return { valid: false };
   }
};
