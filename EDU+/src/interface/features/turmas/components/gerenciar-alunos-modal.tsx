"use client";

import { useState } from "react";
import { Copy, Edit, Plus, Trash2 } from "lucide-react";
import { apiClient } from "@/config/trpc/react";
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
import type { Turma } from "@prisma/client";

type GerenciarAlunosModalProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   turma: Turma | null;
   onSuccess: () => void;
};

export function GerenciarAlunosModal({ open, onOpenChange, turma, onSuccess }: GerenciarAlunosModalProps) {
   const [mostrarFormulario, setMostrarFormulario] = useState(false);
   const [nomeAluno, setNomeAluno] = useState("");
   const [responsavel, setResponsavel] = useState("");
   const [dataNascimento, setDataNascimento] = useState("");

   // Estados para edição
   const [editandoAluno, setEditandoAluno] = useState<{
      id: string;
      nome: string;
      responsavel: string;
      dataNascimento?: string;
   } | null>(null);

   // Buscar dados completos da turma com alunos quando o modal for aberto
   const {
      data: turmaCompleta,
      isLoading: isLoadingTurma,
      refetch: refetchTurma
   } = apiClient.turmas.byId.useQuery(
      { id: turma?.id || "" },
      {
         enabled: open && !!turma?.id,
         refetchOnWindowFocus: false
      }
   );

   const cadastrarMutation = apiClient.turmas.cadastrarAluno.useMutation({
      onSuccess: (dados) => {
         // Mostrar código gerado para o professor
         alert(
            `Aluno cadastrado com sucesso!\n\nCódigo de acesso: ${dados.codigoAcesso}\n\nAnote este código, pois o aluno precisará dele para acessar a plataforma.`
         );

         setNomeAluno("");
         setResponsavel("");
         setDataNascimento("");
         setMostrarFormulario(false);
         void refetchTurma(); // Atualizar dados da turma
         onSuccess();
      },
      onError: (error) => {
         alert(`Erro ao cadastrar aluno: ${error.message}`);
      }
   });

   const removerMutation = apiClient.turmas.removeAluno.useMutation({
      onSuccess: () => {
         alert("Aluno removido da turma com sucesso!");
         void refetchTurma(); // Atualizar dados da turma
         onSuccess();
      },
      onError: (error) => {
         alert(`Erro ao remover aluno: ${error.message}`);
      }
   });

   const editarMutation = apiClient.turmas.editarAluno.useMutation({
      onSuccess: () => {
         alert("Dados do aluno atualizados com sucesso!");
         setEditandoAluno(null); // Fechar modal de edição
         void refetchTurma(); // Atualizar dados da turma
         onSuccess();
      },
      onError: (error) => {
         alert(`Erro ao editar aluno: ${error.message}`);
      }
   });

   const handleCadastrarAluno = () => {
      if (!turma || !nomeAluno.trim() || !responsavel.trim()) {
         alert("Por favor, preencha nome do aluno e responsável");
         return;
      }

      cadastrarMutation.mutate({
         nome: nomeAluno.trim(),
         responsavel: responsavel.trim(),
         dataNascimento: dataNascimento || undefined,
         turmaId: turma.id
      });
   };

   const handleRemoverAluno = (alunoId: string, nomeAluno: string) => {
      if (!turma) return;

      const confirmacao = confirm(
         `Tem certeza que deseja remover o aluno "${nomeAluno}" desta turma?\n\nEsta ação não pode ser desfeita.`
      );

      if (confirmacao) {
         removerMutation.mutate({
            turmaId: turma.id,
            alunoId: alunoId
         });
      }
   };

   const handleEditarAluno = (aluno: {
      id: string;
      name?: string | null;
      profile?: { responsavel?: string | null; dataNascimento?: Date | null } | null;
   }) => {
      setEditandoAluno({
         id: aluno.id,
         nome: aluno.name || "",
         responsavel: aluno.profile?.responsavel || "",
         dataNascimento: aluno.profile?.dataNascimento
            ? new Date(aluno.profile.dataNascimento).toISOString().split("T")[0]
            : ""
      });
   };

   const handleSalvarEdicao = () => {
      if (!editandoAluno) return;

      if (!editandoAluno.nome.trim() || !editandoAluno.responsavel.trim()) {
         alert("Por favor, preencha nome do aluno e responsável");
         return;
      }

      editarMutation.mutate({
         id: editandoAluno.id,
         nome: editandoAluno.nome.trim(),
         responsavel: editandoAluno.responsavel.trim(),
         dataNascimento: editandoAluno.dataNascimento || undefined
      });
   };

   const handleCancelarEdicao = () => {
      setEditandoAluno(null);
   };

   const copiarCodigo = async (codigo: string) => {
      try {
         await navigator.clipboard.writeText(codigo);
         alert("Código copiado para a área de transferência!");
      } catch (_error) {
         alert(`Código: ${codigo}\n\nAnote este código manualmente.`);
      }
   };

   if (!turma) return null;

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[700px]">
            <DialogHeader>
               <DialogTitle>Gerenciar Alunos - {turma.nome}</DialogTitle>
               <DialogDescription>Cadastre novos alunos e gerencie os códigos de acesso.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
               {/* Botão para mostrar formulário */}
               <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Alunos na Turma ({turmaCompleta?.alunos?.length || 0})</h3>
                  <Button
                     onClick={() => setMostrarFormulario(!mostrarFormulario)}
                     size="sm"
                     className="flex items-center gap-2"
                  >
                     <Plus className="h-4 w-4" />
                     Cadastrar Aluno
                  </Button>
               </div>

               {/* Formulário de cadastro */}
               {mostrarFormulario && (
                  <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
                     <h4 className="font-medium">Cadastrar Novo Aluno</h4>

                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                           <label className="mb-1 block text-sm font-medium">Nome do Aluno *</label>
                           <Input
                              value={nomeAluno}
                              onChange={(e) => setNomeAluno(e.target.value)}
                              placeholder="Digite o nome completo"
                           />
                        </div>

                        <div>
                           <label className="mb-1 block text-sm font-medium">Responsável *</label>
                           <Input
                              value={responsavel}
                              onChange={(e) => setResponsavel(e.target.value)}
                              placeholder="Nome do responsável"
                           />
                        </div>

                        <div>
                           <label className="mb-1 block text-sm font-medium">Data de Nascimento</label>
                           <Input
                              type="date"
                              value={dataNascimento}
                              onChange={(e) => setDataNascimento(e.target.value)}
                           />
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <Button onClick={handleCadastrarAluno} disabled={cadastrarMutation.isPending} size="sm">
                           {cadastrarMutation.isPending ? "Cadastrando..." : "Cadastrar"}
                        </Button>
                        <Button variant="outline" onClick={() => setMostrarFormulario(false)} size="sm">
                           Cancelar
                        </Button>
                     </div>
                  </div>
               )}

               {/* Modal de edição */}
               {editandoAluno && (
                  <div className="space-y-4 rounded-lg border bg-blue-50 p-4">
                     <h4 className="font-medium">Editar Aluno</h4>

                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                           <label className="mb-1 block text-sm font-medium">Nome do Aluno *</label>
                           <Input
                              value={editandoAluno.nome}
                              onChange={(e) => setEditandoAluno({ ...editandoAluno, nome: e.target.value })}
                              placeholder="Digite o nome completo"
                           />
                        </div>

                        <div>
                           <label className="mb-1 block text-sm font-medium">Responsável *</label>
                           <Input
                              value={editandoAluno.responsavel}
                              onChange={(e) => setEditandoAluno({ ...editandoAluno, responsavel: e.target.value })}
                              placeholder="Nome do responsável"
                           />
                        </div>

                        <div>
                           <label className="mb-1 block text-sm font-medium">Data de Nascimento</label>
                           <Input
                              type="date"
                              value={editandoAluno.dataNascimento || ""}
                              onChange={(e) => setEditandoAluno({ ...editandoAluno, dataNascimento: e.target.value })}
                           />
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <Button onClick={handleSalvarEdicao} disabled={editarMutation.isPending} size="sm">
                           {editarMutation.isPending ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button variant="outline" onClick={handleCancelarEdicao} size="sm">
                           Cancelar
                        </Button>
                     </div>
                  </div>
               )}

               {/* Lista de alunos */}
               <div className="space-y-2">
                  {isLoadingTurma ? (
                     <div className="flex h-[200px] items-center justify-center">
                        <div className="text-sm text-gray-500">Carregando alunos...</div>
                     </div>
                  ) : (
                     <div className="max-h-[300px] space-y-2 overflow-y-auto">
                        {turmaCompleta?.alunos && turmaCompleta.alunos.length > 0 ? (
                           turmaCompleta.alunos.map((aluno) => (
                              <div key={aluno.id} className="flex items-center justify-between rounded-lg border p-3">
                                 <div className="flex flex-1 flex-col">
                                    <span className="font-medium">{aluno.name || "Sem nome"}</span>
                                    <span className="text-muted-foreground text-sm">
                                       Responsável: {aluno.profile?.responsavel || "Não informado"}
                                    </span>
                                    {aluno.profile?.dataNascimento && (
                                       <span className="text-muted-foreground text-xs">
                                          {"Nascimento: "}
                                          {new Date(aluno.profile.dataNascimento).toLocaleDateString("pt-BR")}
                                       </span>
                                    )}
                                 </div>

                                 <div className="flex items-center gap-1">
                                    <Button
                                       size="sm"
                                       variant="ghost"
                                       onClick={() => handleEditarAluno(aluno)}
                                       title="Editar aluno"
                                       className="text-blue-600 hover:bg-blue-50 hover:text-blue-800"
                                    >
                                       <Edit className="h-3 w-3" />
                                    </Button>

                                    {aluno.profile?.codigoAcesso && (
                                       <div className="flex items-center gap-1">
                                          <Badge variant="secondary" className="font-mono">
                                             {aluno.profile.codigoAcesso}
                                          </Badge>
                                          <Button
                                             size="sm"
                                             variant="ghost"
                                             onClick={() =>
                                                aluno.profile?.codigoAcesso && copiarCodigo(aluno.profile.codigoAcesso)
                                             }
                                             title="Copiar código"
                                          >
                                             <Copy className="h-3 w-3" />
                                          </Button>
                                       </div>
                                    )}

                                    <Button
                                       size="sm"
                                       variant="ghost"
                                       onClick={() => handleRemoverAluno(aluno.id, aluno.name || "Aluno")}
                                       disabled={removerMutation.isPending}
                                       title="Remover aluno da turma"
                                       className="text-red-600 hover:bg-red-50 hover:text-red-800"
                                    >
                                       <Trash2 className="h-3 w-3" />
                                    </Button>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="text-muted-foreground flex h-[200px] items-center justify-center">
                              Nenhum aluno cadastrado nesta turma
                           </div>
                        )}
                     </div>
                  )}
               </div>
            </div>

            <DialogFooter>
               <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Fechar
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
