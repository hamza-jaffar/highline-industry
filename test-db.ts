
import { db } from './db/index';
import { factory } from './db/schemas/factory.schema';
import { userRoles } from './db/schemas/user-roles.schema';

async function testConnection() {
  console.log('Testing database connection...');
  try {
    const factories = await db.select().from(factory).limit(1);
    console.log('Factory table connection successful. Count:', factories.length);
    
    const roles = await db.select().from(userRoles).limit(1);
    console.log('User roles table connection successful. Count:', roles.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

testConnection();
