import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in the environment variables.');
}

// Configure connection pool for better production performance
const pool = new Pool({
  connectionString,
  max: process.env.NODE_ENV === 'production' ? 10 : 5, // Limit connections in production
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool);
