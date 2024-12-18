import { type Config, defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not defined");
if (!process.env.APP_NAME) throw new Error("APP_NAME is not defined");

export default defineConfig({
  dialect: "postgresql", // 'mysql' | 'sqlite' | 'turso'
  schema: ["./src/db/schema/index.ts", "./src/db/views/index.ts"],
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  tablesFilter: [process.env.APP_NAME + "_*"],
  verbose: true,
}) satisfies Config;
