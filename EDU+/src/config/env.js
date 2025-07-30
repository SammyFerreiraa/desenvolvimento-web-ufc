import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
   server: {
      DATABASE_URL: z.string().url(),
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

      AUTH_SECRET: z.string(),
      AWS_CLOUDWATCH_REGION: z.string(),
      AWS_CLOUDWATCH_ACCESS_KEY_ID: z.string(),
      AWS_CLOUDWATCH_SECRET_ACCESS_KEY: z.string(),
      AWS_CLOUDWATCH_LOG_GROUP_NAME: z.string(),

      //Google Auth
      AUTH_GOOGLE_ID: z.string(),
      AUTH_GOOGLE_SECRET: z.string(),

      //Email Auth
      EMAIL_HOST: z.string(),
      EMAIL_PORT: z.string().transform(Number),
      EMAIL_USER: z.string(),
      EMAIL_PASS: z.string(),
      EMAIL_FROM: z.string()
   },

   /**
    * Specify your client-side environment variables schema here. This way you can ensure the app
    * isn't built with invalid env vars. To expose them to the client, prefix them with
    * `NEXT_PUBLIC_`.
    */
   client: {
      NEXT_PUBLIC_API_URL: z.string()
   },

   /**
    * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
    * middlewares) or client-side so we need to destruct manually.
    */
   runtimeEnv: {
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      AUTH_SECRET: process.env.AUTH_SECRET,
      AWS_CLOUDWATCH_REGION: process.env.AWS_CLOUDWATCH_REGION,
      AWS_CLOUDWATCH_ACCESS_KEY_ID: process.env.AWS_CLOUDWATCH_ACCESS_KEY_ID,
      AWS_CLOUDWATCH_SECRET_ACCESS_KEY: process.env.AWS_CLOUDWATCH_SECRET_ACCESS_KEY,
      AWS_CLOUDWATCH_LOG_GROUP_NAME: process.env.AWS_CLOUDWATCH_LOG_GROUP_NAME,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

      //Google Auth
      AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
      AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,

      //Email Auth
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS,
      EMAIL_FROM: process.env.EMAIL_FROM
   },
   /**
    * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
    * useful for Docker builds.
    */
   skipValidation: !!process.env.SKIP_ENV_VALIDATION,
   /**
    * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
    * `SOME_VAR=''` will throw an error.
    */
   emptyStringAsUndefined: true
});
