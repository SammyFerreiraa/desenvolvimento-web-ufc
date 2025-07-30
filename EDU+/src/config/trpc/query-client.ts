import toast from "react-hot-toast";
import SuperJSON from "superjson";
import { defaultShouldDehydrateQuery, QueryCache, QueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";

export const createQueryClient = () =>
   new QueryClient({
      defaultOptions: {
         queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 30 * 1000
         },
         dehydrate: {
            serializeData: SuperJSON.serialize,
            shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === "pending"
         },
         hydrate: {
            deserializeData: SuperJSON.deserialize
         },
         mutations: {
            onError: (error) => {
               if (error instanceof TRPCClientError) {
                  toast.error(error.message);
               }
            }
         }
      },
      queryCache: new QueryCache({
         onError: (error) => {
            if (error instanceof TRPCClientError) {
               toast.error(error.message);
            }
            throw error;
         }
      })
   });
