"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { listasApi, type ListaExercicio } from "@/services/listas-api";
import { questoesApi } from "@/services/questoes-api";
import { turmasApi } from "@/services/turmas-api";

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

   // Estados para dados da API
   const [turma, setTurma] = useState<any>(null);
   const [listasExercicios, setListasExercicios] = useState<ListaExercicio[]>([]);
   const [questoesDisponiveis, setQuestoesDisponiveis] = useState<any[]>([]);
   const [carregandoTurma, setCarregandoTurma] = useState(false);
   const [carregandoListas, setCarregandoListas] = useState(false);
   const [carregandoQuestoes, setCarregandoQuestoes] = useState(false);

   // Estados para mutations
   const [cadastrandoAluno, setCadastrandoAluno] = useState(false);
   const [removendoAluno, setRemovendoAluno] = useState(false);
   const [editandoAlunoLoading, setEditandoAlunoLoading] = useState(false);
   const [criandoLista, setCriandoLista] = useState(false);
   const [editandoListaLoading, setEditandoListaLoading] = useState(false);
   const [deletandoLista, setDeletandoLista] = useState(false);

   // Buscar dados da turma
   const buscarTurma = async () => {
      if (!turmaId) return;

      setCarregandoTurma(true);
      try {
         const data = await turmasApi.getById(turmaId);
         setTurma(data);
      } catch (error: any) {
         toast.error(`Erro ao carregar turma: ${error.response?.data?.message || error.message}`);
      } finally {
         setCarregandoTurma(false);
      }
   };

   // Buscar listas de exercícios
   const buscarListas = async () => {
      if (!turmaId) return;

      setCarregandoListas(true);
      try {
         const data = await listasApi.findByTurma(turmaId);
         setListasExercicios(data || []);
      } catch (error: any) {
         toast.error(`Erro ao carregar listas: ${error.response?.data?.message || error.message}`);
      } finally {
         setCarregandoListas(false);
      }
   };

   // Buscar questões disponíveis
   const buscarQuestoes = async (serie?: string) => {
      if (!serie) return;

      setCarregandoQuestoes(true);
      try {
         const data = await questoesApi.list({ serie: serie as any });
         setQuestoesDisponiveis(data.questoes || []);
      } catch (error: any) {
         toast.error(`Erro ao carregar questões: ${error.response?.data?.message || error.message}`);
      } finally {
         setCarregandoQuestoes(false);
      }
   };

   // Effects
   useEffect(() => {
      buscarTurma();
   }, [turmaId]);

   useEffect(() => {
      buscarListas();
   }, [turmaId]);

   useEffect(() => {
      if (turma?.serie) {
         buscarQuestoes(turma.serie);
      }
   }, [turma?.serie]);

   // Handlers para as ações

   const handleCadastrarAluno = async () => {
      if (!turmaId || !nomeAluno.trim() || !responsavel.trim()) {
         toast.error("Por favor, preencha nome do aluno e responsável");
         return;
      }

      setCadastrandoAluno(true);
      try {
         const dados = await turmasApi.cadastrarAluno({
            nome: nomeAluno.trim(),
            responsavel: responsavel.trim(),
            dataNascimento: dataNascimento || undefined,
            turmaId: turmaId
         });

         alert(
            `Aluno cadastrado com sucesso!\n\nCódigo de acesso: ${dados.codigoAcesso}\n\nAnote este código, pois o aluno precisará dele para acessar a plataforma.`
         );

         setNomeAluno("");
         setResponsavel("");
         setDataNascimento("");
         setMostrarFormulario(false);
         await buscarTurma(); // Recarregar dados da turma
      } catch (error: any) {
         toast.error(`Erro ao cadastrar aluno: ${error.response?.data?.message || error.message}`);
      } finally {
         setCadastrandoAluno(false);
      }
   };

   const handleRemoverAluno = async (alunoId: string, nomeAluno: string) => {
      if (!turmaId) return;

      const confirmacao = confirm(
         `Tem certeza que deseja remover o aluno "${nomeAluno}" desta turma?\n\nEsta ação não pode ser desfeita.`
      );

      if (!confirmacao) return;

      setRemovendoAluno(true);
      try {
         await turmasApi.removeAlunos(turmaId, [alunoId]);
         toast.success("Aluno removido da turma com sucesso!");
         await buscarTurma(); // Recarregar dados da turma
      } catch (error: any) {
         toast.error(`Erro ao remover aluno: ${error.response?.data?.message || error.message}`);
      } finally {
         setRemovendoAluno(false);
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

   const handleSalvarEdicao = async () => {
      if (!editandoAluno) return;

      if (!editandoAluno.nome.trim() || !editandoAluno.responsavel.trim()) {
         toast.error("Por favor, preencha nome do aluno e responsável");
         return;
      }

      setEditandoAlunoLoading(true);
      try {
         await turmasApi.editarAluno({
            id: editandoAluno.id,
            nome: editandoAluno.nome.trim(),
            responsavel: editandoAluno.responsavel.trim(),
            dataNascimento: editandoAluno.dataNascimento || undefined
         });

         toast.success("Dados do aluno atualizados com sucesso!");
         setEditandoAluno(null);
         await buscarTurma(); // Recarregar dados da turma
      } catch (error: any) {
         toast.error(`Erro ao editar aluno: ${error.response?.data?.message || error.message}`);
      } finally {
         setEditandoAlunoLoading(false);
      }
   };

   const handleCriarLista = async () => {
      if (!turmaId || !dadosLista.titulo.trim()) {
         toast.error("Por favor, preencha o título da lista");
         return;
      }

      if (questoesSelecionadas.length === 0) {
         toast.error("Por favor, selecione pelo menos uma questão");
         return;
      }

      setCriandoLista(true);
      try {
         await listasApi.create({
            titulo: dadosLista.titulo.trim(),
            descricao: dadosLista.descricao.trim() || undefined,
            turmaId: turmaId,
            questoesIds: questoesSelecionadas,
            dataLiberacao: dadosLista.dataLiberacao || undefined,
            dataLimite: dadosLista.dataLimite || undefined
         });

         toast.success("Lista de exercícios criada com sucesso!");
         setMostrarCriarLista(false);
         setDadosLista({ titulo: "", descricao: "", dataLiberacao: "", dataLimite: "" });
         setQuestoesSelecionadas([]);
         await buscarTurma(); // Recarregar dados da turma
         await buscarListas(); // Recarregar listas
      } catch (error: any) {
         toast.error(`Erro ao criar lista: ${error.response?.data?.message || error.message}`);
      } finally {
         setCriandoLista(false);
      }
   };

   const handleEditarLista = async () => {
      if (!editandoLista) return;

      setEditandoListaLoading(true);
      try {
         await listasApi.update({
            id: editandoLista.id,
            titulo: editandoLista.titulo,
            descricao: editandoLista.descricao || undefined,
            dataLiberacao: editandoLista.dataLiberacao,
            dataLimite: editandoLista.dataLimite,
            questoesIds: editandoLista.questoes?.map((q) => q.id) || []
         });

         toast.success("Lista de exercícios atualizada com sucesso!");
         setEditandoLista(null);
         await buscarListas(); // Recarregar listas
      } catch (error: any) {
         toast.error(`Erro ao editar lista: ${error.response?.data?.message || error.message}`);
      } finally {
         setEditandoListaLoading(false);
      }
   };

   const handleDeletarLista = async (listaId: string) => {
      setDeletandoLista(true);
      try {
         await listasApi.delete(listaId);
         toast.success("Lista de exercícios removida com sucesso!");
         await buscarListas(); // Recarregar listas
      } catch (error: any) {
         toast.error(`Erro ao deletar lista: ${error.response?.data?.message || error.message}`);
      } finally {
         setDeletandoLista(false);
      }
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

   if (carregandoTurma) {
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
                     listas={(listasExercicios as any) || []}
                     onCriarLista={() => setMostrarCriarLista(true)}
                     onEditarLista={setEditandoLista}
                     onDeletarLista={handleDeletarLista}
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
            isLoading={cadastrandoAluno}
         />

         <EditarAlunoModal
            editandoAluno={editandoAluno}
            onClose={() => setEditandoAluno(null)}
            setEditandoAluno={setEditandoAluno}
            onSalvar={handleSalvarEdicao}
            isLoading={editandoAlunoLoading}
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
            questoesDisponiveis={{ questoes: questoesDisponiveis, total: questoesDisponiveis.length }}
            onCriar={handleCriarLista}
            isLoading={criandoLista}
         />

         <EditarListaModal
            editandoLista={editandoLista}
            onClose={() => setEditandoLista(null)}
            setEditandoLista={setEditandoLista}
            questoesDisponiveis={{ questoes: questoesDisponiveis, total: questoesDisponiveis.length }}
            turmaSerie={turma.serie}
            onSalvar={handleEditarLista}
            isLoading={editandoListaLoading}
         />
      </div>
   );
}
