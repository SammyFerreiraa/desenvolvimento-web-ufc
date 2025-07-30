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

type AdicionarAlunoModalProps = {
   isOpen: boolean;
   onClose: () => void;
   turmaNome: string;
   nomeAluno: string;
   setNomeAluno: (nome: string) => void;
   responsavel: string;
   setResponsavel: (responsavel: string) => void;
   dataNascimento: string;
   setDataNascimento: (data: string) => void;
   onCadastrar: () => void;
   isLoading: boolean;
};

export function AdicionarAlunoModal({
   isOpen,
   onClose,
   turmaNome,
   nomeAluno,
   setNomeAluno,
   responsavel,
   setResponsavel,
   dataNascimento,
   setDataNascimento,
   onCadastrar,
   isLoading
}: AdicionarAlunoModalProps) {
   return (
      <Dialog open={isOpen} onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Adicionar Novo Aluno</DialogTitle>
               <DialogDescription>Preencha os dados do aluno para cadastrá-lo na turma {turmaNome}.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
               <div className="space-y-2">
                  <Label htmlFor="nomeAluno">Nome do Aluno</Label>
                  <Input
                     id="nomeAluno"
                     placeholder="Digite o nome completo do aluno"
                     value={nomeAluno}
                     onChange={(e) => setNomeAluno(e.target.value)}
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável/Guardião</Label>
                  <Input
                     id="responsavel"
                     placeholder="Nome do responsável"
                     value={responsavel}
                     onChange={(e) => setResponsavel(e.target.value)}
                  />
               </div>

               <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento (opcional)</Label>
                  <Input
                     id="dataNascimento"
                     type="date"
                     value={dataNascimento}
                     onChange={(e) => setDataNascimento(e.target.value)}
                  />
               </div>
            </div>

            <DialogFooter>
               <Button variant="outline" onClick={onClose}>
                  Cancelar
               </Button>
               <Button onClick={onCadastrar} disabled={isLoading}>
                  {isLoading ? "Cadastrando..." : "Cadastrar Aluno"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
