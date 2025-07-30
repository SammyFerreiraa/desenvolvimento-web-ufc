import { redirect } from "next/navigation";
import { getAuthSession } from "@/common/auth";
import { UserRole } from "@prisma/client";

export default async function HomePage() {
   const session = await getAuthSession();

   if (!session) {
      redirect("/login");
   }

   // Redirecionar baseado no role do usuário
   switch (session.role) {
      case UserRole.ALUNO:
         redirect("/aluno");
         break;
      case UserRole.PROFESSOR:
         redirect("/professor/");
         break;
      case UserRole.ADMIN:
         redirect("/admin");
         break;
      default:
         redirect("/unauthorized");
         break;
   }
}
