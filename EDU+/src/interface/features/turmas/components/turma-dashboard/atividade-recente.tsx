"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/interface/components/ui/card";

export function AtividadeRecente() {
   return (
      <Card>
         <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               <div className="text-sm text-gray-600">
                  <p>Nenhuma atividade recente</p>
               </div>
            </div>
         </CardContent>
      </Card>
   );
}
