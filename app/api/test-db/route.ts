import { NextResponse } from 'next/server'
import { db } from '@/db'
import { userRoles } from '@/db/schemas/user-roles.schema'

export async function GET() {
  try {
    // Test database connection by counting user roles
    const result = await db.select().from(userRoles).limit(1)
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: result
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}