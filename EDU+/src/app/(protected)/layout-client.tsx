"use client";

import type { ReactNode } from "react";
import { BookOpen, Database, Home, UserCircle, Users } from "lucide-react";
import { AppHeader } from "@/interface/components/app-header";
import { Sidebar } from "@/interface/components/sidebar";
import { SidebarProvider } from "@/interface/components/sidebar/context";
import { Button } from "@/interface/components/ui/button";
import { signOutAction } from "@/server/actions/auth";

interface ProtectedLayoutClientProps {
   children: ReactNode;
}

export function ProtectedLayoutClient({ children }: ProtectedLayoutClientProps) {
   return (
      <SidebarProvider defaultOpen={true}>
         <div className="flex h-screen">
            <Sidebar>
               <Sidebar.Header>
                  <div className="flex items-center gap-3">
                     <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                        <BookOpen className="h-5 w-5 text-white" />
                     </div>
                  </div>
               </Sidebar.Header>

               <Sidebar.Content>
                  <Sidebar.Item href="/professor" icon={Home}>
                     Início
                  </Sidebar.Item>
                  <Sidebar.Item href="/professor/turmas" icon={Users}>
                     Minhas Turmas
                  </Sidebar.Item>
                  <Sidebar.Item href="/professor/questoes" icon={Database}>
                     Banco de questões
                  </Sidebar.Item>
                  <Sidebar.Item href="/professor/perfil" icon={UserCircle}>
                     Meu perfil
                  </Sidebar.Item>
               </Sidebar.Content>

               <Sidebar.Footer>
                  <form action={signOutAction}>
                     <Button
                        variant="ghost"
                        size="sm"
                        type="submit"
                        className="w-full text-emerald-50 hover:bg-emerald-500/20 hover:text-white"
                     >
                        Logout
                     </Button>
                  </form>
               </Sidebar.Footer>
            </Sidebar>

            <div className="flex flex-1 flex-col overflow-hidden">
               <AppHeader />
               <main className="flex-1 overflow-auto p-6">{children}</main>
            </div>
         </div>
      </SidebarProvider>
   );
}
