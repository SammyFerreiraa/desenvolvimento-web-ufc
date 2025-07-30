"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/config/trpc/react";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent } from "@/interface/components/ui/card";
import {
   AdicionarAlunoModal,
   AlunosList,
   AtividadeRecente,
   CriarListaModal,
   EditarAlunoModal,
   EditarListaModal,
   ListasExercicios,
   TurmaStats
} from "@/interface/features/turmas/components/turma-dashboard";

export function DashboardTurmaPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const turmaId = searchParams.get("id");

   const [mostrarFormulario, setMostrarFormulario] = useState(false);
   const [mostrarCriarLista, setMostrarCriarLista] = useState(false);
   const [nomeAluno, setNomeAluno] = useState("");
   const [responsavel, setResponsavel] = useState("");
   const [dataNascimento, setDataNascimento] = useState("");
   const [editandoAluno, setEditandoAluno] = useState<{
      id: string;
      nome: string;
      responsavel: string;
      dataNascimento?: string;
   } | null>(null);

   const [dadosLista, setDadosLista] = useState({
      titulo: "",
      descricao: "",
      dataLiberacao: "",
      dataLimite: ""
   });
   const [questoesSelecionadas, setQuestoesSelecionadas] = useState<string[]>([]);
   const [editandoLista, setEditandoLista] = useState<{
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
   } | null>(null);

   const utils = apiClient.useUtils();

   const { data: turma, isLoading } = apiClient.turmas.byId.useQuery({ id: turmaId! }, { enabled: !!turmaId });

   const { data: listasExercicios } = apiClient.listaExercicios.findByTurma.useQuery(
      { turmaId: turmaId! },
      { enabled: !!turmaId }
   );

   const { data: questoesDisponiveis } = apiClient.questoes.list.useQuery(
      { serie: turma?.serie },
      { enabled: !!turma?.serie }
   );

   const cadastrarMutation = apiClient.turmas.cadastrarAluno.useMutation({
      onSuccess: (dados) => {
         alert(
            `Aluno cadastrado com sucesso!\n\nCódigo de acesso: ${dados.codigoAcesso}\n\nAnote este código, pois o aluno precisará dele para acessar a plataforma.`
         );
         setNomeAluno("");
         setResponsavel("");
         setDataNascimento("");
         setMostrarFormulario(false);
         void utils.turmas.byId.invalidate({ id: turmaId! });
      },
      onError: (error) => {
         alert(`Erro ao cadastrar aluno: ${error.message}`);
      }
   });

   const removerMutation = apiClient.turmas.removeAluno.useMutation({
      onSuccess: () => {
         alert("Aluno removido da turma com sucesso!");
         void utils.turmas.byId.invalidate({ id: turmaId! });
      },
      onError: (error) => {
         alert(`Erro ao remover aluno: ${error.message}`);
      }
   });

   const editarMutation = apiClient.turmas.editarAluno.useMutation({
      onSuccess: () => {
         alert("Dados do aluno atualizados com sucesso!");
         setEditandoAluno(null);
         void utils.turmas.byId.invalidate({ id: turmaId! });
      },
      onError: (error) => {
         alert(`Erro ao editar aluno: ${error.message}`);
      }
   });

   const criarListaMutation = apiClient.listaExercicios.create.useMutation({
      onSuccess: () => {
         alert("Lista de exercícios criada com sucesso!");
         setMostrarCriarLista(false);
         setDadosLista({ titulo: "", descricao: "", dataLiberacao: "", dataLimite: "" });
         setQuestoesSelecionadas([]);
         void utils.turmas.byId.invalidate({ id: turmaId! });
         void utils.listaExercicios.findByTurma.invalidate({ turmaId: turmaId! });
      },
      onError: (error) => {
         alert(`Erro ao criar lista: ${error.message}`);
      }
   });

   const editarListaMutation = apiClient.listaExercicios.update.useMutation({
      onSuccess: () => {
         alert("Lista de exercícios atualizada com sucesso!");
         setEditandoLista(null);
         void utils.listaExercicios.findByTurma.invalidate({ turmaId: turmaId! });
      },
      onError: (error) => {
         alert(`Erro ao editar lista: ${error.message}`);
      }
   });

   const deletarListaMutation = apiClient.listaExercicios.delete.useMutation({
      onSuccess: () => {
         alert("Lista de exercícios removida com sucesso!");
         void utils.listaExercicios.findByTurma.invalidate({ turmaId: turmaId! });
      },
      onError: (error) => {
         alert(`Erro ao deletar lista: ${error.message}`);
      }
   });

   const handleCadastrarAluno = () => {
      if (!turmaId || !nomeAluno.trim() || !responsavel.trim()) {
         alert("Por favor, preencha nome do aluno e responsável");
         return;
      }

      cadastrarMutation.mutate({
         nome: nomeAluno.trim(),
         responsavel: responsavel.trim(),
         dataNascimento: dataNascimento || undefined,
         turmaId: turmaId
      });
   };

   const handleRemoverAluno = (alunoId: string, nomeAluno: string) => {
      if (!turmaId) return;

      const confirmacao = confirm(
         `Tem certeza que deseja remover o aluno "${nomeAluno}" desta turma?\n\nEsta ação não pode ser desfeita.`
      );

      if (confirmacao) {
         removerMutation.mutate({
            turmaId: turmaId,
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

   const handleCriarLista = () => {
      if (!turmaId || !dadosLista.titulo.trim()) {
         alert("Por favor, preencha o título da lista");
         return;
      }

      if (questoesSelecionadas.length === 0) {
         alert("Por favor, selecione pelo menos uma questão");
         return;
      }

      criarListaMutation.mutate({
         titulo: dadosLista.titulo.trim(),
         descricao: dadosLista.descricao.trim() || undefined,
         turmaId: turmaId,
         questoesIds: questoesSelecionadas,
         dataLiberacao: dadosLista.dataLiberacao || undefined,
         dataLimite: dadosLista.dataLimite || undefined
      });
   };

   const handleToggleQuestao = (questaoId: string) => {
      setQuestoesSelecionadas((prev) =>
         prev.includes(questaoId) ? prev.filter((id) => id !== questaoId) : [...prev, questaoId]
      );
   };

   if (!turmaId) {
      return (
         <div className="flex min-h-screen items-center justify-center px-4">
            <div className="text-center">
               <h1 className="text-xl font-bold text-red-600 sm:text-2xl">Erro</h1>
               <p className="mt-2 text-sm text-gray-600 sm:text-base">ID da turma não fornecido</p>
               <Button onClick={() => router.push("/professor/turmas")} className="mt-4 w-full sm:w-auto">
                  Voltar para Turmas
               </Button>
            </div>
         </div>
      );
   }

   if (isLoading) {
      return (
         <div className="min-h-screen">
            <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center space-x-1 sm:space-x-2"
                     >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Voltar</span>
                     </Button>
                     <div className="hidden h-6 border-l border-gray-300 sm:block" />
                     <div className="h-6 w-32 animate-pulse rounded bg-gray-200 sm:w-48"></div>
                  </div>
               </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
               <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                     <Card key={i}>
                        <CardContent className="p-4 sm:p-6">
                           <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                           <div className="mt-2 h-6 w-16 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-20"></div>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            </div>
         </div>
      );
   }

   if (!turma) {
      return (
         <div className="flex min-h-screen items-center justify-center px-4">
            <div className="text-center">
               <h1 className="text-xl font-bold text-red-600 sm:text-2xl">Turma não encontrada</h1>
               <p className="mt-2 text-sm text-gray-600 sm:text-base">A turma solicitada não existe ou foi removida</p>
               <Button onClick={() => router.push("/professor/turmas")} className="mt-4 w-full sm:w-auto">
                  Voltar para Turmas
               </Button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header Responsivo */}
         <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
               <div className="flex min-w-0 flex-1 items-center space-x-2 sm:space-x-4">
                  <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => router.back()}
                     className="flex flex-shrink-0 items-center space-x-1 sm:space-x-2"
                  >
                     <ArrowLeft className="h-4 w-4" />
                     <span className="hidden sm:inline">Voltar</span>
                  </Button>
                  <div className="hidden h-6 border-l border-gray-300 sm:block" />
                  <div className="min-w-0 flex-1">
                     <h1 className="truncate text-lg font-bold text-gray-900 sm:text-2xl">{turma.nome}</h1>
                     <div className="mt-1 flex flex-col space-y-1 text-xs text-gray-600 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 sm:text-sm">
                        <Badge variant="secondary" className="w-fit">
                           {turma.serie.replace("_", " ")}
                        </Badge>
                        <span className="hidden sm:inline">Ano letivo: {turma.anoLetivo}</span>
                        <span className="sm:hidden">{turma.anoLetivo}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <TurmaStats totalAlunos={turma.alunos?.length || 0} totalListas={turma._count?.listas || 0} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
               <div className="lg:col-span-2">
                  <AlunosList
                     alunos={turma.alunos || []}
                     onAdicionarAluno={() => setMostrarFormulario(true)}
                     onEditarAluno={handleEditarAluno}
                     onRemoverAluno={handleRemoverAluno}
                  />
               </div>

               <div className="space-y-6">
                  <ListasExercicios
                     listas={listasExercicios || []}
                     onCriarLista={() => setMostrarCriarLista(true)}
                     onEditarLista={setEditandoLista}
                     onDeletarLista={(listaId) => deletarListaMutation.mutate(listaId)}
                  />

                  <AtividadeRecente />
               </div>
            </div>
         </div>

         <AdicionarAlunoModal
            isOpen={mostrarFormulario}
            onClose={() => setMostrarFormulario(false)}
            turmaNome={turma.nome}
            nomeAluno={nomeAluno}
            setNomeAluno={setNomeAluno}
            responsavel={responsavel}
            setResponsavel={setResponsavel}
            dataNascimento={dataNascimento}
            setDataNascimento={setDataNascimento}
            onCadastrar={handleCadastrarAluno}
            isLoading={cadastrarMutation.isPending}
         />

         <EditarAlunoModal
            editandoAluno={editandoAluno}
            onClose={() => setEditandoAluno(null)}
            setEditandoAluno={setEditandoAluno}
            onSalvar={handleSalvarEdicao}
            isLoading={editarMutation.isPending}
         />

         <CriarListaModal
            isOpen={mostrarCriarLista}
            onClose={() => setMostrarCriarLista(false)}
            turmaNome={turma.nome}
            turmaSerie={turma.serie}
            dadosLista={dadosLista}
            setDadosLista={setDadosLista}
            questoesSelecionadas={questoesSelecionadas}
            onToggleQuestao={handleToggleQuestao}
            questoesDisponiveis={questoesDisponiveis}
            onCriar={handleCriarLista}
            isLoading={criarListaMutation.isPending}
         />

         <EditarListaModal
            editandoLista={editandoLista}
            onClose={() => setEditandoLista(null)}
            setEditandoLista={setEditandoLista}
            questoesDisponiveis={questoesDisponiveis}
            turmaSerie={turma.serie}
            onSalvar={() => {
               if (editandoLista) {
                  editarListaMutation.mutate({
                     id: editandoLista.id,
                     titulo: editandoLista.titulo,
                     descricao: editandoLista.descricao || undefined,
                     dataLiberacao: editandoLista.dataLiberacao,
                     dataLimite: editandoLista.dataLimite,
                     questoesIds: editandoLista.questoes?.map((q) => q.id) || []
                  });
               }
            }}
            isLoading={editarListaMutation.isPending}
         />
      </div>
   );
}
