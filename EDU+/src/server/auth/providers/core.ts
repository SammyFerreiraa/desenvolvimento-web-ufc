export type AuthResult = {
   success: boolean;
   user?: {
      id?: string;
      email: string;
      name?: string;
      image?: string;
      emailVerified?: boolean;
   };
   error?: string;
   requiresVerification?: boolean;
   verificationToken?: string;
};

export type AuthCredentials = {
   email?: string;
   code?: string;
   phone?: string;
   token?: string;
   password?: string;
   [key: string]: unknown;
};

export type AuthProviderType = "oauth" | "email" | "sms" | "custom";

export type AuthProvider = {
   name: string;
   type: AuthProviderType;
   authenticate: (credentials: AuthCredentials) => Promise<AuthResult>;
   getAuthUrl?: (redirectUrl?: string) => Promise<string>;
   handleCallback?: (code: string, state?: string) => Promise<AuthResult>;
};
