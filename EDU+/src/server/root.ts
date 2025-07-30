import { z } from "zod";
import { createCallerFactory, createTRPCRouter, procedures } from "./config/trpc";
import { logger } from "./domain/logger";
import { authRouter } from "./routers/auth/router";
import { listaExerciciosRouter } from "./routers/lista-exercicios/router";
import { questoesRouter } from "./routers/questoes/router";
import { tentativasRouter } from "./routers/tentativas/router";
import { turmasRouter } from "./routers/turmas/router";

const p = procedures.protected;

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
   auth: authRouter,
   turmas: turmasRouter,
   questoes: questoesRouter,
   listaExercicios: listaExerciciosRouter,
   tentativas: tentativasRouter,
   logger: createTRPCRouter({
      send: p.input(z.object({ data: z.any(), title: z.string(), level: z.string() })).mutation(async ({ input }) => {
         await logger.custom({ level: input.level, title: input.title, data: input.data });
      })
   })
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
