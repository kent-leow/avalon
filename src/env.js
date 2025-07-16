import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    
    // Security environment variables
    JWT_SECRET: z.string().min(1),
    ENCRYPTION_KEY: z.string().min(1),
    ENCRYPTION_PASSWORD: z.string().min(1),
    ENCRYPTION_SALT: z.string().min(1),
    
    // Security settings
    RATE_LIMIT_REQUESTS: z.string().transform(Number).default("100"),
    RATE_LIMIT_WINDOW: z.string().transform(Number).default("60000"),
    SESSION_TIMEOUT: z.string().transform(Number).default("86400"),
    ENABLE_ENCRYPTION: z.string().transform(Boolean).default("true"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    
    // Security environment variables
    JWT_SECRET: process.env.JWT_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    ENCRYPTION_PASSWORD: process.env.ENCRYPTION_PASSWORD,
    ENCRYPTION_SALT: process.env.ENCRYPTION_SALT,
    
    // Security settings
    RATE_LIMIT_REQUESTS: process.env.RATE_LIMIT_REQUESTS,
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
    SESSION_TIMEOUT: process.env.SESSION_TIMEOUT,
    ENABLE_ENCRYPTION: process.env.ENABLE_ENCRYPTION,
    
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
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
  emptyStringAsUndefined: true,
});
