"use client";

import { BookOpen, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/interface/components/ui/badge";
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

type EditandoLista = {
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

type Questao = {
   id: string;
   enunciado: string;
   tipo: string;
   dificuldade: number;
   serie: string;
};

type QuestoesDisponiveis = {
   questoes: Questao[];
   total: number;
};

type EditarListaModalProps = {
   editandoLista: EditandoLista | null;
   onClose: () => void;
   setEditandoLista: (lista: EditandoLista) => void;
   questoesDisponiveis?: QuestoesDisponiveis;
   turmaSerie: string;
   onSalvar: () => void;
   isLoading: boolean;
};

export function EditarListaModal({
   editandoLista,
   onClose,
   setEditandoLista,
   questoesDisponiveis,
   turmaSerie,
   onSalvar,
   isLoading
}: EditarListaModalProps) {
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

   const handleAdicionarQuestao = (questao: Questao) => {
      if (!editandoLista) return;

      const novaQuestao = {
         id: questao.id,
         titulo: questao.enunciado.slice(0, 50) + "...",
         serie: getSerieNumero(questao.serie)
      };
      const questoesAtualizadas = [...(editandoLista.questoes || []), novaQuestao];
      setEditandoLista({ ...editandoLista, questoes: questoesAtualizadas });
   };

   const handleRemoverQuestao = (questaoId: string) => {
      if (!editandoLista) return;

      const questoesAtualizadas = editandoLista.questoes?.filter((q) => q.id !== questaoId) || [];
      setEditandoLista({ ...editandoLista, questoes: questoesAtualizadas });
   };

   return (
      <Dialog open={!!editandoLista} onOpenChange={onClose}>
         <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
               <DialogTitle>Editar Lista de Exercícios</DialogTitle>
               <DialogDescription>Atualize os dados da lista de exercícios.</DialogDescription>
            </DialogHeader>

            {editandoLista && (
               <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                     <div className="space-y-2">
                        <Label htmlFor="editTitulo">Título da Lista</Label>
                        <Input
                           id="editTitulo"
                           value={editandoLista.titulo}
                           onChange={(e) => setEditandoLista({ ...editandoLista, titulo: e.target.value })}
                        />
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="editDataLiberacao">Data de Liberação</Label>
                        <Input
                           id="editDataLiberacao"
                           type="datetime-local"
                           value={editandoLista.dataLiberacao || ""}
                           onChange={(e) => setEditandoLista({ ...editandoLista, dataLiberacao: e.target.value })}
                        />
                     </div>

                     <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="editDescricao">Descrição</Label>
                        <Input
                           id="editDescricao"
                           value={editandoLista.descricao || ""}
                           onChange={(e) => setEditandoLista({ ...editandoLista, descricao: e.target.value })}
                        />
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="editDataLimite">Data Limite</Label>
                        <Input
                           id="editDataLimite"
                           type="datetime-local"
                           value={editandoLista.dataLimite || ""}
                           onChange={(e) => setEditandoLista({ ...editandoLista, dataLimite: e.target.value })}
                        />
                     </div>
                  </div>

                  {/* Questões Selecionadas */}
                  <div>
                     <Label>Questões Selecionadas</Label>
                     <div className="mt-2 max-h-40 overflow-y-auto rounded-md border">
                        {editandoLista.questoes?.map((questao) => (
                           <div
                              key={questao.id}
                              className="flex items-center justify-between border-b p-3 last:border-b-0"
                           >
                              <div>
                                 <p className="font-medium">{questao.titulo}</p>
                              </div>
                              <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleRemoverQuestao(questao.id)}
                                 className="text-red-600 hover:text-red-800"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        ))}
                        {(!editandoLista.questoes || editandoLista.questoes.length === 0) && (
                           <div className="p-4 text-center text-gray-500">Nenhuma questão selecionada</div>
                        )}
                     </div>
                  </div>

                  {/* Adicionar Novas Questões */}
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Adicionar Questões</h3>
                        <Badge variant="secondary">Série: {turmaSerie.replace("_", " ")}</Badge>
                     </div>

                     {questoesDisponiveis && questoesDisponiveis.questoes.length > 0 ? (
                        <div className="max-h-60 space-y-3 overflow-y-auto">
                           {questoesDisponiveis.questoes
                              .filter((questao) => !editandoLista.questoes?.some((q) => q.id === questao.id))
                              .map((questao) => (
                                 <div
                                    key={questao.id}
                                    className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                                 >
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => handleAdicionarQuestao(questao)}
                                       className="shrink-0"
                                    >
                                       <Plus className="h-4 w-4" />
                                    </Button>
                                    <div className="flex-1 space-y-1">
                                       <p className="text-sm font-medium">
                                          {questao.enunciado.substring(0, 100)}
                                          {questao.enunciado.length > 100 && "..."}
                                       </p>
                                       <div className="flex items-center space-x-2 text-xs text-gray-500">
                                          <Badge variant="outline" className="text-xs">
                                             {questao.tipo.replace("_", " ")}
                                          </Badge>
                                          <span>Dificuldade: {questao.dificuldade}/5</span>
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           {questoesDisponiveis.questoes.filter(
                              (questao) => !editandoLista.questoes?.some((q) => q.id === questao.id)
                           ).length === 0 && (
                              <div className="py-8 text-center text-gray-500">
                                 <BookOpen className="mx-auto mb-2 h-8 w-8" />
                                 <p>Todas as questões disponíveis já foram adicionadas à lista.</p>
                              </div>
                           )}
                        </div>
                     ) : (
                        <div className="py-8 text-center text-gray-500">
                           <BookOpen className="mx-auto mb-2 h-8 w-8" />
                           <p>Nenhuma questão disponível para adicionar.</p>
                        </div>
                     )}

                     {editandoLista.questoes && editandoLista.questoes.length > 0 && (
                        <div className="rounded-lg bg-green-50 p-3">
                           <p className="text-sm text-green-800">
                              {editandoLista.questoes.length} questão(ões) na lista
                           </p>
                        </div>
                     )}
                  </div>
               </div>
            )}

            <DialogFooter>
               <Button variant="outline" onClick={onClose}>
                  Cancelar
               </Button>
               <Button onClick={onSalvar} disabled={isLoading || !editandoLista?.titulo.trim()}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
