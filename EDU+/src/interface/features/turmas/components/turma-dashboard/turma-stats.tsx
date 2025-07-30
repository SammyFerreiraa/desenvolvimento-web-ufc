"use client";

import { BookOpen, Users } from "lucide-react";
import { Card, CardContent } from "@/interface/components/ui/card";

type TurmaStatsProps = {
   totalAlunos: number;
   totalListas: number;
   exerciciosResolvidos?: number;
   mediaAcertos?: number;
};

export function TurmaStats({ totalAlunos, totalListas }: TurmaStatsProps) {
   return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6">
         <Card>
            <CardContent className="p-4 sm:p-6">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-medium text-gray-600 sm:text-sm">Total de Alunos</p>
                     <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{totalAlunos}</p>
                  </div>
                  <Users className="h-6 w-6 text-blue-600 sm:h-8 sm:w-8" />
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardContent className="p-4 sm:p-6">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-xs font-medium text-gray-600 sm:text-sm">Listas de Exercícios</p>
                     <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{totalListas}</p>
                  </div>
                  <BookOpen className="h-6 w-6 text-green-600 sm:h-8 sm:w-8" />
               </div>
            </CardContent>
         </Card>
      </div>
   );
}
