import { routesPermissions } from "@/config/route-control";
import type { UserRole } from "@prisma/client";

export const checkRoutePermission = (path: string, role: UserRole): boolean => {
   // Primeiro, verificar correspondência exata
   for (const route of routesPermissions) {
      if (path === route.path) {
         return route.rolesAllowed.includes(role);
      }
   }

   // Depois, verificar se alguma rota pai corresponde (para rotas aninhadas)
   for (const route of routesPermissions) {
      if (path.startsWith(route.path + "/") || path.startsWith(route.path)) {
         return route.rolesAllowed.includes(role);
      }

      // Verificar padrões dinâmicos
      const dynamicPattern = route.path.replace(/\[([^\]]+)\]/g, "([^/]+)");
      const regex = new RegExp(`^${dynamicPattern}`);
      if (regex.test(path)) {
         return route.rolesAllowed.includes(role);
      }
   }

   return false;
};
