"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { turmaUpdateSchema, type TurmaUpdateInput } from "@/common/schemas/edu-plus";
import { apiClient } from "@/config/trpc/react";
import { Button } from "@/interface/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from "@/interface/components/ui/dialog";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/interface/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { SerieLevel, type Turma } from "@prisma/client";

type EditarTurmaModalProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   turma: Turma | null;
   onSuccess: () => void;
};

export function EditarTurmaModal({ open, onOpenChange, turma, onSuccess }: EditarTurmaModalProps) {
   const [isSubmitting, setIsSubmitting] = useState(false);

   const {
      register,
      handleSubmit,
      setValue,
      watch,
      reset,
      formState: { errors }
   } = useForm<TurmaUpdateInput>({
      resolver: zodResolver(turmaUpdateSchema)
   });

   const updateMutation = apiClient.turmas.update.useMutation({
      onSuccess: () => {
         onSuccess();
         reset();
         onOpenChange(false);
      },
      onError: (error: unknown) => {
         console.error("Erro ao editar turma:", error);
      }
   });

   // Atualizar form quando a turma muda
   useEffect(() => {
      if (turma) {
         setValue("nome", turma.nome);
         setValue("serie", turma.serie);
         setValue("anoLetivo", turma.anoLetivo);
      }
   }, [turma, setValue]);

   const onSubmit = async (data: TurmaUpdateInput) => {
      if (!turma) return;

      setIsSubmitting(true);
      try {
         await updateMutation.mutateAsync({
            id: turma.id,
            data: data
         });
      } finally {
         setIsSubmitting(false);
      }
   };

   const serie = watch("serie");

   if (!turma) return null;

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
               <DialogTitle>Editar Turma</DialogTitle>
               <DialogDescription>Edite as informações da turma {turma.nome}.</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Turma</Label>
                  <Input id="nome" placeholder="Ex: 1º Ano A" {...register("nome")} error={errors.nome?.message} />
               </div>

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
                  {errors.serie && <p className="text-sm text-red-500">{errors.serie.message}</p>}
               </div>

               <div className="space-y-2">
                  <Label htmlFor="anoLetivo">Ano Letivo</Label>
                  <Input
                     id="anoLetivo"
                     type="number"
                     placeholder="2025"
                     {...register("anoLetivo", { valueAsNumber: true })}
                     error={errors.anoLetivo?.message}
                  />
               </div>

               <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                     Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                     {isSubmitting ? "Salvando..." : "Salvar Alterações"}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}
