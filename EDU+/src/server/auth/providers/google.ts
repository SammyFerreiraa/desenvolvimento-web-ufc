import { env } from "@/config/env";
import { logger } from "@/server/domain/logger";
import { generateCSRFState, validateCSRFState } from "../csrf-protection";
import type { AuthCredentials, AuthProvider, AuthResult } from "./core";

const GOOGLE_CONFIG = {
   clientId: env.AUTH_GOOGLE_ID,
   clientSecret: env.AUTH_GOOGLE_SECRET,
   redirectUri: `${env.NEXT_PUBLIC_API_URL}/api/auth/callback/google`,
   scope: "openid email profile"
};

const getAuthUrl = async (redirectUrl?: string): Promise<string> => {
   const csrfState = generateCSRFState(redirectUrl);

   const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: "code",
      scope: GOOGLE_CONFIG.scope,
      state: csrfState,
      prompt: "consent",
      access_type: "offline"
   });

   return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

const exchangeCodeForToken = async (code: string) => {
   const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
         client_id: GOOGLE_CONFIG.clientId,
         client_secret: GOOGLE_CONFIG.clientSecret,
         code,
         grant_type: "authorization_code",
         redirect_uri: GOOGLE_CONFIG.redirectUri
      })
   });

   if (!response.ok) throw new Error("Failed to exchange code for token");
   return response.json();
};

const fetchGoogleUser = async (accessToken: string) => {
   const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);

   if (!response.ok) throw new Error("Failed to fetch user info");
   return response.json();
};

const handleCallback = async (code: string, state?: string): Promise<AuthResult> => {
   try {
      const stateValidation = validateCSRFState(state || "");
      if (!stateValidation.valid) {
         return {
            success: false,
            error: "Invalid or missing CSRF state parameter"
         };
      }

      const { access_token } = await exchangeCodeForToken(code);
      const googleUser = await fetchGoogleUser(access_token);

      return {
         success: true,
         user: {
            email: googleUser.email,
            name: googleUser.name,
            image: googleUser.picture,
            emailVerified: googleUser.verified_email
         }
      };
   } catch (error) {
      await logger.error("Google OAuth error", { error });
      return {
         success: false,
         error: error instanceof Error ? error.message : "OAuth failed"
      };
   }
};

const authenticate = async (_credentials: AuthCredentials): Promise<AuthResult> => {
   throw new Error("Direct authentication not supported for OAuth providers");
};

export const googleProvider: AuthProvider = {
   name: "google",
   type: "oauth",
   authenticate,
   getAuthUrl,
   handleCallback
};
