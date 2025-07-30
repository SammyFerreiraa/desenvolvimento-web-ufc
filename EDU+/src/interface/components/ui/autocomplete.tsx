"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/interface/styles/utils";
import { Badge } from "./badge";

export interface Option {
   value: string;
   label: string;
}

type AutocompleteProps = {
   placeholder?: string;
   emptyText?: string;
   selectedValues: string[];
   onSelectionChange: (values: string[]) => void;
   fetchOptions: (query: string) => Promise<Option[]>;
   debounceMs?: number;
   maxSelected?: number;
   disabled?: boolean;
   className?: string;
   showInitialOptions?: boolean;
   initialOptions?: Option[];
   maxVisibleChips?: number;
   multiple?: boolean;
   containerClassName?: string;
   inputWrapperClassName?: string;
   inputClassName?: string;
   menuClassName?: string;
   optionClassName?: string;
   selectedOptionClassName?: string;
   focusedOptionClassName?: string;
   chipClassName?: string;
   chipRemoveButtonClassName?: string;
   loadingClassName?: string;
   emptyClassName?: string;
   counterClassName?: string;
};

export const Autocomplete = ({
   placeholder = "Digite para buscar...",
   emptyText = "Nenhum item encontrado.",
   selectedValues,
   onSelectionChange,
   fetchOptions,
   debounceMs = 300,
   maxSelected,
   disabled = false,
   className,
   showInitialOptions = false,
   initialOptions,
   maxVisibleChips,
   multiple = true,
   containerClassName,
   inputWrapperClassName,
   inputClassName,
   menuClassName,
   optionClassName,
   selectedOptionClassName,
   focusedOptionClassName,
   chipClassName,
   chipRemoveButtonClassName,
   loadingClassName,
   emptyClassName
}: AutocompleteProps) => {
   const [options, setOptions] = useState<Option[]>(initialOptions || []);
   const [loading, setLoading] = useState(false);
   const [query, setQuery] = useState("");
   const [isOpen, setIsOpen] = useState(false);
   const [focusedIndex, setFocusedIndex] = useState(-1);
   const [isFocused, setIsFocused] = useState(false);
   const [isExpanded, setIsExpanded] = useState(false);

   const inputRef = useRef<HTMLInputElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const dropdownRef = useRef<HTMLDivElement>(null);
   const inputWrapperRef = useRef<HTMLDivElement>(null);
   const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

   const useDebounce = (value: string, delay: number) => {
      const [debouncedValue, setDebouncedValue] = useState(value);

      useEffect(() => {
         const handler = setTimeout(() => {
            setDebouncedValue(value);
         }, delay);

         return () => {
            clearTimeout(handler);
         };
      }, [value, delay]);

      return debouncedValue;
   };

   const debouncedQuery = useDebounce(query, debounceMs);

   useEffect(() => {
      if (focusedIndex >= 0 && optionRefs.current[focusedIndex] && dropdownRef.current) {
         const focusedElement = optionRefs.current[focusedIndex];
         const dropdown = dropdownRef.current;

         if (focusedElement) {
            const dropdownScrollTop = dropdown.scrollTop;
            const dropdownHeight = dropdown.clientHeight;
            const focusedOffsetTop = focusedElement.offsetTop;
            const focusedHeight = focusedElement.offsetHeight;

            if (focusedOffsetTop + focusedHeight > dropdownScrollTop + dropdownHeight) {
               dropdown.scrollTop = focusedOffsetTop + focusedHeight - dropdownHeight;
            } else if (focusedOffsetTop < dropdownScrollTop) {
               dropdown.scrollTop = focusedOffsetTop;
            }
         }
      }
   }, [focusedIndex]);

   useEffect(() => {
      const loadOptions = async () => {
         if (debouncedQuery.length === 0 && !showInitialOptions) {
            return;
         }

         setLoading(true);
         try {
            const results = await fetchOptions(debouncedQuery);
            setOptions(results);
            setFocusedIndex(-1);
            optionRefs.current = [];
         } catch (error) {
            console.error("Erro ao buscar opções:", error);
            setOptions([]);
         } finally {
            setLoading(false);
         }
      };

      loadOptions().catch(console.error);
   }, [debouncedQuery, fetchOptions, showInitialOptions]);

   useEffect(() => {
      if (showInitialOptions && !initialOptions) {
         const loadInitialOptions = async () => {
            setLoading(true);
            try {
               const results = await fetchOptions("");
               setOptions(results);
            } catch (error) {
               console.error("Erro ao buscar opções iniciais:", error);
            } finally {
               setLoading(false);
            }
         };

         loadInitialOptions().catch(console.error);
      }
   }, [showInitialOptions, initialOptions, fetchOptions]);

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
            setIsOpen(false);
            setFocusedIndex(-1);
            setIsFocused(false);
            setIsExpanded(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   const selectedOptionsMap = useMemo(() => {
      const map = new Map<string, Option>();
      options.forEach((option) => {
         if (selectedValues.includes(option.value)) {
            map.set(option.value, option);
         }
      });
      return map;
   }, [options, selectedValues]);

   const selectedOption = useMemo(() => {
      if (!multiple && selectedValues.length > 0) {
         const firstValue = selectedValues[0];
         return firstValue ? selectedOptionsMap.get(firstValue) : null;
      }
      return null;
   }, [multiple, selectedValues, selectedOptionsMap]);

   const handleSelect = (value: string) => {
      if (multiple) {
         if (selectedValues.includes(value)) {
            onSelectionChange(selectedValues.filter((v) => v !== value));
         } else {
            if (!maxSelected || selectedValues.length < maxSelected) {
               onSelectionChange([...selectedValues, value]);
            }
         }
         setQuery("");
         setFocusedIndex(-1);
         setTimeout(() => {
            inputRef.current?.focus();
         }, 10);
      } else {
         onSelectionChange([value]);
         setIsOpen(false);
         setQuery("");
         setFocusedIndex(-1);
         setIsFocused(false);
         inputRef.current?.blur();
      }
   };

   const handleRemove = (value: string, e?: React.MouseEvent) => {
      if (e) {
         e.stopPropagation();
         e.preventDefault();
      }
      onSelectionChange(selectedValues.filter((v) => v !== value));
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      setIsOpen(true);
      setFocusedIndex(-1);
   };

   const handleInputFocus = () => {
      setIsFocused(true);
      if (!multiple && selectedOption) {
         return;
      }
      if (showInitialOptions || query.length > 0) {
         setIsOpen(true);
      }
   };

   const handleInputBlur = () => {
      setTimeout(() => {
         if (!containerRef.current?.contains(document.activeElement)) {
            setIsFocused(false);
            setIsExpanded(false);
         }
      }, 200);
   };

   const handleContainerClick = () => {
      if (!disabled) {
         if (multiple) {
            setIsExpanded(true);
         }
         setIsFocused(true);
         inputRef.current?.focus();
         if (showInitialOptions) {
            setIsOpen(true);
         }
      }
   };

   const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && query === "" && selectedValues.length > 0) {
         if (multiple) {
            const lastValue = selectedValues[selectedValues.length - 1];
            if (lastValue) {
               handleRemove(lastValue);
            }
         } else {
            onSelectionChange([]);
         }
         return;
      }

      if (!isOpen) {
         if (e.key === "ArrowDown" && (showInitialOptions || query.length > 0)) {
            setIsOpen(true);
            e.preventDefault();
         }
         return;
      }

      switch (e.key) {
         case "ArrowDown":
            e.preventDefault();
            setFocusedIndex((prev) => {
               if (prev >= options.length - 1) {
                  return 0;
               }
               return prev + 1;
            });
            break;
         case "ArrowUp":
            e.preventDefault();
            setFocusedIndex((prev) => {
               if (prev <= 0) {
                  return options.length - 1;
               }
               return prev - 1;
            });
            break;
         case "Enter":
            e.preventDefault();
            if (focusedIndex >= 0 && focusedIndex < options.length) {
               const selectedOption = options[focusedIndex];
               if (selectedOption) {
                  handleSelect(selectedOption.value);
               }
            }
            break;
         case "Escape":
            setIsOpen(false);
            setFocusedIndex(-1);
            inputRef.current?.blur();
            break;
      }
   };

   const isMaxReached = Boolean(maxSelected && selectedValues.length >= maxSelected);

   const inputValue = useMemo(() => {
      if (!multiple && selectedOption && !isFocused) {
         return selectedOption.label;
      }
      return query;
   }, [multiple, selectedOption, isFocused, query]);

   const inputPlaceholder = useMemo(() => {
      if (!multiple && selectedOption) {
         return "";
      }
      if (multiple && selectedValues.length > 0) {
         return "";
      }
      return placeholder;
   }, [multiple, selectedOption, selectedValues.length, placeholder]);

   useEffect(() => {
      if (!isFocused) {
         setIsExpanded(false);
      }
   }, [isFocused]);

   return (
      <div ref={containerRef} className={cn("relative w-full", className, containerClassName)}>
         <div
            ref={inputWrapperRef}
            className={cn(
               "border-input bg-background ring-offset-background flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border px-3 py-2 text-sm",
               "focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-none",
               "disabled:cursor-not-allowed disabled:opacity-50",
               "cursor-text",
               inputWrapperClassName
            )}
            onClick={handleContainerClick}
         >
            {multiple && (
               <>
                  {selectedValues.map((value, index) => {
                     const option = selectedOptionsMap.get(value);
                     if (!option) return null;

                     if (maxVisibleChips && !isExpanded) {
                        if (index < maxVisibleChips) {
                           return (
                              <Badge
                                 key={value}
                                 variant="secondary"
                                 className={cn("flex h-6 items-center gap-1 px-2 text-xs", chipClassName)}
                              >
                                 {option.label}
                                 <button
                                    type="button"
                                    className={cn(
                                       "focus:ring-ring flex h-4 w-4 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-offset-2",
                                       chipRemoveButtonClassName
                                    )}
                                    onClick={(e) => handleRemove(value, e)}
                                    disabled={disabled}
                                 >
                                    <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                                 </button>
                              </Badge>
                           );
                        } else if (index === maxVisibleChips && selectedValues.length > maxVisibleChips) {
                           const remainingCount = selectedValues.length - maxVisibleChips;
                           return (
                              <Badge
                                 key="more-count"
                                 variant="outline"
                                 className={cn("flex h-6 items-center px-2 text-xs", chipClassName)}
                              >
                                 +{remainingCount}
                              </Badge>
                           );
                        } else {
                           return null;
                        }
                     }

                     return (
                        <Badge
                           key={value}
                           variant="secondary"
                           className={cn("flex h-6 items-center gap-1 px-2 text-xs", chipClassName)}
                        >
                           {option.label}
                           <button
                              type="button"
                              className={cn(
                                 "focus:ring-ring flex h-4 w-4 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-offset-2",
                                 chipRemoveButtonClassName
                              )}
                              onClick={(e) => handleRemove(value, e)}
                              disabled={disabled}
                           >
                              <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                           </button>
                        </Badge>
                     );
                  })}

                  <input
                     ref={inputRef}
                     type="text"
                     value={inputValue}
                     onChange={handleInputChange}
                     onFocus={handleInputFocus}
                     onBlur={handleInputBlur}
                     onKeyDown={handleKeyDown}
                     placeholder={inputPlaceholder}
                     disabled={disabled || isMaxReached}
                     className={cn(
                        "min-w-[4rem] flex-1 border-none bg-transparent p-0 outline-none focus:ring-0 focus:outline-none",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed",
                        inputClassName
                     )}
                  />
               </>
            )}

            {!multiple && (
               <div className="flex w-full items-center">
                  <input
                     ref={inputRef}
                     type="text"
                     value={inputValue}
                     onChange={handleInputChange}
                     onFocus={handleInputFocus}
                     onBlur={handleInputBlur}
                     onKeyDown={handleKeyDown}
                     placeholder={inputPlaceholder}
                     disabled={disabled}
                     className={cn(
                        "flex-1 border-none bg-transparent p-0 outline-none focus:ring-0 focus:outline-none",
                        "placeholder:text-muted-foreground",
                        "disabled:cursor-not-allowed",
                        inputClassName
                     )}
                  />

                  {selectedOption && (
                     <button
                        type="button"
                        className={cn(
                           "focus:ring-ring ml-2 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-offset-2",
                           chipRemoveButtonClassName
                        )}
                        onClick={(e) => {
                           e.stopPropagation();
                           onSelectionChange([]);
                        }}
                        disabled={disabled}
                     >
                        <X className="text-muted-foreground hover:text-foreground h-3 w-3" />
                     </button>
                  )}
               </div>
            )}
         </div>

         {isOpen && (
            <div
               ref={dropdownRef}
               className={cn(
                  "bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full rounded-md border shadow-md outline-none",
                  "max-h-60 overflow-auto",
                  menuClassName
               )}
            >
               {loading ? (
                  <div className={cn("text-muted-foreground px-3 py-2 text-sm", loadingClassName)}>Buscando...</div>
               ) : options.length === 0 ? (
                  <div className={cn("text-muted-foreground px-3 py-2 text-sm", emptyClassName)}>{emptyText}</div>
               ) : (
                  <div className="py-1">
                     {options.map((option, index) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                           <div
                              key={option.value}
                              ref={(el) => {
                                 optionRefs.current[index] = el;
                              }}
                              className={cn(
                                 "relative flex cursor-pointer items-center px-3 py-2 text-sm outline-none select-none",
                                 "hover:bg-accent hover:text-accent-foreground",
                                 index === focusedIndex && "bg-accent text-accent-foreground",
                                 isSelected && "bg-primary/10 text-primary font-medium",
                                 optionClassName,
                                 isSelected && selectedOptionClassName,
                                 index === focusedIndex && focusedOptionClassName
                              )}
                              onClick={() => handleSelect(option.value)}
                              onMouseEnter={() => setFocusedIndex(index)}
                           >
                              <Check className={cn("mr-2 h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                              {option.label}
                           </div>
                        );
                     })}
                  </div>
               )}
            </div>
         )}
      </div>
   );
};
