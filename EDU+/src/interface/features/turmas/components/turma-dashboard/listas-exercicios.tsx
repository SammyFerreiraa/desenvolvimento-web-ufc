"use client";

import { BookOpen, Edit, Plus, Trash2 } from "lucide-react";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";

type ListaExercicio = {
   id: string;
   titulo: string;
   descricao?: string | null;
   dataLiberacao?: string | Date | null;
   dataLimite?: string | Date | null;
   questoes?: Array<{
      questao: {
         id: string;
         enunciado: string;
         serie: string;
      };
   }>;
};

type ListaEdicao = {
   id: string;
   titulo: string;
   descricao?: string | null;
   dataLiberacao?: string;
   dataLimite?: string;
   questoes?: Array<{
      id: string;
      titulo: string;
      serie: string;
   }>;
};

type ListasExerciciosProps = {
   listas: ListaExercicio[];
   onCriarLista: () => void;
   onEditarLista: (lista: ListaEdicao) => void;
   onDeletarLista: (listaId: string, titulo: string) => void;
};

export function ListasExercicios({ listas, onCriarLista, onEditarLista, onDeletarLista }: ListasExerciciosProps) {
   // Helper para converter enum de série para número
   const getSerieNumero = (serie: string): string => {
      const serieMap: Record<string, string> = {
         PRIMEIRA_SERIE: "1",
         SEGUNDA_SERIE: "2",
         TERCEIRA_SERIE: "3",
         QUARTA_SERIE: "4",
         QUINTA_SERIE: "5",
         SEXTA_SERIE: "6",
         SETIMA_SERIE: "7",
         OITAVA_SERIE: "8",
         NONA_SERIE: "9"
      };
      return serieMap[serie] || serie;
   };

   const handleEditarLista = (lista: ListaExercicio) => {
      const listaEditavel = {
         ...lista,
         dataLiberacao: lista.dataLiberacao
            ? typeof lista.dataLiberacao === "string"
               ? lista.dataLiberacao
               : lista.dataLiberacao.toISOString().slice(0, 16)
            : "",
         dataLimite: lista.dataLimite
            ? typeof lista.dataLimite === "string"
               ? lista.dataLimite
               : lista.dataLimite.toISOString().slice(0, 16)
            : "",
         questoes:
            lista.questoes?.map((q) => ({
               id: q.questao.id,
               titulo: q.questao.enunciado.slice(0, 50) + "...",
               serie: getSerieNumero(q.questao.serie)
            })) || []
      };
      onEditarLista(listaEditavel);
   };

   return (
      <Card>
         <CardHeader className="flex flex-col space-y-3 pb-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <CardTitle className="text-lg sm:text-xl">Listas de Exercícios</CardTitle>
            <Button onClick={onCriarLista} size="sm" className="w-full sm:w-auto">
               <Plus className="mr-2 h-4 w-4" />
               <span className="sm:hidden">Nova Lista</span>
               <span className="hidden sm:inline">Nova Lista</span>
            </Button>
         </CardHeader>
         <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
            {listas && listas.length > 0 ? (
               <div className="space-y-3">
                  {listas.map((lista) => (
                     <div key={lista.id} className="rounded-lg border transition-colors hover:bg-gray-50">
                        {/* Layout Mobile */}
                        <div className="block p-3 sm:hidden">
                           <div className="mb-3">
                              <h4 className="font-medium">{lista.titulo}</h4>
                              {lista.descricao && <p className="mt-1 text-sm text-gray-600">{lista.descricao}</p>}
                              <div className="mt-2 space-y-1 text-xs text-gray-500">
                                 <div>{lista.questoes?.length || 0} questões</div>
                                 {lista.dataLiberacao && (
                                    <div>Liberado: {new Date(lista.dataLiberacao).toLocaleDateString()}</div>
                                 )}
                                 {lista.dataLimite && (
                                    <div>Limite: {new Date(lista.dataLimite).toLocaleDateString()}</div>
                                 )}
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleEditarLista(lista)}
                                 className="flex-1"
                              >
                                 <Edit className="mr-2 h-4 w-4" />
                                 Editar
                              </Button>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => {
                                    if (confirm(`Tem certeza que deseja excluir a lista "${lista.titulo}"?`)) {
                                       onDeletarLista(lista.id, lista.titulo);
                                    }
                                 }}
                                 className="flex-1 text-red-600 hover:text-red-800"
                              >
                                 <Trash2 className="mr-2 h-4 w-4" />
                                 Excluir
                              </Button>
                           </div>
                        </div>

                        {/* Layout Desktop */}
                        <div className="hidden p-3 sm:flex sm:items-center sm:justify-between">
                           <div className="flex-1">
                              <h4 className="font-medium">{lista.titulo}</h4>
                              {lista.descricao && <p className="mt-1 text-sm text-gray-600">{lista.descricao}</p>}
                              <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                                 <span>{lista.questoes?.length || 0} questões</span>
                                 {lista.dataLiberacao && (
                                    <span>• Liberado em {new Date(lista.dataLiberacao).toLocaleDateString()}</span>
                                 )}
                                 {lista.dataLimite && (
                                    <span>• Até {new Date(lista.dataLimite).toLocaleDateString()}</span>
                                 )}
                              </div>
                           </div>
                           <div className="flex items-center space-x-1">
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleEditarLista(lista)}
                                 className="h-8 w-8 p-0"
                              >
                                 <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => {
                                    if (confirm(`Tem certeza que deseja excluir a lista "${lista.titulo}"?`)) {
                                       onDeletarLista(lista.id, lista.titulo);
                                    }
                                 }}
                                 className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                              >
                                 <Trash2 className="h-3 w-3" />
                              </Button>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="py-6 text-center sm:py-8">
                  <BookOpen className="mx-auto mb-4 h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                  <h3 className="mb-2 text-base font-medium text-gray-900 sm:text-lg">Nenhuma lista criada</h3>
                  <p className="mb-4 text-sm text-gray-600 sm:text-base">
                     Crie a primeira lista de exercícios para a turma
                  </p>
                  <Button onClick={onCriarLista} size="sm" className="w-full sm:w-auto">
                     <Plus className="mr-2 h-4 w-4" />
                     Criar primeira lista
                  </Button>
               </div>
            )}
         </CardContent>
      </Card>
   );
}
