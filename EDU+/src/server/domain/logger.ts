import { env } from "@/config/env";
import { asyncLocalStorage } from "../config/trpc";
import { cloudwatch } from "../external/cloud-watch/core";

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
      const userId = asyncLocalStorage.getStore()?.userId;
      if (env.NODE_ENV === "production") {
         await cloudwatch.sendLog({ title, data, level, uid: userId });
      }
      console.log(`[${new Date().toISOString()}] ${level.toUpperCase()}: ${title}`, { data });
   }
};
