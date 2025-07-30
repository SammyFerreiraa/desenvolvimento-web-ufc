import { format } from "date-fns";

export const formatter = {
   currency: (
      price: number | string | null | undefined,
      options?: {
         cents?: boolean;
         decimals?: number;
         disabledCurrency?: boolean;
      }
   ): string => {
      if (price == null || price === undefined) return "-";

      const isFormatted = typeof price === "string" && /^\s*R\$[\d.,\s]+$/.test(price);
      if (isFormatted) return price as string;

      if (typeof price === "string") {
         price = parseFloat(price.replace(/\./g, "").replace(/,/g, "."));
      }

      const decimalPlaces = options?.decimals ?? (options?.cents === false ? 0 : 2);
      const formatter = new Intl.NumberFormat("pt-BR", {
         ...(!options?.disabledCurrency && { style: "currency" }),
         currency: "BRL",
         minimumFractionDigits: decimalPlaces,
         maximumFractionDigits: decimalPlaces
      });

      return formatter.format(price);
   },
   currencyToNumber: (value: string | number | null | undefined) => {
      if (value == null || value == undefined) return 0;
      if (typeof value === "number") return value;
      const cleanedValue = value.replace(/[^0-9]/g, "");
      return parseFloat(cleanedValue) / 100;
   },
   phone: (value: string | number | null | undefined) => {
      if (value == null || value == undefined) return "";
      if (typeof value === "number") value = value.toString();
      value = value.replace(/\D/g, "");

      if (value.length > 10) {
         value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
      } else if (value.length > 6) {
         value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
      } else if (value.length > 2) {
         value = value.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
      } else {
         value = value.replace(/^(\d*)/, "($1");
      }

      return value;
   },
   dateToDDMMYYYY: (date: Date | null | string | undefined) => {
      if (!date) return "";
      return format(date, "dd/MM/yyyy");
   },
   dateToYYYYMMDD: (date: Date | null | string | undefined) => {
      if (!date) return "";
      return format(date, "yyyy-MM-dd");
   },
   document: (document: string) => {
      const digits = document.replace(/\D/g, "");

      if (digits.length === 11) {
         return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      } else if (digits.length === 14) {
         return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
      } else {
         return document;
      }
   },
   cep: (cep: string) => {
      return cep.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
   }
};

export const getDigitsFrom = (str: string) => str.match(/\d+/g)?.join("") ?? "";
