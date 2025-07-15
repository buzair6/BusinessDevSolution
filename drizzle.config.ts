// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import *s dotenv from "dotenv";

// Load environment variables from your .env file
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found. Please ensure it is set in your .env file.");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Adding verbose logging to see detailed output
  verbose: true,
  strict: true,
});