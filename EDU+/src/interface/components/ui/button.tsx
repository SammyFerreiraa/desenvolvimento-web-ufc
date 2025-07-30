"use client";

import * as React from "react";
import { useTransition } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/interface/styles/utils";

const buttonVariants = cva(
   "inline-flex cursor-pointer relative items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
   {
      variants: {
         variant: {
            default: "bg-[#58876A] text-primary-foreground hover:bg-[#58876A]/90",
            destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-[#58876A] text-secondary-foreground hover:bg-[#58876A]/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-[#58876A] underline-offset-4 hover:underline"
         },
         size: {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10"
         }
      },
      defaultVariants: {
         variant: "default",
         size: "default"
      }
   }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
   VariantProps<typeof buttonVariants> & {
      isLoading?: boolean;
      ref?: React.RefObject<HTMLButtonElement>;
   };

const Button = ({ className, variant, size, isLoading, children, onClick, ref, ...props }: ButtonProps) => {
   const [isPending, startTransition] = useTransition();

   const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      if (onClick) {
         const result = onClick(event) as unknown as Promise<void>;
         if (result instanceof Promise) {
            startTransition(() => result);
         }
      }
   };

   return (
      <button
         className={cn(buttonVariants({ variant, size, className }))}
         {...props}
         onClick={handleClick}
         ref={ref}
         disabled={props.disabled || isLoading}
      >
         <span
            className={cn(
               "flex items-center justify-center gap-2",
               isLoading || (onClick && isPending) ? "opacity-0" : "opacity-100"
            )}
         >
            {children}
         </span>
         {(isLoading || (onClick && isPending)) && (
            <span className="absolute inset-0 flex items-center justify-center">
               <LoaderCircle className="h-4 w-4 animate-spin" />
            </span>
         )}
      </button>
   );
};

export { Button, buttonVariants };
