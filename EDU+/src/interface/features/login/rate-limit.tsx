import { ArrowLeft, Shield } from "lucide-react";
import Link from "next/link";

export const RatelLimitPage = () => {
   return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
         <div className="mx-4 w-full max-w-md">
            <div className="rounded-lg bg-white p-8 text-center shadow-lg">
               <div className="mb-6 flex justify-center">
                  <div className="rounded-full bg-yellow-100 p-4">
                     <Shield className="h-8 w-8 text-yellow-600" />
                  </div>
               </div>

               <h1 className="mb-4 text-2xl font-bold text-gray-900">Muitas tentativas detectadas</h1>

               <p className="mb-6 text-gray-600">
                  Por questões de segurança, temporariamente limitamos o acesso após muitas tentativas. Tente novamente
                  em instantes.
               </p>

               <div className="space-y-3">
                  <Link
                     href="/login"
                     className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                  >
                     <ArrowLeft className="mr-2 h-4 w-4" />
                     Voltar ao Login
                  </Link>

                  <Link
                     href="/"
                     className="inline-block w-full rounded-lg px-4 py-3 font-medium text-gray-600 transition-colors hover:text-gray-800"
                  >
                     Ir para a Página Inicial
                  </Link>
               </div>

               <div className="mt-8 border-t border-gray-200 pt-6">
                  <p className="text-xs text-gray-500">
                     Se você acredita que isto é um erro, entre em contato com o suporte
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};
