import { UserRole } from "@prisma/client";

// Definir grupos de permissões baseados nos roles do EDU+
const todosUsuarios = [UserRole.ADMIN, UserRole.PROFESSOR, UserRole.ALUNO];
const apenasAdmin = [UserRole.ADMIN];
const professorEAdmin = [UserRole.ADMIN, UserRole.PROFESSOR];

// Rotas públicas (não precisam de autenticação)
export const publicRoutes = ["/login", "/auth/verify-token", "/unauthorized", "/cadastro", "/aluno"];

// Configuração de permissões por rota baseada nas regras de negócio do EDU+
export const routesPermissions = [
   // Página inicial - todos os usuários autenticados
   {
      path: "/",
      rolesAllowed: todosUsuarios
   },

   // Área do aluno
   {
      path: "/aluno",
      rolesAllowed: [UserRole.ALUNO, UserRole.ADMIN] // Aluno + Admin para monitoramento
   },
   {
      path: "/aluno",
      rolesAllowed: [UserRole.ALUNO, UserRole.ADMIN]
   },
   {
      path: "/aluno/exercicios",
      rolesAllowed: [UserRole.ALUNO, UserRole.ADMIN]
   },
   {
      path: "/aluno/conquistas",
      rolesAllowed: [UserRole.ALUNO, UserRole.ADMIN]
   },

   // Área do professor
   {
      path: "/professor",
      rolesAllowed: professorEAdmin
   },
   {
      path: "/professor",
      rolesAllowed: professorEAdmin
   },
   {
      path: "/professor/turmas",
      rolesAllowed: professorEAdmin
   },
   {
      path: "/professor/turmas/criar",
      rolesAllowed: professorEAdmin
   },
   {
      path: "/professor/turmas/editar",
      rolesAllowed: professorEAdmin
   },
   {
      path: "/professor/turmas/dashboard",
      rolesAllowed: professorEAdmin
   },
   {
      path: "/professor/questoes",
      rolesAllowed: professorEAdmin
   },
   {
      path: "/professor/relatorios",
      rolesAllowed: professorEAdmin
   },
   {
      path: "/professor/perfil",
      rolesAllowed: professorEAdmin
   },

   // Área administrativa (apenas admin)
   {
      path: "/admin",
      rolesAllowed: apenasAdmin
   },
   {
      path: "/admin/usuarios",
      rolesAllowed: apenasAdmin
   },
   {
      path: "/admin/sistema",
      rolesAllowed: apenasAdmin
   },

   // Rotas de exemplo/desenvolvimento (manter temporariamente)
   {
      path: "/posts",
      rolesAllowed: todosUsuarios
   }
];
