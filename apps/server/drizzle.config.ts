import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/drizzle.ts",
  dialect: "postgresql",
  dbCredentials: {
    password: "password",
    host: "localhost",
    port: 5432,
    user: "postgres",
    database: "app",
    ssl: false,
  },
});
