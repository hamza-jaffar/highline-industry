import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createServerClient } from '@/lib/supabase/server-client'

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
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      console.log('Callback: Auth exchange successful')
      console.log('Callback: User error:', userError)
      console.log('Callback: User found:', !!user)
      console.log('Callback: User ID:', user?.id)

      if (user) {
        // Check if user role exists, if not create it
        try {
          console.log('Setting user role for user:', user.id);
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/user-role`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              role: 'user',
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('User role set successfully:', data.message);
        } catch (apiError) {
          console.error("Failed to set user role during email verification:", apiError);
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
