"use client";

import { useEffect, useState } from "react";
import { BookOpen, Calendar, Plus, Settings, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent } from "@/interface/components/ui/card";
import { useSession } from "@/interface/hooks/useSession";
import { turmasApi } from "@/services/turmas-api";
import { UserRole } from "@prisma/client";

export function TurmasPage() {
   const { user } = useSession();
   const [turmasData, setTurmasData] = useState<{
      turmas: Array<{
         id: string;
         nome: string;
         serie: string;
         anoLetivo: number;
         _count?: { alunos?: number; listas?: number };
         professorId?: string;
      }>;
   } | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isDeleting, setIsDeleting] = useState(false);

   // Função para carregar turmas
   const loadTurmas = async () => {
      try {
         setIsLoading(true);
         const data = await turmasApi.list({ page: 0, limit: 20 });
         setTurmasData(data);
      } catch (error) {
         console.error("Erro ao carregar turmas:", error);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      void loadTurmas();
   }, []);

   const handleExcluirTurma = async (turmaId: string) => {
      if (confirm("Tem certeza que deseja excluir esta turma?")) {
         try {
            setIsDeleting(true);
            await turmasApi.delete(turmaId);
            await loadTurmas();
         } catch (error) {
            console.error("Erro ao excluir turma:", error);
            alert("Erro ao excluir turma. Tente novamente.");
         } finally {
            setIsDeleting(false);
         }
      }
   };

   const podeGerenciarTurmas = user?.role === UserRole.PROFESSOR || user?.role === UserRole.ADMIN;

   if (isLoading) {
      return (
         <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-4">
               {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                     <CardContent className="p-4 sm:p-6">
                        <div className="block sm:hidden">
                           <div className="mb-4">
                              <div className="h-5 w-40 rounded bg-gray-200"></div>
                              <div className="mt-2 h-4 w-20 rounded bg-gray-200"></div>
                           </div>
                           <div className="mb-4 space-y-3">
                              <div className="h-4 w-24 rounded bg-gray-200"></div>
                              <div className="h-4 w-32 rounded bg-gray-200"></div>
                              <div className="h-4 w-20 rounded bg-gray-200"></div>
                           </div>
                           <div className="space-y-2">
                              <div className="h-8 w-full rounded bg-gray-200"></div>
                              <div className="flex space-x-2">
                                 <div className="h-8 flex-1 rounded bg-gray-200"></div>
                                 <div className="h-8 flex-1 rounded bg-gray-200"></div>
                              </div>
                           </div>
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:justify-between">
                           <div className="flex items-center space-x-6">
                              <div>
                                 <div className="h-5 w-32 rounded bg-gray-200"></div>
                                 <div className="mt-2 h-4 w-20 rounded bg-gray-200"></div>
                              </div>
                              <div className="hidden lg:flex lg:space-x-6">
                                 <div className="h-4 w-16 rounded bg-gray-200"></div>
                                 <div className="h-4 w-20 rounded bg-gray-200"></div>
                                 <div className="h-4 w-16 rounded bg-gray-200"></div>
                              </div>
                           </div>
                           <div className="flex space-x-2">
                              <div className="h-8 w-24 rounded bg-gray-200 sm:w-32"></div>
                              <div className="h-8 w-8 rounded bg-gray-200"></div>
                              <div className="h-8 w-8 rounded bg-gray-200"></div>
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
         <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
               <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Minhas Turmas</h1>
               <p className="mt-2 text-sm text-gray-600 sm:text-base">
                  {user?.role === UserRole.ADMIN
                     ? "Gerencie todas as turmas do sistema"
                     : "Gerencie suas turmas e acompanhe o progresso dos alunos"}
               </p>
            </div>

            {podeGerenciarTurmas && (
               <Link href="/professor/turmas/criar" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                     <Plus className="mr-2 h-4 w-4" />
                     Nova Turma
                  </Button>
               </Link>
            )}
         </div>

         {turmasData?.turmas && turmasData.turmas.length > 0 ? (
            <div className="space-y-4">
               {turmasData.turmas.map((turma) => (
                  <Card key={turma.id} className="transition-shadow hover:shadow-lg">
                     <CardContent className="p-4 sm:p-6">
                        <div className="block sm:hidden">
                           <div className="mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">{turma.nome}</h3>
                              <Badge variant="secondary" className="mt-1">
                                 {turma.serie.replace("_", " ")}
                              </Badge>
                           </div>

                           <div className="mb-4 grid grid-cols-1 gap-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                 <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                                 <span>{turma._count?.alunos || 0} alunos</span>
                              </div>

                              <div className="flex items-center">
                                 <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                                 <span>Ano letivo: {turma.anoLetivo}</span>
                              </div>

                              <div className="flex items-center">
                                 <BookOpen className="mr-2 h-4 w-4 flex-shrink-0" />
                                 <span>{turma._count?.listas || 0} listas</span>
                              </div>
                           </div>

                           {podeGerenciarTurmas &&
                              (user?.role === UserRole.ADMIN || turma.professorId === user?.id) && (
                                 <div className="flex flex-col gap-2">
                                    <Link href={`/professor/turmas/dashboard?id=${turma.id}`} className="w-full">
                                       <Button variant="outline" size="sm" className="w-full">
                                          <Users className="mr-2 h-4 w-4" />
                                          Gerenciar turma
                                       </Button>
                                    </Link>
                                    <div className="flex gap-2">
                                       <Link href={`/professor/turmas/editar?id=${turma.id}`} className="flex-1">
                                          <Button variant="ghost" size="sm" className="w-full">
                                             <Settings className="mr-2 h-4 w-4" />
                                             Editar
                                          </Button>
                                       </Link>
                                       <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleExcluirTurma(turma.id)}
                                          className="flex-1 text-red-600 hover:text-red-800"
                                          disabled={isDeleting}
                                       >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Excluir
                                       </Button>
                                    </div>
                                 </div>
                              )}
                        </div>

                        <div className="hidden sm:flex sm:items-center sm:justify-between">
                           <div className="flex items-center space-x-6">
                              <div>
                                 <h3 className="text-xl font-semibold text-gray-900">{turma.nome}</h3>
                                 <Badge variant="secondary" className="mt-1">
                                    {turma.serie.replace("_", " ")}
                                 </Badge>
                              </div>

                              <div className="hidden lg:flex lg:items-center lg:space-x-6 lg:text-sm lg:text-gray-600">
                                 <div className="flex items-center">
                                    <Users className="mr-2 h-4 w-4" />
                                    <span>{turma._count?.alunos || 0} alunos</span>
                                 </div>

                                 <div className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Ano letivo: {turma.anoLetivo}</span>
                                 </div>

                                 <div className="flex items-center">
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    <span>{turma._count?.listas || 0} listas</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center space-x-2">
                              {podeGerenciarTurmas &&
                                 (user?.role === UserRole.ADMIN || turma.professorId === user?.id) && (
                                    <>
                                       <Link href={`/professor/turmas/dashboard?id=${turma.id}`}>
                                          <Button variant="outline" size="sm">
                                             <Users className="mr-2 h-4 w-4" />
                                             <span className="hidden md:inline">Gerenciar turma</span>
                                             <span className="md:hidden">Gerenciar</span>
                                          </Button>
                                       </Link>
                                       <Link href={`/professor/turmas/editar?id=${turma.id}`}>
                                          <Button variant="ghost" size="sm">
                                             <Settings className="h-4 w-4" />
                                          </Button>
                                       </Link>
                                       <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleExcluirTurma(turma.id)}
                                          className="text-red-600 hover:text-red-800"
                                          disabled={isDeleting}
                                       >
                                          <Trash2 className="h-4 w-4" />
                                       </Button>
                                    </>
                                 )}
                           </div>
                        </div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         ) : (
            <div className="py-12 text-center">
               <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
               <h3 className="mb-2 text-lg font-medium text-gray-900">Nenhuma turma encontrada</h3>
               <p className="mb-6 text-sm text-gray-600 sm:text-base">
                  {podeGerenciarTurmas
                     ? "Comece criando sua primeira turma"
                     : "Você ainda não está matriculado em nenhuma turma"}
               </p>
               {podeGerenciarTurmas && (
                  <Link href="/professor/turmas/criar" className="inline-block w-full sm:w-auto">
                     <Button className="w-full sm:w-auto">
                        <Plus className="mr-2 h-4 w-4" />
                        Criar primeira turma
                     </Button>
                  </Link>
               )}
            </div>
         )}
      </div>
   );
}
