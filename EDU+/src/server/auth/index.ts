export { authManager } from "./manager";
export type { AuthProvider, AuthResult, AuthCredentials } from "./providers/core";
export { googleProvider } from "./providers/google";
export { magicLinkProvider } from "./providers/magic-link";
export { githubProvider } from "./providers/github";

export {
   registerProvider,
   getProvider,
   getAvailableProviders,
   getOAuthProviders,
   authenticate,
   getAuthUrl,
   handleCallback
} from "./manager";
