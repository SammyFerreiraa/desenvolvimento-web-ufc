"use client";

import * as React from "react";
import { format, isValid, parse, type Locale } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../styles/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps {
   className?: string;
   label?: string;
   error?: string;
   placeholder?: string;
   disabled?: boolean;
   value?: Date;
   onValueChange?: (date: Date | undefined) => void;
   dateFormat?: string;
   locale?: Locale;
   minDate?: Date;
   maxDate?: Date;
   id?: string;
}

const formatDate = (date: Date | undefined, dateFormat: string, locale?: Locale): string => {
   if (!date || !isValid(date)) {
      return "";
   }
   return format(date, dateFormat, { locale });
};

const parseDate = (value: string, dateFormat: string, locale?: Locale): Date | undefined => {
   if (!value.trim()) {
      return undefined;
   }

   try {
      const parsed = parse(value, dateFormat, new Date(), { locale });
      return isValid(parsed) ? parsed : undefined;
   } catch {
      return undefined;
   }
};

const DatePicker = ({
   className,
   label,
   error,
   placeholder = "Selecione uma data",
   disabled = false,
   value,
   onValueChange,
   dateFormat = "dd/MM/yyyy",
   locale = pt,
   minDate,
   maxDate,
   id,
   ...props
}: DatePickerProps) => {
   const [open, setOpen] = React.useState(false);
   const [inputValue, setInputValue] = React.useState(() => formatDate(value, dateFormat, locale));
   const [month, setMonth] = React.useState<Date | undefined>(value || new Date());

   const generatedId = React.useId();
   const datePickerId = id || generatedId;

   // Update input value when external value changes
   React.useEffect(() => {
      setInputValue(formatDate(value, dateFormat, locale));
   }, [value, dateFormat, locale]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      const parsedDate = parseDate(newValue, dateFormat, locale);
      if (parsedDate && isValid(parsedDate)) {
         onValueChange?.(parsedDate);
         setMonth(parsedDate);
      } else if (!newValue.trim()) {
         onValueChange?.(undefined);
      }
   };

   const handleDateSelect = (selectedDate: Date | undefined) => {
      if (selectedDate) {
         onValueChange?.(selectedDate);
         setInputValue(formatDate(selectedDate, dateFormat, locale));
         setMonth(selectedDate);
      } else {
         onValueChange?.(undefined);
         setInputValue("");
      }
      setOpen(false);
   };

   const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown" && !disabled) {
         e.preventDefault();
         setOpen(true);
      }
      if (e.key === "Escape") {
         setOpen(false);
      }
   };

   return (
      <div className={cn("space-y-2", className)}>
         {label && (
            <label
               htmlFor={datePickerId}
               className={cn(
                  "text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  error && "text-destructive"
               )}
            >
               {label}
            </label>
         )}

         <div className="relative">
            <Input
               id={datePickerId}
               value={inputValue}
               placeholder={placeholder}
               disabled={disabled}
               onChange={handleInputChange}
               onKeyDown={handleInputKeyDown}
               className={cn("pr-10", error && "border-destructive focus-visible:ring-destructive")}
               {...props}
            />

            <Popover open={open} onOpenChange={setOpen}>
               <PopoverTrigger asChild>
                  <Button
                     type="button"
                     variant="ghost"
                     size="sm"
                     disabled={disabled}
                     className="absolute top-0 right-0 h-full px-3 py-2 hover:bg-transparent"
                     onClick={() => !disabled && setOpen(!open)}
                  >
                     <CalendarIcon className="h-4 w-4" />
                     <span className="sr-only">Abrir calendário</span>
                  </Button>
               </PopoverTrigger>

               <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
                  <Calendar
                     mode="single"
                     selected={value}
                     onSelect={handleDateSelect}
                     month={month}
                     onMonthChange={setMonth}
                     disabled={(date) => {
                        if (minDate && date < minDate) return true;
                        if (maxDate && date > maxDate) return true;
                        return false;
                     }}
                     initialFocus
                  />
               </PopoverContent>
            </Popover>
         </div>

         {error && <p className="text-destructive text-sm font-medium">{error}</p>}
      </div>
   );
};

DatePicker.displayName = "DatePicker";

export { DatePicker };
