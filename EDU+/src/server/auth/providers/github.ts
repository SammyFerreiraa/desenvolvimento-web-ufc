/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/config/env";
import { logger } from "@/server/domain/logger";
import { generateCSRFState, validateCSRFState } from "../csrf-protection";
import type { AuthCredentials, AuthProvider, AuthResult } from "./core";

const getAuthUrl = async (redirectUrl?: string): Promise<string> => {
   const csrfState = generateCSRFState(redirectUrl);

   const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID!,
      redirect_uri: `${env.NEXT_PUBLIC_API_URL}/api/auth/callback/github`,
      scope: "user:email",
      state: csrfState
   });

   return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

const exchangeCodeForToken = async (code: string) => {
   const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         Accept: "application/json"
      },
      body: JSON.stringify({
         client_id: process.env.GITHUB_CLIENT_ID,
         client_secret: process.env.GITHUB_CLIENT_SECRET,
         code
      })
   });

   if (!response.ok) throw new Error("Failed to exchange code for token");
   return response.json();
};

const fetchGitHubUser = async (accessToken: string) => {
   const userResponse = await fetch("https://api.github.com/user", {
      headers: {
         Authorization: `Bearer ${accessToken}`,
         "User-Agent": "MyApp"
      }
   });

   if (!userResponse.ok) throw new Error("Failed to fetch user info");
   return userResponse.json();
};

const fetchGitHubEmails = async (accessToken: string) => {
   const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
         Authorization: `Bearer ${accessToken}`,
         "User-Agent": "MyApp"
      }
   });

   return emailResponse.ok ? emailResponse.json() : null;
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
      const githubUser = await fetchGitHubUser(access_token);

      // Busca email (pode ser privado)
      let email = githubUser.email;
      if (!email) {
         const emails = await fetchGitHubEmails(access_token);
         if (emails) {
            const primaryEmail = emails.find((e: any) => e.primary);
            email = primaryEmail?.email;
         }
      }

      if (!email) {
         return { success: false, error: "No email found in GitHub account" };
      }

      return {
         success: true,
         user: {
            email,
            name: githubUser.name || githubUser.login,
            image: githubUser.avatar_url,
            emailVerified: true
         }
      };
   } catch (error) {
      await logger.error("GitHub OAuth error:", error);
      return { success: false, error: "GitHub OAuth authentication failed" };
   }
};

const authenticate = async (_credentials: AuthCredentials): Promise<AuthResult> => {
   throw new Error("Direct authentication not supported for OAuth providers");
};

export const githubProvider: AuthProvider = {
   name: "github",
   type: "oauth",
   authenticate,
   getAuthUrl,
   handleCallback
};
