"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { turmaUpdateSchema, type TurmaUpdateInput } from "@/common/schemas/edu-plus";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/interface/components/ui/select";
import { turmasApi } from "@/services/turmas-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { SerieLevel } from "@prisma/client";

export function EditarTurmaPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const turmaId = searchParams.get("id");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [turma, setTurma] = useState<{ nome: string; serie: SerieLevel; anoLetivo: number } | null>(null);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors }
   } = useForm<TurmaUpdateInput>({
      resolver: zodResolver(turmaUpdateSchema)
   });

   // Buscar dados da turma
   useEffect(() => {
      const loadTurma = async () => {
         if (!turmaId) return;

         try {
            setIsLoading(true);
            const turmaData = await turmasApi.getById(turmaId);
            setTurma(turmaData);
         } catch (error) {
            console.error("Erro ao carregar turma:", error);
            setErrorMessage("Erro ao carregar dados da turma.");
         } finally {
            setIsLoading(false);
         }
      };

      void loadTurma();
   }, [turmaId]);

   // Preencher form quando a turma é carregada
   useEffect(() => {
      if (turma) {
         setValue("nome", turma.nome);
         setValue("serie", turma.serie);
         setValue("anoLetivo", turma.anoLetivo);
      }
   }, [turma, setValue]);

   const onSubmit = async (data: TurmaUpdateInput) => {
      if (!turmaId) return;

      setIsSubmitting(true);
      setErrorMessage(null);

      try {
         await turmasApi.update(turmaId, data);
         router.push("/professor/turmas");
      } catch (error: unknown) {
         console.error("Erro ao editar turma:", error);
         const errorMsg =
            error instanceof Error && "response" in error
               ? (error as { response?: { data?: { error?: string } } })?.response?.data?.error
               : undefined;
         setErrorMessage(errorMsg || "Erro ao editar turma. Tente novamente.");
      } finally {
         setIsSubmitting(false);
      }
   };

   const serie = watch("serie");

   if (!turmaId) {
      return (
         <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
               <h1 className="text-2xl font-bold text-red-600">Erro</h1>
               <p className="mt-2 text-gray-600">ID da turma não fornecido</p>
               <Button onClick={() => router.push("/professor/turmas")} className="mt-4">
                  Voltar para Turmas
               </Button>
            </div>
         </div>
      );
   }

   if (isLoading) {
      return (
         <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-gray-200 bg-white px-6 py-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center space-x-2"
                     >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Voltar</span>
                     </Button>
                     <div className="h-6 border-l border-gray-300" />
                  </div>
               </div>
            </div>

            {/* Loading */}
            <div className="mx-auto max-w-4xl px-6 py-8">
               <Card>
                  <CardHeader>
                     <div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {[...Array(3)].map((_, i) => (
                           <div key={i} className="space-y-2">
                              <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                              <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      );
   }

   if (!turma) {
      return (
         <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
               <h1 className="text-2xl font-bold text-red-600">Turma não encontrada</h1>
               <p className="mt-2 text-gray-600">A turma solicitada não existe ou foi removida</p>
               <Button onClick={() => router.push("/professor/turmas")} className="mt-4">
                  Voltar para Turmas
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen">
         {/* Header */}
         <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
               <div className="flex items-center space-x-4">
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => router.back()}
                     className="flex items-center space-x-2"
                  >
                     <ArrowLeft className="h-4 w-4" />
                     <span>Voltar</span>
                  </Button>
                  <div className="h-6 border-l border-gray-300" />
               </div>
            </div>
         </div>

         {/* Content */}
         <div className="mx-auto max-w-4xl px-6 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
               {/* Informações da turma */}
               <Card>
                  <CardHeader>
                     <CardTitle>Informações da turma</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                     {errorMessage && (
                        <div className="rounded-md bg-red-50 p-4">
                           <div className="text-sm text-red-700">{errorMessage}</div>
                        </div>
                     )}

                     <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                           <Label htmlFor="nome">Nome da turma</Label>
                           <Input
                              id="nome"
                              placeholder="Ex: Turma A"
                              {...register("nome")}
                              error={errors.nome?.message}
                           />
                        </div>

                        {serie && (
                           <div className="space-y-2">
                              <Label htmlFor="serie">Série</Label>
                              <Select value={serie} onValueChange={(value) => setValue("serie", value as SerieLevel)}>
                                 <SelectTrigger>
                                    <SelectValue placeholder="Selecione a série" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value={SerieLevel.PRIMEIRO_ANO}>1º Ano</SelectItem>
                                    <SelectItem value={SerieLevel.SEGUNDO_ANO}>2º Ano</SelectItem>
                                    <SelectItem value={SerieLevel.TERCEIRO_ANO}>3º Ano</SelectItem>
                                    <SelectItem value={SerieLevel.QUARTO_ANO}>4º Ano</SelectItem>
                                    <SelectItem value={SerieLevel.QUINTO_ANO}>5º Ano</SelectItem>
                                 </SelectContent>
                              </Select>
                              {errors.serie && <p className="text-sm text-red-600">{errors.serie.message}</p>}
                           </div>
                        )}

                        <div className="space-y-2">
                           <Label htmlFor="anoLetivo">Ano Letivo</Label>
                           <Input
                              id="anoLetivo"
                              type="number"
                              min="2020"
                              max="2030"
                              {...register("anoLetivo", { valueAsNumber: true })}
                              error={errors.anoLetivo?.message}
                           />
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Buttons */}
               <div className="flex justify-end space-x-4 border-gray-200 pt-6">
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                     Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
}
