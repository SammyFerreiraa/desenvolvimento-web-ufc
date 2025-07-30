import { apiClient } from "@/config/trpc/react";

export const useSession = () => {
   const { data, isLoading, error, refetch } = apiClient.auth.getSession.useQuery(undefined, {
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      refetchInterval: 5 * 60 * 1000 // 5 minutes
   });

   return {
      isAuthenticated: !!data?.authenticated,
      user: data?.user,
      isLoading,
      error,
      refetch
   };
};
