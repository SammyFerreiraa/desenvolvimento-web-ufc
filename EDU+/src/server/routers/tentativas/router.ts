import { z } from "zod";
import { createTRPCRouter, procedures } from "@/server/config/trpc";
import { StudentProgressStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { tentativasRepository } from "./repository";

export const tentativasRouter = createTRPCRouter({
   // Iniciar uma tentativa de lista de exercícios
   iniciar: procedures.protected.input(z.object({ listaId: z.string() })).mutation(async ({ input, ctx }) => {
      const { listaId } = input;
      const { session } = ctx;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado"
         });
      }

      // Verificar se a lista existe e o aluno tem acesso
      const lista = await tentativasRepository.findListaComAcesso(listaId, session.id);

      if (!lista) {
         throw new TRPCError({
            code: "NOT_FOUND",
            message: "Lista de exercícios não encontrada ou acesso não autorizado"
         });
      }

      // Verificar se já existe uma tentativa
      const tentativaExistente = await tentativasRepository.findByAlunoAndLista(session.id, listaId);

      if (tentativaExistente) {
         if (tentativaExistente.status === StudentProgressStatus.CONCLUIDO) {
            throw new TRPCError({
               code: "BAD_REQUEST",
               message: "Esta lista já foi finalizada"
            });
         }
         return tentativaExistente;
      }

      // Criar nova tentativa
      const tentativa = await tentativasRepository.createTentativaLista(session.id, listaId);

      return tentativa;
   }),

   // Responder uma questão
   responder: procedures.protected
      .input(
         z.object({
            questaoId: z.string(),
            resposta: z.string(),
            tentativaListaId: z.string().optional(),
            tempoResposta: z.number().optional()
         })
      )
      .mutation(async ({ input, ctx }) => {
         const { questaoId, resposta, tentativaListaId, tempoResposta } = input;
         const { session } = ctx;

         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Usuário não autenticado"
            });
         }

         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Usuário não autenticado"
            });
         }

         // Verificar se a questão existe e o aluno tem acesso
         const questao = await tentativasRepository.findQuestaoComAcesso(questaoId, session.id);

         if (!questao) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Questão não encontrada ou acesso não autorizado"
            });
         }

         // Verificar se a resposta está correta (gabarito é JSON)
         let gabarito;
         try {
            gabarito = JSON.parse(questao.gabarito);
         } catch {
            gabarito = questao.gabarito;
         }

         const correta = gabarito === resposta;

         // Calcular pontuação baseada na dificuldade e se está correta
         let pontuacao = 0;
         if (correta) {
            switch (questao.dificuldade) {
               case 1:
               case 2:
                  pontuacao = 100;
                  break;
               case 3:
                  pontuacao = 150;
                  break;
               case 4:
               case 5:
                  pontuacao = 200;
                  break;
               default:
                  pontuacao = 100;
            }
         }

         // Criar tentativa de questão
         const tentativaQuestao = await tentativasRepository.createTentativaQuestao({
            alunoId: session.id,
            questaoId,
            tentativaListaId,
            resposta,
            correta,
            pontuacao,
            tempoResposta
         });

         // Atualizar desempenho das habilidades BNCC
         if (questao.habilidades && questao.habilidades.length > 0) {
            for (const habilidade of questao.habilidades) {
               await tentativasRepository.upsertDesempenhoHabilidade(session.id, habilidade, correta);
            }
         }

         return {
            ...tentativaQuestao,
            correta,
            pontuacao
         };
      }),

   // Finalizar uma tentativa de lista
   finalizar: procedures.protected
      .input(z.object({ tentativaListaId: z.string() }))
      .mutation(async ({ input, ctx }) => {
         const { tentativaListaId } = input;
         const { session } = ctx;

         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Usuário não autenticado"
            });
         }

         // Buscar a tentativa e verificar se pertence ao aluno
         const tentativa = await tentativasRepository.findById(tentativaListaId);

         if (!tentativa || tentativa.alunoId !== session.id) {
            throw new TRPCError({
               code: "NOT_FOUND",
               message: "Tentativa não encontrada"
            });
         }

         if (tentativa.status === StudentProgressStatus.CONCLUIDO) {
            throw new TRPCError({
               code: "BAD_REQUEST",
               message: "Esta tentativa já foi finalizada"
            });
         }

         // Calcular pontuação total das questões respondidas
         const pontuacaoTotal = tentativa.tentativasQuestao.reduce((total, t) => total + (t.pontuacao || 0), 0);

         // Atualizar tentativa como finalizada
         const tentativaAtualizada = await tentativasRepository.updateTentativaLista(tentativaListaId, {
            status: StudentProgressStatus.CONCLUIDO,
            pontuacaoTotal,
            finalizadaEm: new Date()
         });

         return tentativaAtualizada;
      }),

   // Obter tentativa atual (em progresso)
   atual: procedures.protected.input(z.object({ listaId: z.string() })).query(async ({ input, ctx }) => {
      const { listaId } = input;
      const { session } = ctx;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado"
         });
      }

      const tentativa = await tentativasRepository.findByAlunoAndLista(session.id, listaId);

      if (!tentativa) {
         return null;
      }

      return tentativa;
   }),

   // Listar tentativas do aluno com paginação
   minhasTentativas: procedures.protected
      .input(
         z.object({
            page: z.number().default(0),
            limit: z.number().min(1).max(50).default(10)
         })
      )
      .query(async ({ input, ctx }) => {
         const { page, limit } = input;
         const { session } = ctx;

         if (!session) {
            throw new TRPCError({
               code: "UNAUTHORIZED",
               message: "Usuário não autenticado"
            });
         }

         const resultado = await tentativasRepository.findByAluno(session.id, page, limit);

         return resultado;
      }),

   // Obter resultado detalhado de uma tentativa
   resultado: procedures.protected.input(z.object({ tentativaListaId: z.string() })).query(async ({ input, ctx }) => {
      const { tentativaListaId } = input;
      const { session } = ctx;

      if (!session) {
         throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Usuário não autenticado"
         });
      }

      const tentativa = await tentativasRepository.findById(tentativaListaId);

      if (!tentativa || tentativa.alunoId !== session.id) {
         throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tentativa não encontrada"
         });
      }

      // Calcular estatísticas
      const totalQuestoes = tentativa.lista.questoes.length;
      const questoesRespondidas = tentativa.tentativasQuestao.length;
      const questoesCorretas = tentativa.tentativasQuestao.filter((t) => t.correta).length;
      const percentualAcerto = totalQuestoes > 0 ? (questoesCorretas / totalQuestoes) * 100 : 0;

      return {
         ...tentativa,
         estatisticas: {
            totalQuestoes,
            questoesRespondidas,
            questoesCorretas,
            percentualAcerto
         }
      };
   })
});
