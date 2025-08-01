"use client";

import { useState } from "react";
import SuperJSON from "superjson";
import { type AppRouter } from "@/server/root";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createTRPCClient, httpBatchLink, httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined = undefined;
const getQueryClient = () => {
   if (typeof window === "undefined") {
      // Server: always make a new query client
      return createQueryClient();
   }
   // Browser: use singleton pattern to keep the same query client
   return (clientQueryClientSingleton ??= createQueryClient());
};

export const apiClient = createTRPCReact<AppRouter>();

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCReactProvider(props: { children: React.ReactNode }) {
   const queryClient = getQueryClient();

   const [trpcClient] = useState(() =>
      apiClient.createClient({
         links: [
            loggerLink({
               enabled: (op) =>
                  process.env.NODE_ENV === "development" || (op.direction === "down" && op.result instanceof Error)
            }),
            httpBatchStreamLink({
               transformer: SuperJSON,
               url: getBaseUrl() + "/api/trpc",
               headers: () => {
                  const headers = new Headers();
                  headers.set("x-trpc-source", "nextjs-react");
                  return headers;
               }
            })
         ]
      })
   );

   return (
      <QueryClientProvider client={queryClient}>
         <apiClient.Provider client={trpcClient} queryClient={queryClient}>
            <ReactQueryDevtools initialIsOpen={false} />
            {props.children}
         </apiClient.Provider>
      </QueryClientProvider>
   );
}

function getBaseUrl() {
   if (typeof window !== "undefined") return window.location.origin;
   if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
   return `http://localhost:${process.env.PORT ?? 3000}`;
}

const links = [
   httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: SuperJSON
   })
];

export const directApi = createTRPCClient<AppRouter>({
   links: links
});
