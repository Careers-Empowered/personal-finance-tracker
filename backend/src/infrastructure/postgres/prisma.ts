import dotenv from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

dotenv.config({
  path: path.resolve(__dirname, "../../../../database/.env"),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not configured. Ensure the shared database/.env file exists and contains a valid connection string.",
  );
}

export const prisma = new PrismaClient();