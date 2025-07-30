"use client";

import { useState } from "react";
import { BookOpen, Edit, Eye, Filter, Plus, Search, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/config/trpc/react";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/interface/components/ui/select";
import { useSession } from "@/interface/hooks/useSession";
import type { HabilidadeBNCC } from "@prisma/client";
import { QuestionType, SerieLevel, UserRole } from "@prisma/client";

// Mapeamento para exibição dos tipos de questão
const TIPOS_QUESTAO_LABELS = {
   [QuestionType.MULTIPLA_ESCOLHA]: "Múltipla Escolha",
   [QuestionType.VERDADEIRO_FALSO]: "Verdadeiro/Falso",
   [QuestionType.NUMERO]: "Numérica",
   [QuestionType.TEXTO_CURTO]: "Texto Curto"
};

// Mapeamento para exibição das séries
const SERIES_LABELS = {
   [SerieLevel.PRIMEIRO_ANO]: "1º Ano",
   [SerieLevel.SEGUNDO_ANO]: "2º Ano",
   [SerieLevel.TERCEIRO_ANO]: "3º Ano",
   [SerieLevel.QUARTO_ANO]: "4º Ano",
   [SerieLevel.QUINTO_ANO]: "5º Ano"
};

type FiltrosQuestoes = {
   serie?: SerieLevel;
   tipo?: QuestionType;
   habilidade?: HabilidadeBNCC;
   search?: string;
};

export function QuestoesPage() {
   const { user } = useSession();
   const [filtros, setFiltros] = useState<FiltrosQuestoes>({});
   const [page, setPage] = useState(0);
   const utils = apiClient.useUtils();

   // Query para buscar questões com filtros
   const { data: questoesData, isLoading } = apiClient.questoes.list.useQuery({
      ...filtros,
      page,
      limit: 12
   });

   // Query para estatísticas
   const { data: estatisticas } = apiClient.questoes.estatisticas.useQuery();

   // Mutation para excluir questão
   const deleteMutation = apiClient.questoes.delete.useMutation({
      onSuccess: () => {
         void utils.questoes.list.invalidate();
         void utils.questoes.estatisticas.invalidate();
      }
   });

   const handleExcluirQuestao = async (questaoId: string, enunciado: string) => {
      const confirmacao = confirm(
         `Tem certeza que deseja excluir a questão?\n\n"${enunciado.substring(0, 100)}..."\n\nEsta ação não pode ser desfeita.`
      );

      if (confirmacao) {
         try {
            await deleteMutation.mutateAsync({ id: questaoId });
         } catch (error) {
            console.error("Erro ao excluir questão:", error);
         }
      }
   };

   const handleFiltroChange = (key: keyof FiltrosQuestoes, value: string | undefined) => {
      setFiltros((prev) => ({
         ...prev,
         [key]: value || undefined
      }));
      setPage(0); // Reset para primeira página ao alterar filtros
   };

   const podeGerenciarQuestoes = user?.role === UserRole.PROFESSOR || user?.role === UserRole.ADMIN;

   if (isLoading) {
      return (
         <div className="container mx-auto py-6">
            <div className="mb-8">
               <div className="mb-2 h-8 w-64 animate-pulse rounded bg-gray-200"></div>
               <div className="h-4 w-96 animate-pulse rounded bg-gray-200"></div>
            </div>

            {/* Stats Cards Loading */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
               {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                     <CardContent className="p-6">
                        <div className="mb-2 h-4 w-full animate-pulse rounded bg-gray-200"></div>
                        <div className="h-8 w-20 animate-pulse rounded bg-gray-200"></div>
                     </CardContent>
                  </Card>
               ))}
            </div>

            {/* Questions Loading */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
               {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                     <CardContent className="p-6">
                        <div className="mb-4 h-4 w-full animate-pulse rounded bg-gray-200"></div>
                        <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200"></div>
                     </CardContent>
                  </Card>
               ))}
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto py-6">
         {/* Header */}
         <div className="mb-8">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">Minhas Questões</h1>
                  <p className="text-gray-600">Gerencie seu banco de questões para criar listas de exercícios</p>
               </div>
               {podeGerenciarQuestoes && (
                  <Link href="/professor/questoes/criar">
                     <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Nova Questão
                     </Button>
                  </Link>
               )}
            </div>
         </div>

         {/* Stats Cards */}
         {estatisticas && (
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
               <Card>
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Total de Questões</p>
                           <p className="text-3xl font-bold text-gray-900">{estatisticas.total || 0}</p>
                        </div>
                        <BookOpen className="h-8 w-8 text-blue-600" />
                     </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Múltipla Escolha</p>
                           <p className="text-3xl font-bold text-gray-900">
                              {estatisticas.porTipo.find((t) => t.tipo === QuestionType.MULTIPLA_ESCOLHA)?.quantidade ||
                                 0}
                           </p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                           <span className="text-sm font-bold text-green-600">A</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Verdadeiro/Falso</p>
                           <p className="text-3xl font-bold text-gray-900">
                              {estatisticas.porTipo.find((t) => t.tipo === QuestionType.VERDADEIRO_FALSO)?.quantidade ||
                                 0}
                           </p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                           <span className="text-sm font-bold text-purple-600">V/F</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardContent className="p-6">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="text-sm font-medium text-gray-600">Outras</p>
                           <p className="text-3xl font-bold text-gray-900">
                              {estatisticas.porTipo
                                 .filter(
                                    (t) =>
                                       t.tipo !== QuestionType.MULTIPLA_ESCOLHA &&
                                       t.tipo !== QuestionType.VERDADEIRO_FALSO
                                 )
                                 .reduce((sum, t) => sum + t.quantidade, 0)}
                           </p>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                           <span className="text-sm font-bold text-orange-600">123</span>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>
         )}

         {/* Filtros */}
         <Card className="mb-8">
            <CardHeader>
               <CardTitle className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filtros
               </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                     <Label htmlFor="search">Buscar</Label>
                     <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                           id="search"
                           placeholder="Buscar no enunciado..."
                           value={filtros.search || ""}
                           onChange={(e) => handleFiltroChange("search", e.target.value)}
                           className="pl-10"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="serie">Série</Label>
                     <Select value={filtros.serie || ""} onValueChange={(value) => handleFiltroChange("serie", value)}>
                        <SelectTrigger>
                           <SelectValue placeholder="Todas as séries" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="">Todas as séries</SelectItem>
                           {Object.entries(SERIES_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                 {label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="tipo">Tipo</Label>
                     <Select value={filtros.tipo || ""} onValueChange={(value) => handleFiltroChange("tipo", value)}>
                        <SelectTrigger>
                           <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="">Todos os tipos</SelectItem>
                           {Object.entries(TIPOS_QUESTAO_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                 {label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label>Limpar Filtros</Label>
                     <Button
                        variant="outline"
                        onClick={() => {
                           setFiltros({});
                           setPage(0);
                        }}
                        className="w-full"
                     >
                        Limpar
                     </Button>
                  </div>
               </div>
            </CardContent>
         </Card>

         {/* Lista de Questões */}
         {questoesData?.questoes && questoesData.questoes.length > 0 ? (
            <div className="space-y-6">
               <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {questoesData.questoes.map((questao) => (
                     <Card key={questao.id} className="transition-shadow hover:shadow-md">
                        <CardContent className="p-6">
                           {/* Header da questão */}
                           <div className="mb-4">
                              <div className="mb-2 flex items-center justify-between">
                                 <Badge variant="secondary">{TIPOS_QUESTAO_LABELS[questao.tipo]}</Badge>
                                 <Badge variant="outline">{SERIES_LABELS[questao.serie]}</Badge>
                              </div>
                              <div className="mb-3 flex items-center space-x-1">
                                 {Array.from({ length: 5 }, (_, i) => (
                                    <div
                                       key={i}
                                       className={`h-2 w-2 rounded-full ${
                                          i < questao.dificuldade ? "bg-yellow-400" : "bg-gray-200"
                                       }`}
                                    />
                                 ))}
                                 <span className="ml-2 text-xs text-gray-500">Dificuldade {questao.dificuldade}/5</span>
                              </div>
                           </div>

                           {/* Enunciado */}
                           <div className="mb-4">
                              <p className="line-clamp-3 text-sm text-gray-700">{questao.enunciado}</p>
                           </div>

                           {/* Habilidades BNCC */}
                           <div className="mb-4">
                              <div className="flex flex-wrap gap-1">
                                 {questao.habilidades.slice(0, 3).map((habilidade) => (
                                    <Badge key={habilidade} variant="outline" className="text-xs">
                                       {habilidade}
                                    </Badge>
                                 ))}
                                 {questao.habilidades.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                       +{questao.habilidades.length - 3}
                                    </Badge>
                                 )}
                              </div>
                           </div>

                           {/* Ações */}
                           {podeGerenciarQuestoes && (
                              <div className="flex items-center justify-between border-t pt-4">
                                 <div className="flex items-center space-x-2">
                                    <Link href={`/professor/questoes/visualizar?id=${questao.id}`}>
                                       <Button variant="ghost" size="sm">
                                          <Eye className="h-4 w-4" />
                                       </Button>
                                    </Link>
                                    <Link href={`/professor/questoes/editar?id=${questao.id}`}>
                                       <Button variant="ghost" size="sm">
                                          <Edit className="h-4 w-4" />
                                       </Button>
                                    </Link>
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => handleExcluirQuestao(questao.id, questao.enunciado)}
                                       className="text-red-600 hover:text-red-800"
                                    >
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                                 <span className="text-xs text-gray-500">
                                    {new Date(questao.createdAt).toLocaleDateString()}
                                 </span>
                              </div>
                           )}
                        </CardContent>
                     </Card>
                  ))}
               </div>

               {/* Paginação */}
               {questoesData.hasNext && (
                  <div className="flex justify-center pt-6">
                     <Button variant="outline" onClick={() => setPage((prev) => prev + 1)} disabled={isLoading}>
                        Carregar mais questões
                     </Button>
                  </div>
               )}
            </div>
         ) : (
            <div className="py-12 text-center">
               <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
               <h3 className="mb-2 text-lg font-medium text-gray-900">Nenhuma questão encontrada</h3>
               <p className="mb-6 text-gray-600">
                  {Object.keys(filtros).length > 0
                     ? "Tente ajustar os filtros para encontrar questões"
                     : "Comece criando sua primeira questão"}
               </p>
               {podeGerenciarQuestoes && (
                  <Link href="/professor/questoes/criar">
                     <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar primeira questão
                     </Button>
                  </Link>
               )}
            </div>
         )}
      </div>
   );
}
