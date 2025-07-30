"use client";

import React from "react";
import { AlertOctagon, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader } from "@/interface/components/card";
import { Button } from "@/interface/components/ui/button";

export const InvalidTokenPage = () => {
   const router = useRouter();
   return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
         <Card className="w-full max-w-md border-slate-200 shadow-lg">
            <CardHeader className="flex flex-col items-center gap-2 pb-2">
               <div className="rounded-full bg-red-50 p-3">
                  <AlertOctagon className="h-8 w-8 text-red-500" />
               </div>
               <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
                  Link de acesso expirado ou inválido
               </h2>
            </CardHeader>
            <CardContent>
               <p className="text-center text-slate-600">
                  Tente fazer login novamente para gerar um novo link de acesso.
               </p>
            </CardContent>
            <CardFooter className="flex justify-center pt-2 pb-6">
               <Button onClick={() => router.replace("/login")} className="group gap-2 transition-all hover:gap-3">
                  Ir para o Login
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
               </Button>
            </CardFooter>
         </Card>
      </div>
   );
};
