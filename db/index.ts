import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as productCustomizationSchema from './schemas/product-customization.schema';
import * as factorySchema from './schemas/factory.schema';
import * as userRolesSchema from './schemas/user-roles.schema';
import * as affiliateSchema from './schemas/affiliate.schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in the environment variables.');
}

const schema = {
  ...productCustomizationSchema,
  ...factorySchema,
  ...userRolesSchema,
  ...affiliateSchema,
};

// Configure connection pool for better production performance
const pool = new Pool({
  connectionString,
  max: process.env.NODE_ENV === 'production' ? 20 : 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout
  ssl: {
    rejectUnauthorized: false // Required for some Supabase connections
  }
});

// Add error listener to catch connection issues
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const db = drizzle(pool, { schema });
