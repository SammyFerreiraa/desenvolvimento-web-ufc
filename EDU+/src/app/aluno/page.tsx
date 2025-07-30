"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader } from "@/interface/components/ui/card";
import { Input } from "@/interface/components/ui/input";
import { alunoApi, type AlunoTurmaResponse } from "@/services/aluno-api";

export default function AlunoAcessoPage() {
   const router = useRouter();
   const [codigoAcesso, setCodigoAcesso] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!codigoAcesso.trim()) {
         setError("Digite seu código de acesso");
         return;
      }

      if (codigoAcesso.length !== 6) {
         setError("O código deve ter 6 caracteres");
         return;
      }

      setIsLoading(true);
      setError(null);

      try {
         const dadosAluno: AlunoTurmaResponse = await alunoApi.acessarTurma(codigoAcesso.toUpperCase());

         // Salvar dados do aluno no localStorage para não precisar fazer login novamente (apenas no cliente)
         if (typeof window !== "undefined") {
            localStorage.setItem("dadosAluno", JSON.stringify(dadosAluno));
         }

         // Redirecionar para o dashboard do aluno
         router.push(`/aluno/${dadosAluno.id}/dashboard`);
      } catch (error: any) {
         console.error("Erro ao acessar turma:", error);

         if (error.response?.status === 404) {
            setError("Código de acesso inválido. Verifique se digitou corretamente.");
         } else if (error.response?.status === 400) {
            setError(error.response.data?.error || "Erro ao acessar a turma");
         } else {
            setError("Erro ao conectar. Tente novamente.");
         }
      } finally {
         setIsLoading(false);
      }
   };

   const formatarCodigo = (valor: string) => {
      const limpo = valor.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      return limpo.slice(0, 6);
   };

   const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const valorFormatado = formatarCodigo(e.target.value);
      setCodigoAcesso(valorFormatado);
      setError(null);
   };

   return (
      <div className="relative min-h-screen overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-green-400"></div>

         <div className="absolute top-10 left-20 h-16 w-24 rounded-full bg-white opacity-90 shadow-lg"></div>
         <div className="absolute top-8 left-16 h-12 w-20 rounded-full bg-white opacity-70"></div>
         <div className="absolute top-20 right-32 h-20 w-32 rounded-full bg-white opacity-85 shadow-lg"></div>
         <div className="absolute top-16 right-28 h-16 w-28 rounded-full bg-white opacity-60"></div>
         <div className="absolute top-32 left-1/3 h-14 w-28 rounded-full bg-white opacity-80 shadow-md"></div>
         <div className="absolute top-28 left-1/3 h-10 w-24 rounded-full bg-white opacity-65"></div>

         <div className="absolute top-6 left-1/2 h-8 w-16 rounded-full bg-white opacity-60"></div>
         <div className="absolute top-24 right-16 h-10 w-18 rounded-full bg-white opacity-55"></div>
         <div className="absolute top-12 left-2/3 h-6 w-12 rounded-full bg-white opacity-50"></div>

         <div className="absolute bottom-0 left-0 h-64 w-full">
            <div className="absolute bottom-0 left-0 h-48 w-96 rounded-t-full bg-green-600 shadow-inner"></div>
            <div className="absolute bottom-0 left-64 h-56 w-80 rounded-t-full bg-green-500 shadow-inner"></div>
            <div className="absolute right-32 bottom-0 h-40 w-64 rounded-t-full bg-green-700 shadow-inner"></div>
            <div className="absolute right-0 bottom-0 h-52 w-72 rounded-t-full bg-green-600 shadow-inner"></div>
            <div className="absolute bottom-0 left-1/2 h-60 w-64 -translate-x-1/2 rounded-t-full bg-green-600 shadow-inner"></div>
         </div>

         <div className="relative z-10 h-screen px-4 py-8">
            <div className="mx-auto my-auto flex h-full max-w-md items-center justify-center">
               <Card className="w-full border border-white/20 bg-white/95 shadow-2xl backdrop-blur-sm">
                  <CardHeader className="pb-2 text-center">
                     <p className="text-lg font-medium text-gray-700">Digite seu código para acessar as atividades</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                           <Input
                              type="text"
                              placeholder="Ex: AB1234"
                              value={codigoAcesso}
                              onChange={handleCodigoChange}
                              className="h-14 border-2 text-center font-mono text-xl tracking-widest text-gray-900 focus:border-blue-500"
                              maxLength={6}
                              autoComplete="off"
                              disabled={isLoading}
                           />
                           <p className="mt-2 text-center text-xs text-gray-500">
                              Digite as 2 letras e 4 números do seu código
                           </p>
                        </div>

                        {error && (
                           <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                              <p className="text-center text-sm font-medium text-red-700">{error}</p>
                           </div>
                        )}

                        <Button
                           type="submit"
                           className="h-12 w-full bg-[#58876A] text-lg font-semibold text-white"
                           disabled={isLoading || codigoAcesso.length !== 6}
                        >
                           {isLoading ? (
                              <div className="flex items-center gap-2">
                                 <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                 Entrando...
                              </div>
                           ) : (
                              "Entrar na Turma"
                           )}
                        </Button>
                     </form>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}
