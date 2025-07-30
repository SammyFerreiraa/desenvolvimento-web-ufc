import "@/interface/styles/globals.css";
import { Toaster } from "react-hot-toast";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TRPCReactProvider } from "@/config/trpc/react";
import { ModalContainer } from "@/interface/components/modal";

export const metadata: Metadata = {
   title: "EDU +",
   description: "Plataforma educacional",
   icons: [{ rel: "icon", url: "/favicon.ico" }]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
   return (
      <html lang="en" className={`${GeistSans.variable}`}>
         <NuqsAdapter>
            <body suppressHydrationWarning={true}>
               <ModalContainer />
               <Toaster toastOptions={{ duration: 2000 }} />
               <TRPCReactProvider>{children}</TRPCReactProvider>
            </body>
         </NuqsAdapter>
      </html>
   );
}
