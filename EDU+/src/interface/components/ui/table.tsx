/* eslint-disable react/prop-types */
"use client";

import * as React from "react";
import {
   ChevronDownIcon,
   ChevronLeftIcon,
   ChevronRightIcon,
   ChevronsLeftIcon,
   ChevronsRightIcon,
   ChevronsUpDownIcon,
   ChevronUpIcon
} from "lucide-react";
import {
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   useReactTable,
   type ColumnDef,
   type ColumnFiltersState,
   type PaginationState,
   type SortingState,
   type Table as TanstackTable,
   type VisibilityState
} from "@tanstack/react-table";
import { cn } from "../../styles/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

// Base table components
const TableRoot = ({
   className,
   ref,
   ...props
}: React.HTMLAttributes<HTMLTableElement> & { ref?: React.Ref<HTMLTableElement> }) => (
   <div className="relative w-full overflow-auto">
      <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
   </div>
);

const TableHeader = ({
   className,
   ref,
   ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & { ref?: React.Ref<HTMLTableSectionElement> }) => (
   <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
);

const TableBody = ({
   className,
   ref,
   ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & { ref?: React.Ref<HTMLTableSectionElement> }) => (
   <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
);

const TableFooter = ({
   className,
   ref,
   ...props
}: React.HTMLAttributes<HTMLTableSectionElement> & { ref?: React.Ref<HTMLTableSectionElement> }) => (
   <tfoot ref={ref} className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)} {...props} />
);

const TableRow = ({
   className,
   ref,
   ...props
}: React.HTMLAttributes<HTMLTableRowElement> & { ref?: React.Ref<HTMLTableRowElement> }) => (
   <tr
      ref={ref}
      className={cn("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className)}
      {...props}
   />
);

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
   ({ className, ...props }, ref) => (
      <th
         ref={ref}
         className={cn(
            "text-muted-foreground h-12 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
            className
         )}
         {...props}
      />
   )
);
TableHead.displayName = "TableHead";

const TableCell = ({
   className,
   ref,
   ...props
}: React.TdHTMLAttributes<HTMLTableCellElement> & { ref?: React.Ref<HTMLTableCellElement> }) => (
   <td ref={ref} className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
);

const TableCaption = ({
   className,
   ref,
   ...props
}: React.HTMLAttributes<HTMLTableCaptionElement> & { ref?: React.Ref<HTMLTableCaptionElement> }) => (
   <caption ref={ref} className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />
);

// Sortable header component
type SortableHeaderProps = React.HTMLAttributes<HTMLDivElement> & {
   column: {
      getCanSort: () => boolean;
      getIsSorted: () => false | "asc" | "desc";
      toggleSorting: (desc?: boolean) => void;
   };
   children: React.ReactNode;
   className?: string;
};

const SortableHeader = ({ column, children, className, ...props }: SortableHeaderProps) => {
   const canSort = column.getCanSort();
   const sortDirection = column.getIsSorted();

   if (!canSort) {
      return (
         <div className={className} {...props}>
            {children}
         </div>
      );
   }

   return (
      <div className={cn("flex items-center space-x-2", className)} {...props}>
         <Button
            variant="ghost"
            size="sm"
            className="data-[state=open]:bg-accent -ml-3 h-8"
            onClick={() => column.toggleSorting(sortDirection === "asc")}
         >
            <span>{children}</span>
            {sortDirection === "desc" ? (
               <ChevronDownIcon className="ml-2 h-4 w-4" />
            ) : sortDirection === "asc" ? (
               <ChevronUpIcon className="ml-2 h-4 w-4" />
            ) : (
               <ChevronsUpDownIcon className="ml-2 h-4 w-4" />
            )}
         </Button>
      </div>
   );
};

// Pagination component
type TablePaginationProps<TData> = {
   table: TanstackTable<TData>;
   className?: string;
};

const TablePagination = <TData,>({ table, className }: TablePaginationProps<TData>) => (
   <div className={cn("flex items-center justify-between px-2", className)}>
      <div className="text-muted-foreground flex-1 text-sm">
         {table.getFilteredSelectedRowModel().rows.length} de {table.getFilteredRowModel().rows.length} linha(s)
         selecionada(s).
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
         <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Linhas por página</p>
            <Select
               value={`${table.getState().pagination.pageSize}`}
               onValueChange={(value) => {
                  table.setPageSize(Number(value));
               }}
            >
               <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={table.getState().pagination.pageSize} />
               </SelectTrigger>
               <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                     <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>
         </div>
         <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
         </div>
         <div className="flex items-center space-x-2">
            <Button
               variant="outline"
               className="hidden h-8 w-8 p-0 lg:flex"
               onClick={() => table.setPageIndex(0)}
               disabled={!table.getCanPreviousPage()}
            >
               <span className="sr-only">Ir para primeira página</span>
               <ChevronsLeftIcon className="h-4 w-4" />
            </Button>
            <Button
               variant="outline"
               className="h-8 w-8 p-0"
               onClick={() => table.previousPage()}
               disabled={!table.getCanPreviousPage()}
            >
               <span className="sr-only">Ir para página anterior</span>
               <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
               variant="outline"
               className="h-8 w-8 p-0"
               onClick={() => table.nextPage()}
               disabled={!table.getCanNextPage()}
            >
               <span className="sr-only">Ir para próxima página</span>
               <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
               variant="outline"
               className="hidden h-8 w-8 p-0 lg:flex"
               onClick={() => table.setPageIndex(table.getPageCount() - 1)}
               disabled={!table.getCanNextPage()}
            >
               <span className="sr-only">Ir para última página</span>
               <ChevronsRightIcon className="h-4 w-4" />
            </Button>
         </div>
      </div>
   </div>
);

// Main DataTable component
type DataTableProps<TData, TValue> = {
   columns: ColumnDef<TData, TValue>[];
   data: TData[];
   searchable?: boolean;
   searchPlaceholder?: string;
   searchColumn?: string;
   className?: string;
   enableSorting?: boolean;
   enableFiltering?: boolean;
   enablePagination?: boolean;
   initialPageSize?: number;
   onRowClick?: (row: TData) => void;
};

const DataTable = <TData, TValue>({
   columns,
   data,
   searchable = true,
   searchPlaceholder = "Filtrar...",
   searchColumn,
   className,
   enableSorting = true,
   enableFiltering = true,
   enablePagination = true,
   initialPageSize = 10,
   onRowClick
}: DataTableProps<TData, TValue>) => {
   const [sorting, setSorting] = React.useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
   const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
   const [rowSelection, setRowSelection] = React.useState({});
   const [pagination, setPagination] = React.useState<PaginationState>({
      pageIndex: 0,
      pageSize: initialPageSize
   });

   const table = useReactTable({
      data,
      columns,
      onSortingChange: enableSorting ? setSorting : undefined,
      onColumnFiltersChange: enableFiltering ? setColumnFilters : undefined,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
      getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
      getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      onPaginationChange: enablePagination ? setPagination : undefined,
      state: {
         sorting: enableSorting ? sorting : undefined,
         columnFilters: enableFiltering ? columnFilters : undefined,
         columnVisibility,
         rowSelection,
         pagination: enablePagination ? pagination : undefined
      }
   });

   const globalFilterColumn = searchColumn || "id";

   return (
      <div className={cn("w-full", className)}>
         {searchable && (
            <div className="flex items-center py-4">
               <Input
                  placeholder={searchPlaceholder}
                  value={(table.getColumn(globalFilterColumn)?.getFilterValue() as string) ?? ""}
                  onChange={(event) => table.getColumn(globalFilterColumn)?.setFilterValue(event.target.value)}
                  className="max-w-sm"
               />
            </div>
         )}
         <div className="rounded-md border">
            <TableRoot>
               <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                           <TableHead key={header.id}>
                              {header.isPlaceholder
                                 ? null
                                 : flexRender(header.column.columnDef.header, header.getContext())}
                           </TableHead>
                        ))}
                     </TableRow>
                  ))}
               </TableHeader>
               <TableBody>
                  {table.getRowModel().rows?.length ? (
                     table.getRowModel().rows.map((row) => (
                        <TableRow
                           key={row.id}
                           data-state={row.getIsSelected() && "selected"}
                           onClick={() => onRowClick?.(row.original)}
                           className={onRowClick ? "cursor-pointer" : undefined}
                        >
                           {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                 {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                           Nenhum resultado encontrado.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </TableRoot>
         </div>
         {enablePagination && (
            <div className="py-4">
               <TablePagination table={table} />
            </div>
         )}
      </div>
   );
};

// Compound component pattern exports
const Table = Object.assign(DataTable, {
   Root: TableRoot,
   Header: TableHeader,
   Body: TableBody,
   Footer: TableFooter,
   Head: TableHead,
   Row: TableRow,
   Cell: TableCell,
   Caption: TableCaption,
   SortableHeader,
   Pagination: TablePagination
});

export {
   Table,
   DataTable,
   TableRoot,
   TableHeader,
   TableBody,
   TableFooter,
   TableHead,
   TableRow,
   TableCell,
   TableCaption,
   SortableHeader,
   TablePagination,
   type DataTableProps
};
