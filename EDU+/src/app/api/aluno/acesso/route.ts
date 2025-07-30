import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "@/config/zod-config";
import { prisma } from "@/server/config/prisma";

const acessoSchema = z.object({
   codigoAcesso: z
      .string()
      .min(6, "Código de acesso deve ter 6 caracteres")
      .max(6, "Código de acesso deve ter 6 caracteres")
});

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { codigoAcesso } = acessoSchema.parse(body);

      // Buscar o aluno pelo código de acesso
      const userProfile = await prisma.userProfile.findUnique({
         where: { codigoAcesso },
         include: {
            user: {
               include: {
                  turmasParticipa: {
                     include: {
                        professor: {
                           select: {
                              id: true,
                              name: true
                           }
                        },
                        _count: {
                           select: {
                              alunos: true
                           }
                        }
                     }
                  }
               }
            }
         }
      });

      if (!userProfile || !userProfile.user || userProfile.user.role !== "ALUNO") {
         return NextResponse.json({ error: "Código de acesso inválido" }, { status: 404 });
      }

      if (!userProfile.ativo) {
         return NextResponse.json({ error: "Este aluno não está mais ativo no sistema" }, { status: 400 });
      }

      const aluno = userProfile.user;
      const turma = aluno.turmasParticipa[0]; // Assumindo que o aluno está em apenas uma turma

      if (!turma || !turma.ativa) {
         return NextResponse.json({ error: "Aluno não está matriculado em uma turma ativa" }, { status: 400 });
      }

      // Buscar estatísticas do aluno
      const tentativas = await prisma.tentativaQuestao.findMany({
         where: {
            alunoId: aluno.id
         }
      });

      const totalTentativas = tentativas.length;
      const totalAcertos = tentativas.filter((t: any) => t.correta).length;
      const percentualAcerto = totalTentativas > 0 ? (totalAcertos / totalTentativas) * 100 : 0;

      // Contar questões respondidas únicas
      const questoesRespondidas = new Set(tentativas.map((t: any) => t.questaoId)).size;

      // Buscar conquistas (implementar sistema de conquistas mais tarde)
      const conquistas: any[] = [];

      const response = {
         id: aluno.id,
         nome: aluno.name,
         codigoAcesso: userProfile.codigoAcesso,
         turma: {
            id: turma.id,
            nome: turma.nome,
            serie: turma.serie,
            professor: turma.professor,
            _count: turma._count
         },
         estatisticas: {
            totalTentativas,
            totalAcertos,
            percentualAcerto: Math.round(percentualAcerto * 100) / 100,
            questoesRespondidas,
            medalhas: 0 // Implementar sistema de medalhas
         },
         conquistas
      };

      return NextResponse.json(response);
   } catch (error) {
      console.error("Erro ao processar acesso do aluno:", error);

      if (error instanceof z.ZodError) {
         return NextResponse.json({ error: "Código de acesso inválido", details: error.errors }, { status: 400 });
      }

      return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
   }
}
