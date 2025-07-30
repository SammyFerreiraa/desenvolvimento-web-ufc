import type { UseFormReturn } from "react-hook-form";
import { Controller, FormProvider, type Control, type FieldValues, type Path } from "react-hook-form";
import { cn } from "../styles/utils";
import { CheckboxWithLabel, type CheckboxProps } from "./ui/checkbox";
import { DatePicker, type DatePickerProps } from "./ui/date-picker";
import { FileUpload, type FileUploadProps } from "./ui/file-upload";
import { Input, type InputProps } from "./ui/input";
import { SelectWithLabel, type SelectProps } from "./ui/select";
import type { SwitchProps } from "./ui/switch";
import { Switch } from "./ui/switch";
import { Table, type DataTableProps } from "./ui/table";

const Form = <T extends FieldValues>({
   methods,
   children,
   onSubmit,
   className
}: {
   methods: UseFormReturn<T, unknown, T>;
   children: React.ReactNode;
   onSubmit: (data: T) => void;
   className?: string;
}) => {
   return (
      <FormProvider {...methods}>
         <form onSubmit={methods.handleSubmit(onSubmit)} className={cn("flex flex-col gap-4", className)}>
            {children}
         </form>
      </FormProvider>
   );
};

const InputForm = <T extends FieldValues>(props: InputProps & { name: Path<T>; control: Control<T> }) => {
   return (
      <Controller name={props.name} control={props.control} render={({ field }) => <Input {...props} {...field} />} />
   );
};

const SwitchForm = <T extends FieldValues>(props: SwitchProps & { name: Path<T>; control: Control<T> }) => {
   return (
      <Controller name={props.name} control={props.control} render={({ field }) => <Switch {...props} {...field} />} />
   );
};

const SelectForm = <T extends FieldValues>(props: SelectProps & { name: Path<T>; control: Control<T> }) => {
   return (
      <Controller
         name={props.name}
         control={props.control}
         render={({ field }) => <SelectWithLabel {...props} {...field} />}
      />
   );
};

const CheckboxForm = <T extends FieldValues>(props: CheckboxProps & { name: Path<T>; control: Control<T> }) => {
   return (
      <Controller
         name={props.name}
         control={props.control}
         render={({ field: { value, onChange, ...field } }) => (
            <CheckboxWithLabel {...props} {...field} checked={value} onCheckedChange={onChange} />
         )}
      />
   );
};

const FileUploadForm = <T extends FieldValues>(props: FileUploadProps & { name: Path<T>; control: Control<T> }) => {
   return (
      <Controller
         name={props.name}
         control={props.control}
         render={({ field: { value, onChange, ...field } }) => (
            <FileUpload {...props} {...field} value={value} onFilesChange={onChange} />
         )}
      />
   );
};

const DatePickerForm = <T extends FieldValues>(props: DatePickerProps & { name: Path<T>; control: Control<T> }) => {
   return (
      <Controller
         name={props.name}
         control={props.control}
         render={({ field: { value, onChange, ...field } }) => (
            <DatePicker {...props} {...field} value={value} onValueChange={onChange} />
         )}
      />
   );
};

const TableComponent = <TData, TValue>(props: DataTableProps<TData, TValue>) => {
   return <Table {...props} />;
};

Form.Input = InputForm;
Form.Switch = SwitchForm;
Form.Select = SelectForm;
Form.Checkbox = CheckboxForm;
Form.FileUpload = FileUploadForm;
Form.DatePicker = DatePickerForm;
Form.Table = TableComponent;

export { Form };
