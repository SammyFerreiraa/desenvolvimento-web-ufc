import { env } from "@/config/env";
import { asyncLocalStorage } from "../config/trpc";

export const logger = {
   info: async (title: string, data?: unknown) => {
      await logger.custom({ level: "INFO", title, data });
   },
   warn: async (title: string, data?: unknown) => {
      await logger.custom({ level: "WARN", title, data });
   },
   error: async (title: string, data?: unknown) => {
      await logger.custom({ level: "ERROR", title, data });
   },
   debug: async (title: string, data?: unknown) => {
      if (process.env.NODE_ENV === "development") {
         await logger.custom({ level: "DEBUG", title, data });
      }
   },
   custom: async ({ level, title, data }: { level: string; title: string; data?: unknown }) => {
      console.log(`[${new Date().toISOString()}] ${level.toUpperCase()}: ${title}`, { data });
   }
};
