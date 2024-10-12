import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/drizzle.ts",
  dialect: "postgresql",
  dbCredentials: {
    password: "postgres",
    host: "localhost",
    port: 5435,
    user: "postgres",
    database: "postgres",
    ssl: false,
  },
});
