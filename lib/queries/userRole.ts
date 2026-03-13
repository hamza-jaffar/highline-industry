import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userRoles } from '@/db/schemas/user-roles.schema';

export async function getUserRole(userId: string) {
  try {
    const [roleRecord] = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

      console.log("ROLE:", roleRecord.role);

    return roleRecord?.role || 'user';

  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'user';
  }
}
