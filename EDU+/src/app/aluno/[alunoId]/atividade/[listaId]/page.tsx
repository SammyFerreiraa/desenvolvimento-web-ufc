"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Lightbulb, Target, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/interface/components/ui/badge";
import { Button } from "@/interface/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/interface/components/ui/radio-group";
import { alunoApi, type ListaExerciciosResponse } from "@/services/aluno-api";

type Props = {
   params: Promise<{ alunoId: string; listaId: string }>;
};

export default function AtividadePage({ params }: Props) {
   const router = useRouter();
   const resolvedParams = use(params);
   const [atividade, setAtividade] = useState<ListaExerciciosResponse | null>(null);
   const [questaoAtual, setQuestaoAtual] = useState(0);
   const [resposta, setResposta] = useState("");
   const [isLoading, setIsLoading] = useState(true);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showFeedback, setShowFeedback] = useState(false);
   const [ultimaResposta, setUltimaResposta] = useState<any>(null);
   const [tempoInicio, setTempoInicio] = useState<number>(Date.now());

   useEffect(() => {
      carregarAtividade();
   }, []);

   const carregarAtividade = async () => {
      try {
         const response = await alunoApi.obterAtividade(resolvedParams.alunoId, resolvedParams.listaId);
         setAtividade(response);
         setTempoInicio(Date.now());
      } catch (error) {
         console.error("Erro ao carregar atividade:", error);
         router.push(`/aluno/${resolvedParams.alunoId}/dashboard`);
      } finally {
         setIsLoading(false);
      }
   };

   const questaoAtualData = atividade?.questoes[questaoAtual];
   const isUltimaQuestao = questaoAtual === (atividade?.questoes.length || 0) - 1;

   const handleSubmitResposta = async () => {
      if (!questaoAtualData || !resposta.trim()) return;

      setIsSubmitting(true);
      const tempoResposta = Math.floor((Date.now() - tempoInicio) / 1000);

      try {
         const resultado = await alunoApi.submeterResposta(resolvedParams.alunoId, {
            questaoId: questaoAtualData.id,
            listaId: resolvedParams.listaId,
            resposta: resposta.trim(),
            tempoResposta
         });

         setUltimaResposta(resultado);
         setShowFeedback(true);

         if (atividade && atividade.questoes[questaoAtual]) {
            const novaAtividade = { ...atividade };
            const questaoIndex = questaoAtual;
            const questaoAtualizada = novaAtividade.questoes[questaoIndex];

            if (questaoAtualizada) {
               const novaTentativa = {
                  id: resultado.id,
                  resposta: resultado.resposta,
                  correta: resultado.correta,
                  tentativaNumero: resultado.tentativaNumero,
                  tempoResposta: resultado.tempoResposta,
                  createdAt: resultado.createdAt
               };

               questaoAtualizada.tentativas.unshift(novaTentativa as any);
               questaoAtualizada.acertou = resultado.correta || questaoAtualizada.acertou;
               questaoAtualizada.numeroTentativas += 1;

               let questoesRespondidas = 0;
               let questoesCorretas = 0;

               novaAtividade.questoes.forEach((q) => {
                  if (q.tentativas.length > 0) {
                     questoesRespondidas++;
                     if (q.acertou) questoesCorretas++;
                  }
               });

               novaAtividade.progresso = {
                  total: novaAtividade.questoes.length,
                  respondidas: questoesRespondidas,
                  corretas: questoesCorretas,
                  percentualAcerto: questoesRespondidas > 0 ? (questoesCorretas / questoesRespondidas) * 100 : 0
               };

               setAtividade(novaAtividade);
            }
         }
      } catch (error) {
         console.error("Erro ao submeter resposta:", error);
         alert("Erro ao enviar resposta. Tente novamente.");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleProximaQuestao = () => {
      setShowFeedback(false);
      setUltimaResposta(null);
      setResposta("");
      setTempoInicio(Date.now());

      if (isUltimaQuestao) {
         router.push(`/aluno/${resolvedParams.alunoId}/dashboard?concluida=${resolvedParams.listaId}`);
      } else {
         setQuestaoAtual(questaoAtual + 1);
      }
   };

   const handleVoltarQuestao = () => {
      if (questaoAtual > 0) {
         setQuestaoAtual(questaoAtual - 1);
         setResposta("");
         setShowFeedback(false);
         setUltimaResposta(null);
         setTempoInicio(Date.now());
      }
   };

   const parseOpcoes = (opcoes: string | Array<{ id: string; texto: string; correta: boolean }> | undefined) => {
      if (!opcoes) return [];
      if (typeof opcoes === "string") {
         try {
            return JSON.parse(opcoes);
         } catch {
            return [];
         }
      }
      return opcoes;
   };

   if (isLoading) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="text-center">
               <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
               <p className="text-gray-600">Carregando atividade...</p>
            </div>
         </div>
      );
   }

   if (!atividade || !questaoAtualData) {
      return (
         <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="text-center">
               <p className="mb-4 text-gray-600">Atividade não encontrada</p>
               <Button onClick={() => router.push(`/aluno/${resolvedParams.alunoId}/dashboard`)}>
                  Voltar ao Dashboard
               </Button>
            </div>
         </div>
      );
   }

   const opcoes = parseOpcoes(questaoAtualData.opcoes);
   const acertou = questaoAtualData.acertou;

   return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
         <div className="container mx-auto px-4 py-6">
            <div className="mb-8 rounded-2xl border-0 bg-white p-6 shadow-lg">
               <div className="mb-4 flex items-center justify-between">
                  <Button
                     variant="ghost"
                     onClick={() => router.push(`/aluno/${resolvedParams.alunoId}/dashboard`)}
                     className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                  >
                     <ArrowLeft className="h-4 w-4" />
                     Voltar ao Dashboard
                  </Button>

                  <div className="flex items-center gap-4">
                     {acertou && (
                        <Badge className="border-green-200 bg-green-100 text-[#58876A]">
                           <CheckCircle className="mr-1 h-3 w-3" />
                           Concluída
                        </Badge>
                     )}

                     <Badge variant="outline" className="px-3 py-1">
                        Questão {questaoAtual + 1} de {atividade.questoes.length}
                     </Badge>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="rounded-full bg-[#58876A] p-3">
                     <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                     <h1 className="mb-1 text-2xl font-bold text-gray-900">{atividade.titulo}</h1>
                     {atividade.descricao && <p className="text-gray-600">{atividade.descricao}</p>}
                  </div>
               </div>

               {/* Barra de Progresso */}
               <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm text-gray-600">
                     <span className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Progresso da Atividade
                     </span>
                     <span>
                        {atividade.progresso.respondidas}/{atividade.progresso.total} questões
                     </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200">
                     <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${(atividade.progresso.respondidas / atividade.progresso.total) * 100}%` }}
                     />
                  </div>
               </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
               {/* Questão Principal */}
               <div className="lg:col-span-2">
                  <Card className="border-0 shadow-xl">
                     <CardHeader className="rounded-t-xl bg-gradient-to-r from-blue-50 to-purple-50">
                        <div className="flex items-center justify-between">
                           <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
                              <Target className="h-5 w-5 text-[#58876A]" />
                              Questão {questaoAtual + 1}
                           </CardTitle>
                           <div className="flex gap-2">
                              <Badge variant="secondary" className="px-3 py-1">
                                 {"⭐".repeat(questaoAtualData.dificuldade)} Nível {questaoAtualData.dificuldade}
                              </Badge>
                              <Badge variant="outline" className="px-3 py-1">
                                 {questaoAtualData.tipo === "MULTIPLA_ESCOLHA" ? "Múltipla Escolha" : "Numérica"}
                              </Badge>
                           </div>
                        </div>
                     </CardHeader>
                     <CardContent className="space-y-6">
                        <div className="rounded-xl py-6">
                           <div className="mb-3 flex items-center gap-2">
                              <BookOpen className="h-5 w-5 text-[#58876A]" />
                              <span className="font-semibold text-gray-700">Pergunta:</span>
                           </div>
                           <p className="text-lg leading-relaxed whitespace-pre-wrap text-gray-900">
                              {questaoAtualData.enunciado}
                           </p>
                        </div>

                        {!showFeedback && (
                           <div className="space-y-4">
                              {questaoAtualData.tipo === "MULTIPLA_ESCOLHA" && opcoes.length > 0 ? (
                                 <RadioGroup value={resposta} onValueChange={setResposta}>
                                    <div className="space-y-3">
                                       {opcoes.map((opcao: any, index: number) => (
                                          <div
                                             key={opcao.id}
                                             className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-gray-50"
                                          >
                                             <RadioGroupItem value={opcao.id} id={opcao.id} />
                                             <Label htmlFor={opcao.id} className="flex-1 cursor-pointer">
                                                <span className="mr-2 font-medium">
                                                   {String.fromCharCode(65 + index)}
                                                </span>
                                                {opcao.texto}
                                             </Label>
                                          </div>
                                       ))}
                                    </div>
                                 </RadioGroup>
                              ) : (
                                 <div>
                                    <Label htmlFor="resposta" className="text-sm font-medium text-gray-700">
                                       Digite sua resposta:
                                    </Label>
                                    <Input
                                       id="resposta"
                                       type={questaoAtualData.tipo === "NUMERO" ? "number" : "text"}
                                       value={resposta}
                                       onChange={(e) => setResposta(e.target.value)}
                                       placeholder={
                                          questaoAtualData.tipo === "NUMERO" ? "Ex: 42" : "Digite sua resposta..."
                                       }
                                       className="mt-2 text-lg"
                                       disabled={isSubmitting}
                                    />
                                 </div>
                              )}

                              <div className="flex gap-3">
                                 <Button
                                    onClick={handleSubmitResposta}
                                    disabled={!resposta.trim() || isSubmitting}
                                    className="flex-1 py-3 font-semibold text-white"
                                 >
                                    {isSubmitting ? (
                                       <div className="flex items-center gap-2">
                                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                          Enviando...
                                       </div>
                                    ) : (
                                       "Enviar Resposta"
                                    )}
                                 </Button>

                                 {questaoAtual > 0 && (
                                    <Button
                                       variant="outline"
                                       onClick={handleVoltarQuestao}
                                       disabled={isSubmitting}
                                       className="px-6"
                                    >
                                       Anterior
                                    </Button>
                                 )}
                              </div>
                           </div>
                        )}

                        {showFeedback && ultimaResposta && (
                           <div className="space-y-4">
                              <div
                                 className={`rounded-xl border-2 p-6 ${
                                    ultimaResposta.correta
                                       ? "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50"
                                       : "border-red-300 bg-gradient-to-r from-red-50 to-pink-50"
                                 }`}
                              >
                                 <div className="mb-4 flex items-center gap-3">
                                    {ultimaResposta.correta ? (
                                       <div className="rounded-full bg-green-500 p-2">
                                          <CheckCircle className="h-6 w-6 text-white" />
                                       </div>
                                    ) : (
                                       <div className="rounded-full bg-red-500 p-2">
                                          <XCircle className="h-6 w-6 text-white" />
                                       </div>
                                    )}
                                    <h3
                                       className={`text-xl font-bold ${
                                          ultimaResposta.correta ? "text-green-700" : "text-red-700"
                                       }`}
                                    >
                                       {ultimaResposta.correta ? "Parabéns! Resposta correta!" : "Resposta incorreta"}
                                    </h3>
                                 </div>

                                 <p className="mb-2 text-gray-700">
                                    <strong>Sua resposta:</strong> {ultimaResposta.resposta}
                                 </p>

                                 {!ultimaResposta.correta && (
                                    <p className="mb-2 text-gray-700">
                                       <strong>Resposta correta:</strong> {ultimaResposta.questao.gabarito}
                                    </p>
                                 )}

                                 <p className="text-sm text-gray-600">
                                    Tentativa {ultimaResposta.tentativaNumero} • Tempo:{" "}
                                    {Math.floor(ultimaResposta.tempoResposta / 60)}:
                                    {(ultimaResposta.tempoResposta % 60).toString().padStart(2, "0")}
                                 </p>
                              </div>

                              {/* Explicação */}
                              {ultimaResposta.questao.explicacao && (
                                 <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                                    <div className="mb-3 flex items-center gap-2">
                                       <div className="rounded-full bg-[#58876A] p-2">
                                          <Lightbulb className="h-4 w-4 text-white" />
                                       </div>
                                       <h4 className="font-bold text-blue-700">Explicação</h4>
                                    </div>
                                    <p className="text-lg leading-relaxed whitespace-pre-wrap text-gray-700">
                                       {ultimaResposta.questao.explicacao}
                                    </p>
                                 </div>
                              )}

                              <div className="flex gap-3">
                                 {!ultimaResposta.correta && (
                                    <Button
                                       variant="outline"
                                       onClick={() => {
                                          setShowFeedback(false);
                                          setResposta("");
                                          setTempoInicio(Date.now());
                                       }}
                                       className="flex-1 border-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                                    >
                                       Tentar Novamente
                                    </Button>
                                 )}

                                 <Button
                                    onClick={handleProximaQuestao}
                                    className="flex-1 py-3 font-semibold text-white"
                                 >
                                    {isUltimaQuestao ? "Finalizar Atividade" : "Próxima Questão"}
                                 </Button>
                              </div>
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>

               <div className="space-y-6">
                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                           <Target className="h-4 w-4" />
                           Sua Performance
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-3">
                        <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Respondidas:</span>
                           <span className="font-medium">
                              {atividade.progresso.respondidas}/{atividade.progresso.total}
                           </span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Corretas:</span>
                           <span className="font-medium text-green-600">{atividade.progresso.corretas}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Taxa de Acerto:</span>
                           <span className="font-medium">{atividade.progresso.percentualAcerto.toFixed(0)}%</span>
                        </div>
                     </CardContent>
                  </Card>

                  <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                           <BookOpen className="h-4 w-4" />
                           Questões da Atividade
                        </CardTitle>
                     </CardHeader>
                     <CardContent>
                        <div className="grid grid-cols-4 gap-2">
                           {atividade.questoes.map((questao, index) => (
                              <button
                                 key={questao.id}
                                 onClick={() => {
                                    if (!showFeedback) {
                                       setQuestaoAtual(index);
                                       setResposta("");
                                       setTempoInicio(Date.now());
                                    }
                                 }}
                                 disabled={showFeedback}
                                 className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                                    index === questaoAtual
                                       ? "scale-105 bg-[#58876A] text-white shadow-lg"
                                       : questao.acertou
                                         ? "border border-green-200 bg-green-100 text-green-700 hover:bg-green-200"
                                         : questao.tentativas.length > 0
                                           ? "border border-orange-200 bg-orange-100 text-orange-700 hover:bg-orange-200"
                                           : "border border-gray-200 bg-gray-100 text-gray-600 hover:bg-gray-200"
                                 } ${showFeedback ? "cursor-not-allowed opacity-50" : "cursor-pointer"} `}
                              >
                                 {index + 1}
                                 {questao.acertou && <div className="text-xs">✓</div>}
                              </button>
                           ))}
                        </div>

                        <div className="mt-4 space-y-2 text-xs">
                           <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded bg-[#58876A]"></div>
                              <span className="text-gray-600">Atual</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded border border-green-200 bg-green-100"></div>
                              <span className="text-gray-600">Correta</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded border border-orange-200 bg-orange-100"></div>
                              <span className="text-gray-600">Tentativa</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded border border-gray-200 bg-gray-100"></div>
                              <span className="text-gray-600">Não respondida</span>
                           </div>
                        </div>
                     </CardContent>
                  </Card>

                  {questaoAtualData.tentativas.length > 0 && (
                     <Card>
                        <CardHeader>
                           <CardTitle className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4" />
                              Suas Tentativas
                           </CardTitle>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-2">
                              {questaoAtualData.tentativas.slice(0, 3).map((tentativa, index) => (
                                 <div
                                    key={tentativa.id}
                                    className={`rounded border p-2 text-xs ${
                                       tentativa.correta
                                          ? "border-green-200 bg-green-50 text-green-700"
                                          : "border-red-200 bg-red-50 text-red-700"
                                    }`}
                                 >
                                    <div className="flex items-center justify-between">
                                       <span>Tentativa {tentativa.tentativaNumero}</span>
                                       {tentativa.correta ? (
                                          <CheckCircle className="h-3 w-3" />
                                       ) : (
                                          <XCircle className="h-3 w-3" />
                                       )}
                                    </div>
                                    <div className="mt-1 text-gray-600">Resposta: {tentativa.resposta}</div>
                                 </div>
                              ))}
                           </div>
                        </CardContent>
                     </Card>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}
