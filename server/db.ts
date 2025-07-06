import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Create a function that initializes database connections
export function createDatabaseConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });
  
  return { pool, db };
}

// Initialize connections when this module is imported (only if DATABASE_URL exists)
let pool: Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Check if we should use mock data
if (process.env.USE_MOCK_DATA !== "true" && process.env.DATABASE_URL) {
  try {
    const connections = createDatabaseConnection();
    pool = connections.pool;
    db = connections.db;
    console.log("Connected to PostgreSQL database");
  } catch (error) {
    console.log("Database connection failed, will use mock data");
  }
} else {
  console.log("Using mock data mode");
}

export { pool, db };