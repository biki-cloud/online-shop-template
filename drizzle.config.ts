import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/infrastructure/db/schema.ts",
  out: "./lib/infrastructure/db/migrations",
  driver: "pg",
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
  strict: true,
  verbose: true,
} satisfies Config;
