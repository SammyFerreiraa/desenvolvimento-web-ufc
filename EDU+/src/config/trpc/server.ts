import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { createTRPCContext } from "@/server/config/trpc";
import { createCaller, type AppRouter } from "@/server/root";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(() => {
   const heads = new Headers(headers() as unknown as HeadersInit);
   heads.set("x-trpc-source", "rsc");

   return createTRPCContext({
      headers: heads,
      resHeaders: new Headers()
   });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: apiServer, HydrateClient } = createHydrationHelpers<AppRouter>(caller, getQueryClient);
