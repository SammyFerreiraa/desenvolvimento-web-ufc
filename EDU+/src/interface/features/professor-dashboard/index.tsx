"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, Users } from "lucide-react";
import { apiClient } from "@/config/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { useSession } from "@/interface/hooks/useSession";

type TurmaData = {
   id: string;
   nome: string;
   serie: string;
   ativa: boolean;
   _count: {
      alunos: number;
      listas: number;
   };
};

export function ProfessorDashboard() {
   const { user } = useSession();
   const [currentTime, setCurrentTime] = useState(new Date());

   // Atualizar horário a cada minuto
   useEffect(() => {
      const timer = setInterval(() => {
         setCurrentTime(new Date());
      }, 60000);

      return () => clearInterval(timer);
   }, []);

   // Buscar dados das turmas
   const { data: turmasData, isLoading } = apiClient.turmas.list.useQuery({});

   const turmas = turmasData?.turmas || [];
   const totalAlunos = turmas.reduce((total, turma) => total + (turma._count?.alunos || 0), 0);
   const totalListas = turmas.reduce((total, turma) => total + (turma._count?.listas || 0), 0);

   const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("pt-BR", {
         weekday: "long",
         year: "numeric",
         month: "long",
         day: "numeric"
      }).format(date);
   };

   const formatTime = (date: Date) => {
      return new Intl.DateTimeFormat("pt-BR", {
         hour: "2-digit",
         minute: "2-digit"
      }).format(date);
   };

   return (
      <div className="min-h-screen">
         {/* Header */}
         <div className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-4">
               <div className="flex items-center justify-between">
                  <div className="flex items-center">
                     <h1 className="text-lg font-bold text-[#58876A]">EDU Plus</h1>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Content */}
         <div className="mx-auto max-w-7xl bg-white px-6 py-8">
            {/* Welcome Section */}
            <div className="relative mb-8 overflow-hidden rounded-xl bg-[#58876A] p-8 text-white">
               <div>
                  <h1 className="mb-2 text-3xl font-bold">Bem-vindo(a) de volta, {user?.name || "Professor"}</h1>
               </div>
               <p className="mb-4 text-green-100">{formatDate(currentTime)}</p>
            </div>

            {/* Statistics Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
               <Card className="border-green-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium text-gray-600">Total de Turmas</CardTitle>
                     <BookOpen className="h-4 w-4 text-[#58876A]" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold text-[#58876A]">{turmas.length}</div>
                     <p className="mt-1 text-xs text-[#58876A]">{turmas.filter((t) => t.ativa).length} ativas</p>
                  </CardContent>
               </Card>

               <Card className="border-green-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium text-gray-600">Total de Alunos</CardTitle>
                     <Users className="h-4 w-4 text-[#58876A]" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold text-[#58876A]">{totalAlunos}</div>
                     <p className="mt-1 text-xs text-[#58876A]">Distribuídos em {turmas.length} turmas</p>
                  </CardContent>
               </Card>

               <Card className="border-green-100">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium text-gray-600">Total de Listas</CardTitle>
                     <Clock className="h-4 w-4 text-[#58876A]" />
                  </CardHeader>
                  <CardContent>
                     <div className="text-2xl font-bold text-[#58876A]">{totalListas}</div>
                     <p className="mt-1 text-xs text-[#58876A]">Listas de exercícios criadas</p>
                  </CardContent>
               </Card>
            </div>

            {/* Turmas Grid */}
            <div className="space-y-6">
               <div>
                  <h2 className="mb-6 text-2xl font-bold text-gray-800">Suas Turmas</h2>

                  {isLoading ? (
                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                           <Card key={i} className="animate-pulse">
                              <CardContent className="p-4">
                                 <div className="mb-2 h-4 rounded bg-gray-200"></div>
                                 <div className="mb-4 h-3 w-2/3 rounded bg-gray-200"></div>
                                 <div className="flex items-center justify-between">
                                    <div className="h-6 w-16 rounded bg-gray-200"></div>
                                    <div className="h-3 w-20 rounded bg-gray-200"></div>
                                 </div>
                              </CardContent>
                           </Card>
                        ))}
                     </div>
                  ) : turmas.length > 0 ? (
                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {turmas.map((turma) => (
                           <Card key={turma.id} className="border-green-100 transition-shadow hover:shadow-md">
                              <CardContent className="p-6">
                                 <div className="mb-3 flex items-start justify-between">
                                    <div>
                                       <h3 className="mb-1 font-semibold text-gray-800">{turma.nome}</h3>
                                       <p className="text-sm text-gray-600">{turma.serie}</p>
                                    </div>
                                 </div>

                                 <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                       <span className="text-gray-600">Alunos:</span>
                                       <span className="font-semibold text-green-700">{turma._count?.alunos || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                       <span className="text-gray-600">Listas:</span>
                                       <span className="font-semibold text-green-700">{turma._count?.listas || 0}</span>
                                    </div>
                                 </div>
                              </CardContent>
                           </Card>
                        ))}
                     </div>
                  ) : (
                     <div className="py-12 text-center">
                        <BookOpen className="mx-auto mb-4 h-12 w-12 text-green-400" />
                        <h3 className="mb-2 text-lg font-medium text-gray-800">Nenhuma turma encontrada</h3>
                        <p className="mb-4 text-gray-600">Você ainda não possui turmas cadastradas.</p>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
