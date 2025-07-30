"use client";

import { useEffect, useState } from "react";
import { BookOpen, Edit, Eye, Filter, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { SERIES_LABELS } from "@/common/constants/edu-plus";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/interface/components/ui/select";
import { useSession } from "@/interface/hooks/useSession";
import { questoesApi } from "@/services/questoes-api";
import type { HabilidadeBNCC, SerieLevel } from "@prisma/client";
import { QuestionType, UserRole } from "@prisma/client";

const TIPOS_QUESTAO_LABELS = {
   [QuestionType.MULTIPLA_ESCOLHA]: "Múltipla Escolha",
   [QuestionType.NUMERO]: "Numérica",
   VERDADEIRO_FALSO: "Verdadeiro/Falso",
   TEXTO_CURTO: "Texto Curto"
} as const;

const getTipoQuestaoLabel = (tipo: QuestionType | string): string => {
   return TIPOS_QUESTAO_LABELS[tipo as keyof typeof TIPOS_QUESTAO_LABELS] || "Tipo Desconhecido";
};

type FiltrosQuestoes = {
   serie?: SerieLevel;
   tipo?: QuestionType;
   habilidade?: HabilidadeBNCC;
   search?: string;
};

type QuestaoResponse = {
   id: string;
   enunciado: string;
   tipo: QuestionType;
   serie: SerieLevel;
   habilidades: HabilidadeBNCC[];
   dificuldade: number;
   ativa: boolean;
   createdAt: string;
   professor: {
      id: string;
      name: string;
   };
   _count?: {
      tentativas: number;
   };
};

type QuestoesListResponse = {
   questoes: QuestaoResponse[];
   total: number;
   page: number;
   limit: number;
   totalPages: number;
};

export default function QuestoesPageWrapper() {
   const { user } = useSession();
   const [filtros, setFiltros] = useState<FiltrosQuestoes>({});
   const [searchInput, setSearchInput] = useState("");
   const [page, setPage] = useState(0);
   const [questoesData, setQuestoesData] = useState<QuestoesListResponse | null>(null);
   const [isLoading, setIsLoading] = useState(false);

   const loadQuestoes = async () => {
      setIsLoading(true);
      try {
         const data = await questoesApi.list({
            ...filtros,
            page,
            limit: 12
         });
         setQuestoesData(data);
      } catch (error) {
         console.error("Erro ao carregar questões:", error);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      const debounceTimeout = setTimeout(() => {
         handleFiltroChange("search", searchInput || undefined);
      }, 500);

      return () => clearTimeout(debounceTimeout);
   }, [searchInput]);

   useEffect(() => {
      void loadQuestoes();
   }, [filtros, page]);

   const handleExcluirQuestao = async (questaoId: string, enunciado: string) => {
      const confirmacao = confirm(
         `Tem certeza que deseja excluir a questão?\n\n"${enunciado.substring(0, 100)}..."\n\nEsta ação não pode ser desfeita.`
      );

      if (confirmacao) {
         try {
            await questoesApi.delete(questaoId);
            await loadQuestoes();
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
         <div className="mb-8">
            <div className="flex items-center justify-between">
               <div>
                  <h1 className="mb-2 text-3xl font-bold text-gray-900">Minhas Questões</h1>
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
                        <Input
                           id="search"
                           placeholder="Buscar no enunciado..."
                           value={searchInput}
                           onChange={(e) => setSearchInput(e.target.value)}
                           className="pl-10"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="serie">Série</Label>
                     <Select
                        value={filtros.serie || "all"}
                        onValueChange={(value) => handleFiltroChange("serie", value === "all" ? undefined : value)}
                     >
                        <SelectTrigger>
                           <SelectValue placeholder="Todas as séries" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">Todas as séries</SelectItem>
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
                     <Select
                        value={filtros.tipo || "all"}
                        onValueChange={(value) => handleFiltroChange("tipo", value === "all" ? undefined : value)}
                     >
                        <SelectTrigger>
                           <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent>
                           <SelectItem value="all">Todos os tipos</SelectItem>
                           <SelectItem value={QuestionType.MULTIPLA_ESCOLHA}>Múltipla Escolha</SelectItem>
                           <SelectItem value={QuestionType.NUMERO}>Numérica</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label>Limpar Filtros</Label>
                     <Button
                        variant="outline"
                        onClick={() => {
                           setFiltros({});
                           setSearchInput("");
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

         {questoesData?.questoes && questoesData.questoes.length > 0 ? (
            <div className="space-y-6">
               <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {questoesData.questoes.map((questao) => (
                     <Card key={questao.id} className="transition-shadow hover:shadow-md">
                        <CardContent className="p-6">
                           <div className="mb-4">
                              <div className="mb-2 flex items-center justify-between">
                                 <Badge variant="secondary">{getTipoQuestaoLabel(questao.tipo)}</Badge>
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

                           <div className="mb-4">
                              <p className="line-clamp-3 text-sm text-gray-700">{questao.enunciado}</p>
                           </div>

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

                           {podeGerenciarQuestoes && (
                              <div className="flex items-center justify-between border-t pt-4">
                                 <div className="flex items-center space-x-2">
                                    <Link href={`/professor/questoes/${questao.id}`}>
                                       <Button variant="ghost" size="sm">
                                          <Eye className="h-4 w-4" />
                                       </Button>
                                    </Link>
                                    <Link href={`/professor/questoes/${questao.id}/editar`}>
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

               {questoesData && questoesData.page < questoesData.totalPages - 1 && (
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
