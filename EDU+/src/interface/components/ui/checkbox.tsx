"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/interface/styles/utils";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

const Checkbox = ({
   className,
   error,
   ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & {
   error?: boolean;
}) => {
   return (
      <CheckboxPrimitive.Root
         data-slot="checkbox"
         className={cn(
            "peer border-input data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 size-4 shrink-0 rounded-[4px] border bg-transparent shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red ring-red focus-visible:ring-red",
            className
         )}
         {...props}
      >
         <CheckboxPrimitive.Indicator
            data-slot="checkbox-indicator"
            className="flex items-center justify-center text-current transition-none"
         >
            <CheckIcon className="size-3.5" />
         </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
   );
};

export type CheckboxProps = React.ComponentProps<typeof CheckboxPrimitive.Root> & {
   label?: string;
   error?: string;
   wrapperClassName?: string;
   labelClassName?: string;
   checkboxClassName?: string;
   errorClassName?: string;
   labelPosition?: "left" | "right";
};

const CheckboxWithLabel = ({
   label,
   error,
   wrapperClassName,
   labelClassName,
   checkboxClassName,
   errorClassName,
   labelPosition = "right",
   id,
   ...props
}: CheckboxProps) => {
   const generatedId = React.useId();
   const checkboxId = id || generatedId;

   const checkboxElement = <Checkbox id={checkboxId} error={!!error} className={checkboxClassName} {...props} />;

   const labelElement = label ? (
      <label
         htmlFor={checkboxId}
         className={cn(
            "cursor-pointer text-sm leading-none font-medium select-none",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            labelClassName
         )}
      >
         {label}
      </label>
   ) : null;

   if (!label && !error) {
      return checkboxElement;
   }

   const containerClasses = cn("flex items-center space-x-2", wrapperClassName);

   if (!label && error) {
      return (
         <div className={cn("flex flex-col space-y-2", wrapperClassName)}>
            {checkboxElement}
            <p className={cn("text-sm text-red-500", errorClassName)}>{error}</p>
         </div>
      );
   }

   return (
      <div className={cn("flex flex-col space-y-2")}>
         <div className={containerClasses}>
            {labelPosition === "left" && labelElement}
            {checkboxElement}
            {labelPosition === "right" && labelElement}
         </div>
         {error && <p className={cn("text-sm text-red-500", errorClassName)}>{error}</p>}
      </div>
   );
};

export { Checkbox, CheckboxWithLabel };
