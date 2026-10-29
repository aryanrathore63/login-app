import "dotenv/config";
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase / Neon require SSL; set DB_SSL=false for local Postgres.
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
});
