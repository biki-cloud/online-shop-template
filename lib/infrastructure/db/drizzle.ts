import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL environment variable is not set");
}

const connectionString = process.env.POSTGRES_URL;

const client = postgres(connectionString);
const db = drizzle(client, { schema });

export type Database = typeof db;
export { db };
