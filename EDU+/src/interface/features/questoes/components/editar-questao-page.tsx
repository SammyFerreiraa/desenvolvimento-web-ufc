"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { HABILIDADES_POR_SERIE, SERIES_LABELS } from "@/common/constants/edu-plus";
import { questaoUpdateSchema, type QuestaoUpdateInput } from "@/common/schemas/edu-plus";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { Checkbox } from "@/interface/components/ui/checkbox";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/interface/components/ui/select";
import { questoesApi, type QuestaoResponse } from "@/services/questoes-api";
import { zodResolver } from "@hookform/resolvers/zod";
import type { HabilidadeBNCC, SerieLevel } from "@prisma/client";
import { QuestionType } from "@prisma/client";

type Props = {
   questaoId: string;
};

const TIPOS_QUESTAO_LABELS = {
   [QuestionType.MULTIPLA_ESCOLHA]: "Múltipla Escolha",
   [QuestionType.NUMERO]: "Numérica"
};

type OpcaoMultiplaEscolha = {
   id: string;
   texto: string;
   correta: boolean;
};

export function EditarQuestaoPage({ questaoId }: Props) {
   const router = useRouter();
   const [questao, setQuestao] = useState<QuestaoResponse | null>(null);
   const [isLoadingQuestao, setIsLoadingQuestao] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [opcoes, setOpcoes] = useState<OpcaoMultiplaEscolha[]>([]);
   const [habilidadesSelecionadas, setHabilidadesSelecionadas] = useState<HabilidadeBNCC[]>([]);

   useEffect(() => {
      const loadQuestao = async () => {
         try {
            const data = await questoesApi.getById(questaoId);
            setQuestao(data);
         } catch (error) {
            console.error("Erro ao carregar questão:", error);
            alert("Erro ao carregar questão");
            router.push("/professor/questoes");
         } finally {
            setIsLoadingQuestao(false);
         }
      };

      void loadQuestao();
   }, [questaoId, router]);

   const {
      register,
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: { errors }
   } = useForm<QuestaoUpdateInput>({
      resolver: zodResolver(questaoUpdateSchema)
   });

   const tipoSelecionado = watch("tipo");
   const serieSelecionada = watch("serie");

   useEffect(() => {
      if (questao) {
         reset({
            enunciado: questao.enunciado,
            tipo: questao.tipo,
            serie: questao.serie,
            dificuldade: questao.dificuldade,
            gabarito: questao.gabarito || "",
            explicacao: questao.explicacao || ""
         });

         setHabilidadesSelecionadas(questao.habilidades);

         if (questao.tipo === QuestionType.MULTIPLA_ESCOLHA && questao.opcoes) {
            const parsedOpcoes = typeof questao.opcoes === "string" ? JSON.parse(questao.opcoes) : questao.opcoes;

            setOpcoes(
               parsedOpcoes.map((op: { id: string; texto: string; correta: boolean }) => ({
                  id: op.id.toString(),
                  texto: op.texto,
                  correta: op.id === questao.gabarito
               }))
            );
         }
      }
   }, [questao, reset]);

   const onSubmit = async (data: QuestaoUpdateInput) => {
      if (data.tipo === QuestionType.MULTIPLA_ESCOLHA) {
         const opcoesValidas = opcoes.filter((op) => op.texto.trim());
         if (opcoesValidas.length < 2) {
            alert("Para questões de múltipla escolha, adicione pelo menos 2 opções.");
            return;
         }

         const opcaoCorreta = opcoes.find((op) => op.correta);
         if (!opcaoCorreta) {
            alert("Marque qual é a opção correta.");
            return;
         }

         data.opcoes = JSON.stringify(opcoesValidas);
         data.gabarito = opcaoCorreta.id;
      }

      if (habilidadesSelecionadas.length === 0) {
         alert("Selecione pelo menos uma habilidade da BNCC.");
         return;
      }

      data.habilidades = habilidadesSelecionadas;

      setIsSubmitting(true);
      try {
         await questoesApi.update(questaoId, data);
         alert("Questão atualizada com sucesso!");
         router.push("/professor/questoes");
      } catch (error) {
         console.error("Erro ao atualizar questão:", error);
         alert("Erro ao atualizar questão. Tente novamente.");
      } finally {
         setIsSubmitting(false);
      }
   };

   const adicionarOpcao = () => {
      const novoId = (opcoes.length + 1).toString();
      setOpcoes([...opcoes, { id: novoId, texto: "", correta: false }]);
   };

   const removerOpcao = (id: string) => {
      if (opcoes.length > 2) {
         setOpcoes(opcoes.filter((op) => op.id !== id));
      }
   };

   const atualizarOpcao = (id: string, campo: keyof OpcaoMultiplaEscolha, valor: string | boolean) => {
      setOpcoes(
         opcoes.map((op) =>
            op.id === id
               ? { ...op, [campo]: valor, ...(campo === "correta" && valor ? { correta: true } : {}) }
               : campo === "correta" && valor
                 ? { ...op, correta: false }
                 : op
         )
      );
   };

   const toggleHabilidade = (habilidade: HabilidadeBNCC) => {
      setHabilidadesSelecionadas((prev) =>
         prev.includes(habilidade) ? prev.filter((h) => h !== habilidade) : [...prev, habilidade]
      );
   };

   const habilidadesDisponiveis = serieSelecionada ? HABILIDADES_POR_SERIE[serieSelecionada] || [] : [];

   if (isLoadingQuestao) {
      return (
         <div className="container mx-auto py-6">
            <div className="flex min-h-[400px] items-center justify-center">
               <div className="text-center">
                  <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="text-gray-600">Carregando questão...</p>
               </div>
            </div>
         </div>
      );
   }

   if (!questao) {
      return (
         <div className="container mx-auto py-6">
            <div className="flex min-h-[400px] items-center justify-center">
               <div className="text-center">
                  <p className="mb-4 text-red-600">Questão não encontrada</p>
                  <Button onClick={() => router.push("/professor/questoes")}>Voltar para Questões</Button>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="container mx-auto py-6">
         {/* Header */}
         <div className="mb-8">
            <div className="flex items-center space-x-4">
               <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Voltar</span>
               </Button>
               <div className="h-6 border-l border-gray-300" />
               <div>
                  <h1 className="text-3xl font-bold text-gray-900">Editar Questão</h1>
                  <p className="text-gray-600">Edite os dados da questão selecionada</p>
               </div>
            </div>
         </div>

         <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card>
               <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                     {watch("serie") && (
                        <div className="space-y-2">
                           <Label htmlFor="serie">Série *</Label>
                           <Select
                              value={watch("serie")}
                              onValueChange={(value) => setValue("serie", value as SerieLevel)}
                           >
                              <SelectTrigger>
                                 <SelectValue placeholder="Selecione a série" />
                              </SelectTrigger>
                              <SelectContent>
                                 {Object.entries(SERIES_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                       {label}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           {errors.serie && <p className="text-sm text-red-600">{errors.serie.message}</p>}
                        </div>
                     )}

                     {watch("tipo") && (
                        <div className="space-y-2">
                           <Label htmlFor="tipo">Tipo de Questão *</Label>
                           <Select
                              value={watch("tipo")}
                              onValueChange={(value) => setValue("tipo", value as QuestionType)}
                           >
                              <SelectTrigger>
                                 <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                 {Object.entries(TIPOS_QUESTAO_LABELS).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>
                                       {label}
                                    </SelectItem>
                                 ))}
                              </SelectContent>
                           </Select>
                           {errors.tipo && <p className="text-sm text-red-600">{errors.tipo.message}</p>}
                        </div>
                     )}
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="dificuldade">Dificuldade (1-5) *</Label>
                     <div className="flex items-center space-x-4">
                        <Input
                           type="number"
                           min="1"
                           max="5"
                           {...register("dificuldade", { valueAsNumber: true })}
                           className="w-24"
                        />
                        <div className="flex items-center space-x-1">
                           {Array.from({ length: 5 }, (_, i) => (
                              <div
                                 key={i}
                                 className={`h-3 w-3 rounded-full ${
                                    i < (watch("dificuldade") || 1) ? "bg-yellow-400" : "bg-gray-200"
                                 }`}
                              />
                           ))}
                        </div>
                     </div>
                     {errors.dificuldade && <p className="text-sm text-red-600">{errors.dificuldade.message}</p>}
                  </div>
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Enunciado da Questão</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-2">
                     <Label htmlFor="enunciado">Enunciado *</Label>
                     <textarea
                        {...register("enunciado")}
                        placeholder="Digite o enunciado da questão..."
                        className="min-h-[120px] w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                     />
                     {errors.enunciado && <p className="text-sm text-red-600">{errors.enunciado.message}</p>}
                  </div>
               </CardContent>
            </Card>

            {tipoSelecionado === QuestionType.MULTIPLA_ESCOLHA && (
               <Card>
                  <CardHeader>
                     <div className="flex items-center justify-between">
                        <CardTitle>Opções de Resposta</CardTitle>
                        <Button type="button" variant="outline" onClick={adicionarOpcao}>
                           <Plus className="mr-2 h-4 w-4" />
                           Adicionar Opção
                        </Button>
                     </div>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-4">
                        {opcoes.map((opcao, index) => (
                           <div key={opcao.id} className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                 <Checkbox
                                    checked={opcao.correta}
                                    onCheckedChange={(checked) =>
                                       atualizarOpcao(opcao.id, "correta", checked as boolean)
                                    }
                                 />
                                 <Label className="text-sm">Correta</Label>
                              </div>
                              <Input
                                 placeholder={`Opção ${index + 1}`}
                                 value={opcao.texto}
                                 onChange={(e) => atualizarOpcao(opcao.id, "texto", e.target.value)}
                                 className="flex-1"
                              />
                              {opcoes.length > 2 && (
                                 <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removerOpcao(opcao.id)}
                                    className="text-red-600 hover:text-red-800"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              )}
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>
            )}

            {tipoSelecionado !== QuestionType.MULTIPLA_ESCOLHA && (
               <Card>
                  <CardHeader>
                     <CardTitle>Resposta Correta</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <div className="space-y-2">
                        <Label htmlFor="gabarito">Gabarito *</Label>
                        <Input {...register("gabarito")} placeholder="Digite a resposta correta..." />
                        {errors.gabarito && <p className="text-sm text-red-600">{errors.gabarito.message}</p>}
                     </div>
                  </CardContent>
               </Card>
            )}

            <Card>
               <CardHeader>
                  <CardTitle>Habilidades da BNCC</CardTitle>
               </CardHeader>
               <CardContent>
                  {habilidadesDisponiveis.length > 0 ? (
                     <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                           {habilidadesSelecionadas.map((habilidade) => (
                              <Badge key={habilidade} variant="default" className="flex items-center space-x-1">
                                 <span>{habilidade}</span>
                                 <button
                                    type="button"
                                    onClick={() => toggleHabilidade(habilidade)}
                                    className="ml-1 text-xs hover:text-red-200"
                                 >
                                    ×
                                 </button>
                              </Badge>
                           ))}
                        </div>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                           {habilidadesDisponiveis.map((habilidade) => (
                              <div key={habilidade} className="flex items-center space-x-2">
                                 <Checkbox
                                    checked={habilidadesSelecionadas.includes(habilidade)}
                                    onCheckedChange={() => toggleHabilidade(habilidade)}
                                 />
                                 <Label className="cursor-pointer text-sm" onClick={() => toggleHabilidade(habilidade)}>
                                    {habilidade}
                                 </Label>
                              </div>
                           ))}
                        </div>
                     </div>
                  ) : (
                     <p className="text-gray-600">Selecione uma série para ver as habilidades disponíveis.</p>
                  )}
               </CardContent>
            </Card>

            <Card>
               <CardHeader>
                  <CardTitle>Explicação da Resolução (Opcional)</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-2">
                     <Label htmlFor="explicacao">Explicação</Label>
                     <textarea
                        {...register("explicacao")}
                        placeholder="Explique como resolver esta questão (opcional)..."
                        className="min-h-[100px] w-full rounded-md border border-gray-300 p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                     />
                     {errors.explicacao && <p className="text-sm text-red-600">{errors.explicacao.message}</p>}
                  </div>
               </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
               <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancelar
               </Button>
               <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar Alterações"}
               </Button>
            </div>
         </form>
      </div>
   );
}
