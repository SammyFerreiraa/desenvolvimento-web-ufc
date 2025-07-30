"use client";

import { Shield } from "lucide-react";
import { Button } from "@/interface/components/ui/button";

export const UnauthorizedPage = () => {
   return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
         <div className="mx-4 w-full max-w-sm">
            <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
               <div className="mb-4 flex justify-center">
                  <Shield className="h-12 w-12 text-red-500" />
               </div>

               <h1 className="mb-2 text-xl font-semibold text-gray-900">Acesso Negado</h1>

               <p className="mb-4 text-sm text-gray-600">Você não tem permissão para acessar esta página.</p>

               <Button
                  onClick={() => window.history.back()}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
               >
                  Voltar
               </Button>
            </div>
         </div>
      </div>
   );
};
