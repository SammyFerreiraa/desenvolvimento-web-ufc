"use client";

import { BookOpen } from "lucide-react";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Checkbox } from "@/interface/components/ui/checkbox";
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

type DadosLista = {
   titulo: string;
   descricao: string;
   dataLiberacao: string;
   dataLimite: string;
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

type CriarListaModalProps = {
   isOpen: boolean;
   onClose: () => void;
   turmaNome: string;
   turmaSerie: string;
   dadosLista: DadosLista;
   setDadosLista: (dados: DadosLista | ((prev: DadosLista) => DadosLista)) => void;
   questoesSelecionadas: string[];
   onToggleQuestao: (questaoId: string) => void;
   questoesDisponiveis?: QuestoesDisponiveis;
   onCriar: () => void;
   isLoading: boolean;
};

export function CriarListaModal({
   isOpen,
   onClose,
   turmaNome,
   turmaSerie,
   dadosLista,
   setDadosLista,
   questoesSelecionadas,
   onToggleQuestao,
   questoesDisponiveis,
   onCriar,
   isLoading
}: CriarListaModalProps) {
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
               <DialogTitle>Criar Lista de Exercícios</DialogTitle>
               <DialogDescription>Crie uma nova lista de exercícios para a turma {turmaNome}.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
               {/* Dados da Lista */}
               <div className="space-y-4">
                  <h3 className="text-lg font-medium">Informações da Lista</h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                     <div className="space-y-2">
                        <Label htmlFor="tituloLista">Título da Lista *</Label>
                        <Input
                           id="tituloLista"
                           placeholder="Ex: Lista de Adição e Subtração"
                           value={dadosLista.titulo}
                           onChange={(e) => setDadosLista((prev) => ({ ...prev, titulo: e.target.value }))}
                        />
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="descricaoLista">Descrição</Label>
                        <Input
                           id="descricaoLista"
                           placeholder="Breve descrição da lista"
                           value={dadosLista.descricao}
                           onChange={(e) => setDadosLista((prev) => ({ ...prev, descricao: e.target.value }))}
                        />
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="dataLiberacao">Data de Liberação</Label>
                        <Input
                           id="dataLiberacao"
                           type="datetime-local"
                           value={dadosLista.dataLiberacao}
                           onChange={(e) => setDadosLista((prev) => ({ ...prev, dataLiberacao: e.target.value }))}
                        />
                     </div>

                     <div className="space-y-2">
                        <Label htmlFor="dataLimite">Data Limite</Label>
                        <Input
                           id="dataLimite"
                           type="datetime-local"
                           value={dadosLista.dataLimite}
                           onChange={(e) => setDadosLista((prev) => ({ ...prev, dataLimite: e.target.value }))}
                        />
                     </div>
                  </div>
               </div>

               {/* Seleção de Questões */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium">Questões Disponíveis</h3>
                     <Badge variant="secondary">Série: {turmaSerie.replace("_", " ")}</Badge>
                  </div>

                  {questoesDisponiveis && questoesDisponiveis.questoes.length > 0 ? (
                     <div className="max-h-60 space-y-3 overflow-y-auto">
                        {questoesDisponiveis.questoes.map((questao) => (
                           <div
                              key={questao.id}
                              className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                           >
                              <Checkbox
                                 id={`questao-${questao.id}`}
                                 checked={questoesSelecionadas.includes(questao.id)}
                                 onCheckedChange={() => onToggleQuestao(questao.id)}
                              />
                              <div className="flex-1 space-y-1">
                                 <label
                                    htmlFor={`questao-${questao.id}`}
                                    className="cursor-pointer text-sm font-medium"
                                 >
                                    {questao.enunciado.substring(0, 100)}
                                    {questao.enunciado.length > 100 && "..."}
                                 </label>
                                 <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <Badge variant="outline" className="text-xs">
                                       {questao.tipo.replace("_", " ")}
                                    </Badge>
                                    <span>Dificuldade: {questao.dificuldade}/5</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="py-8 text-center text-gray-500">
                        <BookOpen className="mx-auto mb-2 h-8 w-8" />
                        <p>Nenhuma questão disponível para esta série.</p>
                        <p className="text-sm">Crie questões primeiro no Banco de Questões.</p>
                     </div>
                  )}

                  {questoesSelecionadas.length > 0 && (
                     <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-sm text-green-800">
                           {questoesSelecionadas.length} questão(ões) selecionada(s)
                        </p>
                     </div>
                  )}
               </div>
            </div>

            <DialogFooter>
               <Button variant="outline" onClick={onClose}>
                  Cancelar
               </Button>
               <Button
                  onClick={onCriar}
                  disabled={isLoading || !dadosLista.titulo.trim() || questoesSelecionadas.length === 0}
               >
                  {isLoading ? "Criando..." : "Criar Lista"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
