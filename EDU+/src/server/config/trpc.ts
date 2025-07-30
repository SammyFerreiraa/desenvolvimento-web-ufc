import superjson from "superjson";
import { ZodError } from "zod";
import { getAuthSession } from "@/common/auth";
import { ACCESS_TOKEN_EXPIRES, validateRefreshTokenEdge, verifyAccessToken } from "@/common/auth-edge";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { initTRPC, TRPCError } from "@trpc/server";
import type { MiddlewareResult } from "@trpc/server/unstable-core-do-not-import";
import { logger } from "../domain/logger";
import { formatValidationErrorsFromString, trpcCustomMessage } from "../utils/error-utils";
import { parseCookies } from "../utils/parse-cookies";

export const createTRPCContext = async (opts: { headers: Headers; resHeaders: Headers }) => {
   let session = await getAuthSession();
   const { headers, resHeaders } = opts;

   const cookies = parseCookies(headers);
   const refreshToken = cookies["refreshToken"];
   const accessToken = cookies["accessToken"];
   if (accessToken) {
      try {
         const user = await verifyAccessToken(accessToken);
         if (user) {
            session = user;
         } else {
            session = null;
         }
      } catch (error) {
         void logger.error("Error verifying access token:", error);
         session = null;
      }
   }

   if (!session && refreshToken) {
      try {
         const refreshResult = await validateRefreshTokenEdge(refreshToken);

         if (refreshResult) {
            const accessTokenCookie = `accessToken=${refreshResult.accessToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${ACCESS_TOKEN_EXPIRES}`;
            resHeaders.append("set-cookie", accessTokenCookie);

            session = refreshResult.user;
         } else {
            const clearRefreshCookie = "refreshToken=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
            resHeaders.append("set-cookie", clearRefreshCookie);
         }
      } catch (error) {
         void logger.error("Error validating refresh token:", error);
         const clearRefreshCookie = "refreshToken=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0";
         resHeaders.append("set-cookie", clearRefreshCookie);
      }
   }

   return {
      session,
      headers,
      resHeaders
   };
};

export const asyncLocalStorage = new AsyncLocalStorage<{ userId: string | undefined }>();

const t = initTRPC.context<typeof createTRPCContext>().create({
   transformer: superjson,
   errorFormatter({ shape, error }) {
      return {
         ...shape,
         data: {
            ...shape.data,
            zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
         }
      };
   }
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const errorHandlingMiddleware = t.middleware(({ ctx, next }) => {
   return asyncLocalStorage.run({ userId: ctx.session?.id }, async () => {
      const result = await next({ ctx });

      if (result && !result.ok) {
         const { error } = result;

         await logger.error(error.message, error);

         if (error instanceof TRPCError) {
            if (error.cause instanceof PrismaClientValidationError) {
               throw new TRPCError({
                  code: "INTERNAL_SERVER_ERROR",
                  message: trpcCustomMessage("INTERNAL_SERVER_ERROR")
               });
            }
            if (error.cause instanceof ZodError) {
               throw new TRPCError({
                  code: "BAD_REQUEST",
                  message: formatValidationErrorsFromString(error.message)
               });
            }
            throw new TRPCError({
               code: error.code,
               message: trpcCustomMessage(error.code, error.message)
            });
         }

         throw error;
      }

      return result;
   });
});

const authMiddleware = t.middleware(async ({ next, ctx }): Promise<MiddlewareResult<unknown>> => {
   if (!ctx.session) {
      throw new TRPCError({
         code: "UNAUTHORIZED",
         message: "Access token inválido ou expirado"
      });
   }

   return next({
      ctx: {
         ...ctx,
         session: ctx.session
      }
   });
});

const publicProcedure = t.procedure.use(errorHandlingMiddleware);

const protectedProcedure = t.procedure.use(errorHandlingMiddleware).use(authMiddleware);

export const procedures = {
   public: publicProcedure,
   protected: protectedProcedure
};

export type ICtx = Awaited<ReturnType<typeof createTRPCContext>>;
