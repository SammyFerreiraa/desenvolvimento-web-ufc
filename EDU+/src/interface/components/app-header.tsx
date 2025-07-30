"use client";

import { Menu } from "lucide-react";
import { Sidebar } from "@/interface/components/sidebar";
import { useSidebar } from "@/interface/components/sidebar/context";

export function AppHeader() {
   const { isMobile } = useSidebar();

   return (
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
         <div className="flex items-center gap-4">
            <Sidebar.Toggle className="text-gray-600 hover:bg-gray-100 hover:text-gray-900" icon={Menu} />
            <h1 className="text-lg font-semibold text-gray-900">{isMobile ? "EDU +" : ""}</h1>
         </div>
      </header>
   );
}
