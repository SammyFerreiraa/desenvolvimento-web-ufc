"use client";

import { Button } from "@/interface/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from "@/interface/components/ui/dialog";
import { Input } from "@/interface/components/ui/input";
import { Label } from "@/interface/components/ui/label";

type EditandoAluno = {
   id: string;
   nome: string;
   responsavel: string;
   dataNascimento?: string;
};

type EditarAlunoModalProps = {
   editandoAluno: EditandoAluno | null;
   onClose: () => void;
   setEditandoAluno: (aluno: EditandoAluno) => void;
   onSalvar: () => void;
   isLoading: boolean;
};

export function EditarAlunoModal({
   editandoAluno,
   onClose,
   setEditandoAluno,
   onSalvar,
   isLoading
}: EditarAlunoModalProps) {
   return (
      <Dialog open={!!editandoAluno} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Editar Dados do Aluno</DialogTitle>
               <DialogDescription>Atualize as informações do aluno.</DialogDescription>
            </DialogHeader>

            {editandoAluno && (
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="editNome">Nome do Aluno</Label>
                     <Input
                        id="editNome"
                        value={editandoAluno.nome}
                        onChange={(e) => setEditandoAluno({ ...editandoAluno, nome: e.target.value })}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="editResponsavel">Responsável/Guardião</Label>
                     <Input
                        id="editResponsavel"
                        value={editandoAluno.responsavel}
                        onChange={(e) => setEditandoAluno({ ...editandoAluno, responsavel: e.target.value })}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="editDataNascimento">Data de Nascimento</Label>
                     <Input
                        id="editDataNascimento"
                        type="date"
                        value={editandoAluno.dataNascimento}
                        onChange={(e) => setEditandoAluno({ ...editandoAluno, dataNascimento: e.target.value })}
                     />
                  </div>
               </div>
            )}

            <DialogFooter>
               <Button variant="outline" onClick={onClose}>
                  Cancelar
               </Button>
               <Button onClick={onSalvar} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Alterações"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
