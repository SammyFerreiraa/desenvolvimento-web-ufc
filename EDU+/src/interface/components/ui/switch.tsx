"use client";

import * as React from "react";
import { cn } from "@/interface/styles/utils";
import * as SwitchPrimitive from "@radix-ui/react-switch";

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
   label?: string;
   labelPosition?: "top" | "left" | "right" | "bottom";
   labelClassName?: string;
   containerClassName?: string;
   error?: string;
   errorClassName?: string;
};

const Switch = ({
   className,
   label,
   labelPosition = "right",
   labelClassName,
   containerClassName,
   error,
   errorClassName,
   id,
   ...props
}: SwitchProps) => {
   const generatedId = React.useId();
   const switchId = id || generatedId;

   const switchElement = (
      <SwitchPrimitive.Root
         id={switchId}
         data-slot="switch"
         className={cn(
            "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
            className
         )}
         {...props}
      >
         <SwitchPrimitive.Thumb
            data-slot="switch-thumb"
            className={cn(
               "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
            )}
         />
      </SwitchPrimitive.Root>
   );

   const labelElement = label ? (
      <label
         htmlFor={switchId}
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
      return switchElement;
   }

   const containerClasses = cn(
      "flex",
      {
         "flex-col space-y-2": labelPosition === "top" || labelPosition === "bottom",
         "flex-row space-x-2 items-center": labelPosition === "left" || labelPosition === "right"
      },
      containerClassName
   );

   // Para exibir apenas o switch com erro, sem label
   if (!label && error) {
      return (
         <div className={cn("flex flex-col space-y-2", containerClassName)}>
            {switchElement}
            <p className={cn("text-sm text-red-500", errorClassName)}>{error}</p>
         </div>
      );
   }

   return (
      <div className={cn("flex flex-col space-y-2")}>
         <div className={containerClasses}>
            {(labelPosition === "top" || labelPosition === "left") && labelElement}
            {switchElement}
            {(labelPosition === "bottom" || labelPosition === "right") && labelElement}
         </div>
         {error && <p className={cn("text-sm text-red-500", errorClassName)}>{error}</p>}
      </div>
   );
};

export { Switch };
