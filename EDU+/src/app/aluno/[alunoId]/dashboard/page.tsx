"use client";

import { use, useEffect, useState } from "react";
import { BookOpen, Clock, Play, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import { SERIES_LABELS } from "@/common/constants/edu-plus";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { alunoApi, type AlunoTurmaResponse, type ListaExerciciosResponse } from "@/services/aluno-api";

type Props = {
   params: Promise<{ alunoId: string }>;
};

export default function AlunoDashboardPage({ params }: Props) {
   const router = useRouter();
   const resolvedParams = use(params);
   const [dadosAluno, setDadosAluno] = useState<AlunoTurmaResponse | null>(null);
   const [atividades, setAtividades] = useState<ListaExerciciosResponse[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
      setIsMounted(true);
   }, []);

   useEffect(() => {
      if (!isMounted) return;

      const carregarDados = async () => {
         try {
            const dadosLocalStorage = localStorage.getItem("dadosAluno");
            if (dadosLocalStorage) {
               const dados = JSON.parse(dadosLocalStorage);
               if (dados.id === resolvedParams.alunoId) {
                  setDadosAluno(dados);
               }
            }

            const atividadesData = await alunoApi.listarAtividades(resolvedParams.alunoId);
            setAtividades(atividadesData);
         } catch (error) {
            console.error("Erro ao carregar dados:", error);
            router.push("/aluno");
         } finally {
            setIsLoading(false);
         }
      };

      void carregarDados();
   }, [resolvedParams.alunoId, router, isMounted]);

   const handleIniciarAtividade = (listaId: string) => {
      router.push(`/aluno/${resolvedParams.alunoId}/atividade/${listaId}`);
   };

   const handleSair = () => {
      if (typeof window !== "undefined") {
         localStorage.removeItem("dadosAluno");
      }
      router.push("/aluno");
   };

   if (isLoading) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="text-center">
               <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
               <p className="text-gray-600">Carregando seu painel...</p>
            </div>
         </div>
      );
   }

   if (!dadosAluno) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="text-center">
               <p className="mb-4 text-gray-600">Dados não encontrados</p>
               <Button onClick={() => router.push("/aluno")}>Voltar ao Login</Button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         <div className="container mx-auto px-4 py-6">
            <div className="mb-8 rounded-2xl border-0 bg-white p-6 shadow-lg">
               <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                     <div className="rounded-full bg-[#58876A] p-3">
                        <BookOpen className="h-8 w-8 text-white" />
                     </div>
                     <div>
                        <h1 className="text-2xl font-bold text-gray-900">Olá, {dadosAluno.nome}!</h1>
                        <p className="text-gray-600">
                           Turma: {dadosAluno.turma.nome} • {SERIES_LABELS[dadosAluno.turma.serie]}
                        </p>
                        <p className="text-sm text-gray-500">Professor(a): {dadosAluno.turma.professor.name}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <Badge variant="secondary" className="px-3 py-1">
                        {dadosAluno.codigoAcesso}
                     </Badge>
                     <Button variant="outline" size="sm" onClick={handleSair}>
                        Sair
                     </Button>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <Card>
                  <CardHeader>
                     <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5 text-[#58876A]" />
                        Suas Atividades
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {atividades.length === 0 ? (
                        <div className="py-12 text-center">
                           <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                           <h3 className="mb-2 text-lg font-medium text-gray-500">Nenhuma atividade disponível</h3>
                           <p className="text-gray-400">Seu professor ainda não publicou atividades para sua turma.</p>
                        </div>
                     ) : (
                        atividades.map((atividade) => (
                           <div key={atividade.id} className="rounded-lg border p-4 transition-shadow hover:shadow-md">
                              <div className="mb-3 flex items-start justify-between">
                                 <div>
                                    <h3 className="mb-1 font-semibold text-gray-900">{atividade.titulo}</h3>
                                    {atividade.descricao && (
                                       <p className="mb-2 text-sm text-gray-600">{atividade.descricao}</p>
                                    )}
                                 </div>
                                 <Badge
                                    variant={
                                       atividade.progresso.respondidas === atividade.progresso.total
                                          ? "default"
                                          : "secondary"
                                    }
                                 >
                                    {atividade.progresso.respondidas}/{atividade.progresso.total}
                                 </Badge>
                              </div>

                              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                       <Clock className="h-4 w-4" />
                                       {new Date(atividade.dataInicio).toLocaleDateString("pt-BR")}
                                    </span>
                                    {atividade.progresso.respondidas > 0 && (
                                       <span className="flex items-center gap-1">
                                          <Target className="h-4 w-4" />
                                          {atividade.progresso.percentualAcerto.toFixed(0)}% de acerto
                                       </span>
                                    )}
                                 </div>
                                 {atividade.progresso.respondidas === 0 && (
                                    <Button
                                       onClick={() => handleIniciarAtividade(atividade.id)}
                                       className="bg-[#58876A] hover:bg-[#58876A]/90"
                                    >
                                       Iniciar
                                    </Button>
                                 )}
                              </div>
                           </div>
                        ))
                     )}
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
}
