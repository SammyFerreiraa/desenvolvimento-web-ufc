import { createTokens, setAuthCookies } from "@/common/auth";
import type { SessionUser } from "@/common/auth-edge";
import { prisma } from "@/server/config/prisma";
import type { UserRole } from "@prisma/client";
import type { AuthCredentials, AuthProvider, AuthResult } from "./providers/core";
import { githubProvider } from "./providers/github";
import { googleProvider } from "./providers/google";
import { magicLinkProvider } from "./providers/magic-link";

const providers = new Map<string, AuthProvider>();

export const registerProvider = (provider: AuthProvider) => {
   providers.set(provider.name, provider);
};

export const getProvider = (name: string): AuthProvider | undefined => {
   return providers.get(name);
};

export const getAvailableProviders = () => {
   return Array.from(providers.values()).map((p) => ({
      name: p.name,
      type: p.type
   }));
};

export const getOAuthProviders = () => {
   return Array.from(providers.values())
      .filter((p) => p.type === "oauth")
      .map((p) => ({
         name: p.name,
         displayName: getDisplayName(p.name)
      }));
};

const getDisplayName = (providerName: string): string => {
   const displayNames: Record<string, string> = {
      google: "Google",
      github: "GitHub",
      facebook: "Facebook",
      twitter: "Twitter",
      discord: "Discord"
   };
   return displayNames[providerName] || providerName;
};

const findOrCreateUser = async (userData: NonNullable<AuthResult["user"]>): Promise<SessionUser> => {
   let user = await prisma.user.findUnique({
      where: { email: userData.email }
   });

   if (!user) {
      user = await prisma.user.create({
         data: {
            email: userData.email,
            name: userData.name,
            image: userData.image,
            emailVerified: userData.emailVerified ? new Date() : null,
            role: "MEMBER" as UserRole
         }
      });
   } else if (userData.emailVerified && !user.emailVerified) {
      user = await prisma.user.update({
         where: { id: user.id },
         data: { emailVerified: new Date() }
      });
   }

   return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image
   };
};

export const authenticate = async (providerName: string, credentials: AuthCredentials) => {
   const provider = getProvider(providerName);

   if (!provider) {
      return { success: false, error: "Provider not found" };
   }

   const result = await provider.authenticate(credentials);

   if (!result.success || !result.user) {
      return {
         success: result.success,
         error: result.error,
         requiresVerification: result.requiresVerification,
         verificationToken: result.verificationToken
      };
   }

   const user = await findOrCreateUser(result.user);
   const tokens = await createTokens(user);

   return { success: true, tokens, user };
};

export const getAuthUrl = async (providerName: string, state?: string) => {
   const provider = getProvider(providerName);
   return provider?.getAuthUrl ? await provider.getAuthUrl(state) : null;
};

export const handleCallback = async (
   providerName: string,
   code: string,
   state?: string,
   requestInfo?: { ipAddress?: string; userAgent?: string }
) => {
   const provider = getProvider(providerName);

   if (!provider?.handleCallback) {
      throw new Error("Provider does not support callbacks");
   }

   const result = await provider.handleCallback(code, state);

   if (!result.success || !result.user) {
      return result;
   }

   const user = await findOrCreateUser(result.user);
   const tokens = await createTokens(user, requestInfo);
   await setAuthCookies(tokens.accessToken, tokens.refreshToken);

   return { success: true, tokens, user };
};

registerProvider(googleProvider);
registerProvider(magicLinkProvider);
registerProvider(githubProvider);

export const authManager = {
   registerProvider,
   getProvider,
   getAvailableProviders,
   getOAuthProviders,
   authenticate,
   getAuthUrl,
   handleCallback
};
