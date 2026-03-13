import { NextResponse } from 'next/server'
import { db } from '@/db'
import { userRoles } from '@/db/schemas/user-roles.schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('Testing database connection...')
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('User ID provided:', userId)

    // Test basic connection
    const countResult = await db.$count(userRoles)
    console.log('User roles count:', countResult)

    let userRoleResult = null
    if (userId) {
      // Test specific user role lookup
      const result = await db
        .select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, userId))
        .limit(1)

      userRoleResult = result[0]?.role || 'not found'
      console.log('User role lookup result:', userRoleResult)
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        totalUserRoles: countResult,
        userRole: userRoleResult,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...'
        }
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL
      }
    }, { status: 500 })
  }
}