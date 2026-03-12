import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./db/schemas/*.schema.ts",
    out: "./db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});