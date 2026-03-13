import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userRoles } from '@/db/schemas/user-roles.schema';

export async function getUserRole(userId: string) {
  try {
    console.log('getUserRole called with userId:', userId);
    console.log('Environment check:', {
      nodeEnv: process.env.NODE_ENV,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlLength: process.env.DATABASE_URL?.length
    });

    // Test database connection first
    await db.execute('SELECT 1');

    const result = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    console.log('Database query result:', result);

    const role = result[0]?.role || 'user';
    console.log('Returning role:', role);

    return role;

  } catch (error) {
    console.error('Error fetching user role:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any)?.code,
      userId,
      isProduction: process.env.NODE_ENV === 'production'
    });

    // In production, if database fails, return default role
    // This prevents users from being locked out
    if (process.env.NODE_ENV === 'production') {
      console.warn('Database error in production, returning default user role');
      return 'user';
    }

    // In development, still throw the error for debugging
    throw error;
  }
}
