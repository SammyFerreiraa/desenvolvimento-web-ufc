import { UserRole } from "@prisma/client";

// Permissões específicas para o sistema EDU+
export const Permissions = {
   // Permissões básicas
   CREATE: "CREATE",
   READ: "READ",
   UPDATE: "UPDATE",
   DELETE: "DELETE",

   // Permissões específicas do EDU+
   CREATE_TURMA: "CREATE_TURMA",
   MANAGE_TURMA: "MANAGE_TURMA",
   CREATE_QUESTAO: "CREATE_QUESTAO",
   EDIT_QUESTAO: "EDIT_QUESTAO",
   DELETE_QUESTAO: "DELETE_QUESTAO",
   CREATE_LISTA: "CREATE_LISTA",
   EDIT_LISTA: "EDIT_LISTA",
   DELETE_LISTA: "DELETE_LISTA",
   VIEW_RELATORIOS: "VIEW_RELATORIOS",
   VIEW_ALL_TURMAS: "VIEW_ALL_TURMAS",
   MANAGE_USUARIOS: "MANAGE_USUARIOS",
   FAZER_EXERCICIO: "FAZER_EXERCICIO",
   VIEW_CONQUISTAS: "VIEW_CONQUISTAS",
   VIEW_DESEMPENHO_PROPRIO: "VIEW_DESEMPENHO_PROPRIO",
   VIEW_DESEMPENHO_ALUNOS: "VIEW_DESEMPENHO_ALUNOS"
} as const;

export type IPermission = (typeof Permissions)[keyof typeof Permissions];

// Mapeamento de permissões baseado nas regras de negócio do EDU+
export const RolePermissions = {
   [UserRole.ALUNO]: [
      Permissions.READ,
      Permissions.FAZER_EXERCICIO,
      Permissions.VIEW_CONQUISTAS,
      Permissions.VIEW_DESEMPENHO_PROPRIO
   ] as IPermission[],

   [UserRole.PROFESSOR]: [
      Permissions.READ,
      Permissions.CREATE,
      Permissions.UPDATE,
      Permissions.DELETE,
      Permissions.CREATE_TURMA,
      Permissions.MANAGE_TURMA,
      Permissions.CREATE_QUESTAO,
      Permissions.EDIT_QUESTAO,
      Permissions.DELETE_QUESTAO,
      Permissions.CREATE_LISTA,
      Permissions.EDIT_LISTA,
      Permissions.DELETE_LISTA,
      Permissions.VIEW_RELATORIOS,
      Permissions.VIEW_DESEMPENHO_ALUNOS
   ] as IPermission[],

   [UserRole.ADMIN]: [
      // Admin tem todas as permissões
      Permissions.READ,
      Permissions.CREATE,
      Permissions.UPDATE,
      Permissions.DELETE,
      Permissions.CREATE_TURMA,
      Permissions.MANAGE_TURMA,
      Permissions.CREATE_QUESTAO,
      Permissions.EDIT_QUESTAO,
      Permissions.DELETE_QUESTAO,
      Permissions.CREATE_LISTA,
      Permissions.EDIT_LISTA,
      Permissions.DELETE_LISTA,
      Permissions.VIEW_RELATORIOS,
      Permissions.VIEW_ALL_TURMAS,
      Permissions.MANAGE_USUARIOS,
      Permissions.FAZER_EXERCICIO,
      Permissions.VIEW_CONQUISTAS,
      Permissions.VIEW_DESEMPENHO_PROPRIO,
      Permissions.VIEW_DESEMPENHO_ALUNOS
   ] as IPermission[]
} as const;

export const checkPermission = (role: UserRole, permissions: IPermission[]): boolean => {
   const rolePermissions = RolePermissions[role];
   return permissions.some((permission) => rolePermissions.includes(permission));
};
