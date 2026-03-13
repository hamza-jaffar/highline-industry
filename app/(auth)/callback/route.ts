import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createServerClient } from '@/lib/supabase/server-client'
import { db } from '@/db'
import { userRoles } from '@/db/schemas/user-roles.schema'
import { eq } from 'drizzle-orm'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check if user role exists, if not create it
        try {
          console.log('Checking user role for user:', user.id);
          const existingRole = await db
            .select()
            .from(userRoles)
            .where(eq(userRoles.userId, user.id))
            .limit(1)

          console.log('Existing role result:', existingRole);

          if (existingRole.length === 0) {
            console.log('Creating user role for user:', user.id);
            // Create default user role
            await db.insert(userRoles).values({
              userId: user.id,
              role: 'user', // Default role for all new signups
            });
            console.log('User role created successfully');
          } else {
            console.log('User role already exists');
          }
        } catch (dbError) {
          console.error("Failed to create user role during email verification:", dbError);
          // Continue with redirect even if role creation fails
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=Invalid+magic+link`)
}
