import { NextResponse, NextRequest } from "next/server";
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { userRoles } from '@/db/schemas/user-roles.schema';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    await db.execute('SELECT 1');

    const result = await db
      .select({ role: userRoles.role })
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    const role = result[0]?.role || 'user';

    return NextResponse.json({ role });

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
      return NextResponse.json({ role: 'user' });
    }

    // In development, return error
    return NextResponse.json({ error: 'Failed to fetch user role' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, role } = body;

  if (!userId || !role) {
    return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
  }

  try {
    // Check if user role exists
    const existingRole = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, userId))
      .limit(1);

    if (existingRole.length === 0) {
      // Create new role
      await db.insert(userRoles).values({
        userId,
        role,
      });
      return NextResponse.json({ message: "User role created successfully" });
    } else {
      // Update existing role
      await db.update(userRoles)
        .set({ role })
        .where(eq(userRoles.userId, userId));
      return NextResponse.json({ message: "User role updated successfully" });
    }
  } catch (error) {
    console.error('Error setting user role:', error);
    return NextResponse.json({ error: 'Failed to set user role' }, { status: 500 });
  }
}
