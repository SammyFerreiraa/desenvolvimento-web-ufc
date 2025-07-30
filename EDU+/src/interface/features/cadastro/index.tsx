"use client";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Link from "next/link";
import type { ICadastro } from "@/common/schemas/user";
import { cadastroSchema } from "@/common/schemas/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/card";
import { Button } from "@/interface/components/ui/button";
import { InputForm } from "@/interface/components/ui/input";
import { authApi } from "@/services/auth-api";
import { zodResolver } from "@hookform/resolvers/zod";

export const CadastroPage = () => {
   const {
      formState: { isSubmitting },
      control,
      handleSubmit
   } = useForm<ICadastro>({
      resolver: zodResolver(cadastroSchema),
      mode: "onChange",
      defaultValues: {
         nome: "",
         email: ""
      }
   });

   const submitCadastro = async (data: ICadastro) => {
      try {
         await authApi.cadastro({ nome: data.nome, email: data.email });
         toast.success("Cadastro realizado! Foi enviado um link de acesso para o seu e-mail");
      } catch (error) {
         toast.error("Erro ao fazer cadastro. Tente novamente.");
         console.error("Erro no cadastro:", error);
      }
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

         <div className="relative z-10 flex h-screen items-center justify-center px-4">
            <Card className="w-full max-w-md border border-white/20 bg-white/95 shadow-2xl backdrop-blur-sm">
               <CardHeader>
                  <CardTitle className="text-center text-2xl font-bold text-gray-800">EDU+ Professor</CardTitle>
                  <p className="text-center text-sm text-gray-600">Crie sua conta para gerenciar turmas</p>
               </CardHeader>
               <CardContent className="space-y-6">
                  <form className="space-y-4" onSubmit={handleSubmit(submitCadastro)}>
                     <div className="space-y-2">
                        <InputForm name="nome" control={control} label="Nome completo" />
                     </div>
                     <div className="space-y-2">
                        <InputForm name="email" control={control} label="E-mail" />
                     </div>
                     <Button type="submit" className="w-full" isLoading={isSubmitting}>
                        Cadastrar
                     </Button>
                  </form>

                  <div className="border-t pt-4">
                     <p className="mb-3 text-center text-sm text-gray-600">Já tem uma conta?</p>
                     <Link href="/login" className="block">
                        <Button variant="outline" className="w-full">
                           Fazer login
                        </Button>
                     </Link>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
   );
};
