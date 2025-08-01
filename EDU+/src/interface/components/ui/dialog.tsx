"use client";

import * as React from "react";
import { XIcon } from "lucide-react";
import { cn } from "@/interface/styles/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";

const DialogRoot = DialogPrimitive.Root;

const DialogTrigger = React.forwardRef<
   React.ElementRef<typeof DialogPrimitive.Trigger>,
   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ ...props }, ref) => <DialogPrimitive.Trigger ref={ref} {...props} />);
DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = React.forwardRef<
   React.ElementRef<typeof DialogPrimitive.Close>,
   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ ...props }, ref) => <DialogPrimitive.Close ref={ref} {...props} />);
DialogClose.displayName = DialogPrimitive.Close.displayName;

const DialogOverlay = React.forwardRef<
   React.ElementRef<typeof DialogPrimitive.Overlay>,
   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
   <DialogPrimitive.Overlay
      ref={ref}
      className={cn(
         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
         className
      )}
      {...props}
   />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
   React.ElementRef<typeof DialogPrimitive.Content>,
   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
      showCloseButton?: boolean;
   }
>(({ className, children, showCloseButton = true, ...props }, ref) => (
   <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
         ref={ref}
         className={cn(
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg",
            className
         )}
         {...props}
      >
         {children}
         {showCloseButton && (
            <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
               <XIcon className="h-4 w-4" />
               <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
         )}
      </DialogPrimitive.Content>
   </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
   ({ className, ...props }, ref) => (
      <div ref={ref} className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
   )
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(
   ({ className, ...props }, ref) => (
      <div
         ref={ref}
         className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
         {...props}
      />
   )
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
   React.ElementRef<typeof DialogPrimitive.Title>,
   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
   <DialogPrimitive.Title
      ref={ref}
      className={cn("text-lg leading-none font-semibold tracking-tight", className)}
      {...props}
   />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
   React.ElementRef<typeof DialogPrimitive.Description>,
   React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
   <DialogPrimitive.Description ref={ref} className={cn("muted-foreground text-sm", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

const Dialog = Object.assign(DialogRoot, {
   Content: DialogContent,
   Header: DialogHeader,
   Footer: DialogFooter,
   Title: DialogTitle,
   Description: DialogDescription,
   Trigger: DialogTrigger,
   Close: DialogClose,
   Portal: DialogPortal,
   Overlay: DialogOverlay
});

export {
   Dialog,
   DialogClose,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogOverlay,
   DialogPortal,
   DialogTitle,
   DialogTrigger
};
