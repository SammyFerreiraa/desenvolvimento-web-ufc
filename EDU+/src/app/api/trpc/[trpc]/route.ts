import { type NextRequest } from "next/server";
import { env } from "@/config/env";
import { createTRPCContext } from "@/server/config/trpc";
import { logger } from "@/server/domain/logger";
import { appRouter } from "@/server/root";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */
const createContext = async (req: NextRequest, resHeaders: Headers) => {
   const data = await createTRPCContext({
      headers: req.headers,
      resHeaders
   });
   return data;
};

const handler = (req: NextRequest) => {
   return fetchRequestHandler({
      endpoint: "/api/trpc",
      req,
      router: appRouter,
      createContext: ({ resHeaders }) => createContext(req, resHeaders),
      onError:
         env.NODE_ENV === "development"
            ? ({ path, error }) => {
                 logger.error(path!, { data: error }).catch(console.error);
              }
            : undefined
   });
};

export { handler as GET, handler as POST };
