"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { turmaCreateSchema, type TurmaCreateInput } from "@/common/schemas/edu-plus";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/interface/components/ui/select";
import { turmasApi } from "@/services/turmas-api";
import { zodResolver } from "@hookform/resolvers/zod";

export function CriarTurmaPage() {
   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors }
   } = useForm<TurmaCreateInput>({
      resolver: zodResolver(turmaCreateSchema),
      defaultValues: {
         anoLetivo: new Date().getFullYear()
      }
   });

   const onSubmit = async (data: TurmaCreateInput) => {
      setIsSubmitting(true);
      setErrorMessage(null);

      try {
         await turmasApi.create(data);
         router.push("/professor/turmas");
      } catch (error: unknown) {
         console.error("Erro ao criar turma:", error);
         const errorMsg =
            error instanceof Error && "response" in error
               ? (error as { response?: { data?: { error?: string } } })?.response?.data?.error
               : undefined;
         setErrorMessage(errorMsg || "Erro ao criar turma. Tente novamente.");
      } finally {
         setIsSubmitting(false);
      }
   };

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

         <div className="mx-auto max-w-4xl px-6 py-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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

                        <div className="space-y-2">
                           <Label htmlFor="serie">Série</Label>
                           <Select onValueChange={(value) => setValue("serie", value as TurmaCreateInput["serie"])}>
                              <SelectTrigger>
                                 <SelectValue placeholder="Selecione a série" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="PRIMEIRO_ANO">1º Ano</SelectItem>
                                 <SelectItem value="SEGUNDO_ANO">2º Ano</SelectItem>
                                 <SelectItem value="TERCEIRO_ANO">3º Ano</SelectItem>
                                 <SelectItem value="QUARTO_ANO">4º Ano</SelectItem>
                                 <SelectItem value="QUINTO_ANO">5º Ano</SelectItem>
                              </SelectContent>
                           </Select>
                           {errors.serie && <p className="text-sm text-red-600">{errors.serie.message}</p>}
                        </div>

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
                     {isSubmitting ? "Criando..." : "Criar turma"}
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
}
