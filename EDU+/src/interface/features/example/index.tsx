"use client";

import { useState } from "react";
import { modal } from "@/interface/components/modal";
import { Autocomplete } from "@/interface/components/ui/autocomplete";
import { Button } from "@/interface/components/ui/button";
import { CheckboxWithLabel } from "@/interface/components/ui/checkbox";
import { DatePicker } from "@/interface/components/ui/date-picker";
import {
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle
} from "@/interface/components/ui/dialog";
import { FileUpload } from "@/interface/components/ui/file-upload";
import { Input } from "@/interface/components/ui/input";
import { SelectItem, SelectWithLabel } from "@/interface/components/ui/select";
import { Switch } from "@/interface/components/ui/switch";
import { SortableHeader, Table } from "@/interface/components/ui/table";
import type { ColumnDef } from "@tanstack/react-table";

// Dados de exemplo para a tabela
type User = {
   id: number;
   name: string;
   email: string;
   role: string;
   status: "Ativo" | "Inativo";
   createdAt: string;
};

const sampleUsers: User[] = [
   {
      id: 1,
      name: "João Silva",
      email: "joao@exemplo.com",
      role: "Admin",
      status: "Ativo",
      createdAt: "2024-01-15"
   },
   {
      id: 2,
      name: "Maria Santos",
      email: "maria@exemplo.com",
      role: "Editor",
      status: "Ativo",
      createdAt: "2024-02-20"
   },
   {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@exemplo.com",
      role: "Viewer",
      status: "Inativo",
      createdAt: "2024-03-10"
   },
   {
      id: 4,
      name: "Ana Oliveira",
      email: "ana@exemplo.com",
      role: "Editor",
      status: "Ativo",
      createdAt: "2024-04-05"
   },
   {
      id: 5,
      name: "Carlos Ferreira",
      email: "carlos@exemplo.com",
      role: "Admin",
      status: "Ativo",
      createdAt: "2024-05-12"
   }
];

const userColumns: ColumnDef<User>[] = [
   {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader column={column}>ID</SortableHeader>
   },
   {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column}>Nome</SortableHeader>
   },
   {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column}>Email</SortableHeader>
   },
   {
      accessorKey: "role",
      header: "Role"
   },
   {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
         const status = String(row.getValue("status"));
         return (
            <span
               className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                  status === "Ativo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
               }`}
            >
               {status}
            </span>
         );
      }
   },
   {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader column={column}>Criado em</SortableHeader>,
      cell: ({ row }) => {
         const date = new Date(String(row.getValue("createdAt")));
         return date.toLocaleDateString("pt-BR");
      }
   }
];

export const ComponentExamples = () => {
   const [switchState, setSwitchState] = useState(false);
   const [selectValue, setSelectValue] = useState<string>();
   const [checkboxState, setCheckboxState] = useState(false);
   const [files, setFiles] = useState<File[]>([]);
   const [selectedDate, setSelectedDate] = useState<Date>();

   const [autocompleteBasic, setAutocompleteBasic] = useState<string[]>([]);
   const [autocompleteMultiple, setAutocompleteMultiple] = useState<string[]>([]);
   const [autocompleteSingle, setAutocompleteSingle] = useState<string[]>([]);
   const [autocompleteError, setAutocompleteError] = useState<string[]>([]);

   // Função para mostrar modal de confirmação
   const showConfirmDialog = () => {
      modal.show({
         content: (
            <DialogContent className="sm:max-w-[425px]">
               <DialogHeader>
                  <DialogTitle>Confirmar Ação</DialogTitle>
                  <DialogDescription>
                     Tem certeza de que deseja realizar esta ação? Esta operação não pode ser desfeita.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => {
                        modal.close();
                        alert("Ação cancelada!");
                     }}
                  >
                     Cancelar
                  </Button>
                  <Button
                     onClick={() => {
                        modal.close();
                        alert("Ação confirmada!");
                     }}
                  >
                     Confirmar
                  </Button>
               </DialogFooter>
            </DialogContent>
         )
      });
   };

   // Função para mostrar modal personalizado
   const showCustomDialog = () => {
      modal.show({
         content: (
            <DialogContent className="sm:max-w-[600px]">
               <DialogHeader>
                  <DialogTitle>Modal Personalizado</DialogTitle>
                  <DialogDescription>Este é um exemplo de modal com conteúdo personalizado.</DialogDescription>
               </DialogHeader>
               <div className="py-4">
                  <div className="space-y-4">
                     <Input placeholder="Digite algo aqui..." />
                     <div className="flex items-center space-x-2">
                        <input type="checkbox" id="terms" />
                        <label htmlFor="terms" className="text-sm">
                           Aceito os termos e condições
                        </label>
                     </div>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => modal.close()}>
                     Fechar
                  </Button>
                  <Button
                     onClick={() => {
                        modal.close();
                        alert("Dados salvos!");
                     }}
                  >
                     Salvar
                  </Button>
               </DialogFooter>
            </DialogContent>
         )
      });
   };

   // Função para mostrar modal lateral (right sheet)
   const showRightSheetDialog = () => {
      modal.show({
         content: (
            <DialogContent className="fixed top-0 right-0 h-full max-w-[60%] translate-x-0 translate-y-0 rounded-l-md rounded-r-none">
               <DialogHeader>
                  <DialogTitle>Painel Lateral</DialogTitle>
                  <DialogDescription>Este modal aparece como um painel lateral direito.</DialogDescription>
               </DialogHeader>
               <div className="flex-1 py-4">
                  <div className="space-y-4">
                     <p>Conteúdo do painel lateral...</p>
                     <Input placeholder="Campo de exemplo" />
                     <Button className="w-full">Ação do Painel</Button>
                  </div>
               </div>
               <DialogFooter>
                  <Button variant="outline" onClick={() => modal.close()}>
                     Fechar Painel
                  </Button>
               </DialogFooter>
            </DialogContent>
         )
      });
   };

   const techOptions = [
      { label: "React", value: "react" },
      { label: "TypeScript", value: "typescript" },
      { label: "Next.js", value: "nextjs" },
      { label: "Tailwind CSS", value: "tailwind" },
      { label: "JavaScript", value: "javascript" },
      { label: "Node.js", value: "nodejs" },
      { label: "Express", value: "express" },
      { label: "MongoDB", value: "mongodb" },
      { label: "PostgreSQL", value: "postgresql" },
      { label: "Redis", value: "redis" },
      { label: "Vue.js", value: "vuejs" },
      { label: "Angular", value: "angular" },
      { label: "Svelte", value: "svelte" },
      { label: "Python", value: "python" },
      { label: "Django", value: "django" }
   ];

   // Função para simular busca de opções
   const fetchTechOptions = async (query: string) => {
      // Simula delay de API
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!query) {
         return techOptions.slice(0, 5); // Retorna algumas opções iniciais
      }

      return techOptions.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));
   };

   return (
      <div className="mx-auto max-w-4xl space-y-12 p-6">
         <div className="space-y-2">
            <h1 className="text-3xl font-bold">Componentes UI</h1>
         </div>

         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Switch */}
            <div className="space-y-3 rounded-lg border p-4">
               <h2 className="font-semibold">Switch</h2>
               <div className="space-y-3">
                  <Switch label="Básico" checked={switchState} onCheckedChange={setSwitchState} />
                  <Switch label="Desabilitado" disabled />
               </div>
            </div>

            {/* Button */}
            <div className="space-y-3 rounded-lg border p-4">
               <h2 className="font-semibold">Button</h2>
               <div className="flex flex-col gap-3">
                  <Button>Default</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost" size="sm">
                     Ghost
                  </Button>
               </div>
            </div>

            {/* Input */}
            <div className="space-y-3 rounded-lg border p-4">
               <h2 className="font-semibold">Input</h2>
               <div className="space-y-3">
                  <Input placeholder="Texto simples" />
                  <Input type="email" placeholder="Email" />
                  <Input disabled placeholder="Desabilitado" />
               </div>
            </div>

            {/* Select */}
            <div className="space-y-3 rounded-lg border p-4">
               <h2 className="font-semibold">Select</h2>
               <div className="space-y-3">
                  <SelectWithLabel
                     label="Básico"
                     placeholder="Selecione uma opção"
                     value={selectValue}
                     onValueChange={setSelectValue}
                  >
                     <SelectItem value="option1">Opção 1</SelectItem>
                     <SelectItem value="option2">Opção 2</SelectItem>
                     <SelectItem value="option3">Opção 3</SelectItem>
                  </SelectWithLabel>
                  <SelectWithLabel label="Desabilitado" placeholder="Desabilitado" disabled>
                     <SelectItem value="disabled">Não disponível</SelectItem>
                  </SelectWithLabel>
                  <SelectWithLabel label="Com erro" placeholder="Com erro" error="Este campo é obrigatório">
                     <SelectItem value="error">Erro</SelectItem>
                  </SelectWithLabel>
               </div>
            </div>

            {/* Checkbox */}
            <div className="space-y-3 rounded-lg border p-4">
               <h2 className="font-semibold">Checkbox</h2>
               <div className="space-y-3">
                  <CheckboxWithLabel
                     label="Básico"
                     checked={checkboxState}
                     onCheckedChange={(checked) => setCheckboxState(!!checked)}
                  />
                  <CheckboxWithLabel label="Desabilitado" disabled />
                  <CheckboxWithLabel label="Com erro" error="Este campo é obrigatório" />
                  <CheckboxWithLabel label="Label à esquerda" labelPosition="left" />
               </div>
            </div>

            {/* FileUpload */}
            <div className="space-y-3 rounded-lg border p-4">
               <h2 className="font-semibold">File Upload</h2>
               <div className="space-y-3">
                  <FileUpload
                     label="Upload único"
                     placeholder="Clique ou arraste um arquivo"
                     value={files}
                     onFilesChange={setFiles}
                     accept="image/*"
                     maxSize={5 * 1024 * 1024} // 5MB
                  />
                  <FileUpload
                     label="Upload múltiplo"
                     placeholder="Clique ou arraste múltiplos arquivos"
                     multiple
                     maxFiles={3}
                     accept=".pdf,.doc,.docx"
                  />
                  <FileUpload label="Desabilitado" disabled />
                  <FileUpload label="Com erro" error="Arquivo obrigatório" accept="image/*" />
               </div>
            </div>

            {/* DatePicker */}
            <div className="space-y-3 rounded-lg border p-4">
               <h2 className="font-semibold">Date Picker</h2>
               <div className="space-y-3">
                  <DatePicker
                     label="Data básica"
                     placeholder="Selecione uma data"
                     value={selectedDate}
                     onValueChange={setSelectedDate}
                  />
                  <DatePicker label="Formato americano" placeholder="MM/dd/yyyy" dateFormat="MM/dd/yyyy" />
                  <DatePicker label="Com data mínima" placeholder="A partir de hoje" minDate={new Date()} />
                  <DatePicker label="Desabilitado" disabled />
                  <DatePicker label="Com erro" error="Data é obrigatória" />
               </div>
            </div>

            {/* Modal Examples */}
            <div className="space-y-3 rounded-lg border p-4">
               <h2 className="font-semibold">Modal / Dialog</h2>
               <div className="space-y-3">
                  <Button onClick={showConfirmDialog} variant="outline" className="w-full">
                     Modal de Confirmação
                  </Button>
                  <Button onClick={showCustomDialog} variant="outline" className="w-full">
                     Modal Personalizado
                  </Button>
                  <Button onClick={showRightSheetDialog} variant="outline" className="w-full">
                     Painel Lateral (Right Sheet)
                  </Button>
                  <Button onClick={() => modal.closeAll()} variant="destructive" size="sm" className="w-full">
                     Fechar Todos os Modais
                  </Button>
               </div>
            </div>
         </div>
         {/* Autocomplete */}
         <div className="space-y-3 rounded-lg border p-4">
            <h2 className="font-semibold">Autocomplete</h2>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-medium">Básico (Seleção única)</label>
                  <Autocomplete
                     placeholder="Digite para buscar tecnologias..."
                     selectedValues={autocompleteSingle}
                     onSelectionChange={setAutocompleteSingle}
                     fetchOptions={fetchTechOptions}
                     multiple={false}
                     showInitialOptions={true}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium">Múltipla seleção</label>
                  <Autocomplete
                     placeholder="Selecione múltiplas tecnologias..."
                     selectedValues={autocompleteMultiple}
                     onSelectionChange={setAutocompleteMultiple}
                     fetchOptions={fetchTechOptions}
                     multiple={true}
                     maxSelected={5}
                     showInitialOptions={true}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium">Com busca dinâmica</label>
                  <Autocomplete
                     placeholder="Digite pelo menos 2 caracteres..."
                     selectedValues={autocompleteBasic}
                     onSelectionChange={setAutocompleteBasic}
                     fetchOptions={fetchTechOptions}
                     debounceMs={500}
                     emptyText="Nenhuma tecnologia encontrada"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-sm font-medium">Desabilitado</label>
                  <Autocomplete
                     placeholder="Não disponível"
                     selectedValues={[]}
                     onSelectionChange={() => {}}
                     fetchOptions={fetchTechOptions}
                     disabled={true}
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-destructive text-sm font-medium">Com estado de erro</label>
                  <Autocomplete
                     placeholder="Campo obrigatório"
                     selectedValues={autocompleteError}
                     onSelectionChange={setAutocompleteError}
                     fetchOptions={fetchTechOptions}
                     className="border-destructive focus:ring-destructive"
                  />
                  <p className="text-destructive text-sm">Este campo é obrigatório</p>
               </div>
            </div>
         </div>

         {/* Table Examples */}
         <div className="space-y-6">
            <h2 className="text-2xl font-bold">Tabela com Ordenação e Paginação</h2>

            {/* Basic Table */}
            <div className="space-y-3 rounded-lg border p-6">
               <h3 className="text-lg font-semibold">Tabela Básica</h3>
               <Table
                  data={sampleUsers}
                  columns={userColumns}
                  searchable={true}
                  searchColumn="name"
                  searchPlaceholder="Buscar por nome..."
                  onRowClick={(user) => alert(`Clicou no usuário: ${user.name}`)}
               />
            </div>

            {/* Table without search */}
            <div className="space-y-3 rounded-lg border p-6">
               <h3 className="text-lg font-semibold">Tabela sem Busca</h3>
               <Table data={sampleUsers} columns={userColumns} searchable={false} initialPageSize={3} />
            </div>

            {/* Table without pagination */}
            <div className="space-y-3 rounded-lg border p-6">
               <h3 className="text-lg font-semibold">Tabela sem Paginação</h3>
               <Table
                  data={sampleUsers}
                  columns={userColumns}
                  enablePagination={false}
                  searchPlaceholder="Buscar usuários..."
               />
            </div>
         </div>
      </div>
   );
};
