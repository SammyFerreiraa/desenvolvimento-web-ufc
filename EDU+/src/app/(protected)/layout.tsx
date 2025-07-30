import type { ReactNode } from "react";
import { ProtectedLayoutClient } from "./layout-client";

interface ProtectedLayoutProps {
   children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
   return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
