import * as React from "react";
import { useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Eye, EyeClosed } from "lucide-react";
import { cn } from "@/interface/styles/utils";
import { Button } from "./button";

const BaseInput = ({
   ref,
   className,
   type,
   ...props
}: React.ComponentProps<"input"> & {
   ref?: React.RefCallback<HTMLInputElement>;
}) => {
   return (
      <input
         type={type}
         className={cn(
            "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border bg-transparent px-3 py-3 text-lg transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
         )}
         ref={ref}
         {...props}
      />
   );
};

export type InputProps = React.ComponentProps<typeof BaseInput> & {
   label?: string;
   error?: string;
   wrapperClassName?: string;
   labelClassName?: string;
   inputClassName?: string;
   errorClassName?: string;
   endIcon?: React.ReactNode;
   startIcon?: React.ReactNode;
   startIconClassName?: string;
   endIconClassName?: string;
};

const Input = ({
   label,
   error,
   wrapperClassName,
   labelClassName,
   inputClassName,
   errorClassName,
   endIcon,
   startIcon,
   startIconClassName,
   endIconClassName,
   ...props
}: InputProps) => {
   return (
      <div className={cn("flex flex-col gap-3", wrapperClassName)}>
         {label && (
            <label htmlFor={props.id} className={cn("text-sm font-semibold", labelClassName)}>
               {label}
            </label>
         )}

         <div className="relative flex w-full items-center">
            {startIcon && (
               <span className={cn("text-muted-foreground pointer-events-none absolute left-2", startIconClassName)}>
                  {startIcon}
               </span>
            )}
            <BaseInput
               {...props}
               className={cn(
                  startIcon && "pl-9",
                  endIcon && "pr-9",
                  error && "border-red ring-red focus-visible:ring-red",
                  inputClassName
               )}
            />
            {endIcon && (
               <span className={cn("text-muted-foreground pointer-events-none absolute right-2", endIconClassName)}>
                  {endIcon}
               </span>
            )}
         </div>

         {error && <p className={cn("text-sm text-red-500", errorClassName)}>{error}</p>}
      </div>
   );
};

const InputForm = <T extends FieldValues>(props: InputProps & { name: Path<T>; control: Control<T> }) => {
   return (
      <Controller name={props.name} control={props.control} render={({ field }) => <Input {...props} {...field} />} />
   );
};

const InputPassword = <T extends FieldValues>(
   props: Omit<InputProps, "endIcon"> & { name: Path<T>; control: Control<T> }
) => {
   const [showPassword, setShowPassword] = useState(false);
   return (
      <Controller
         name={props.name}
         control={props.control}
         render={({ field }) => (
            <Input
               {...props}
               className={cn(props.className, "tracking-widest")}
               {...field}
               type={showPassword ? "text" : "password"}
               endIconClassName="pointer-events-auto"
               endIcon={
                  showPassword ? (
                     <Button variant="ghost" size="icon" type="button" onClick={() => setShowPassword(!showPassword)}>
                        <Eye />
                     </Button>
                  ) : (
                     <Button variant="ghost" size="icon" type="button" onClick={() => setShowPassword(!showPassword)}>
                        <EyeClosed />
                     </Button>
                  )
               }
            />
         )}
      />
   );
};

export { BaseInput, Input, InputForm, InputPassword };
