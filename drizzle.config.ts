import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // zmeň ak nepoužívaš Postgres
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
