import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getUserRole } from '../queries/userRole';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
  })

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  
  if (user && isAuthRoute) {
    try {
      const role = await getUserRole(user.id);
      console.log('User role from middleware (auth route):', role);
      const url = request.nextUrl.clone();
      url.pathname = `/dashboard/${role}`;
      return NextResponse.redirect(url);
    } catch (error) {
      console.error('Error getting user role in middleware:', error);
      // Default to user role if there's an error
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard/user';
      return NextResponse.redirect(url);
    }
  }

  if (!user && isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && isDashboardRoute) {
    try {
      const role = await getUserRole(user.id);
      console.log('User role from middleware (dashboard route):', role);
      const allowedPrefix = `/dashboard/${role}`;
      
      if (!pathname.startsWith(allowedPrefix)) {
          const url = request.nextUrl.clone();
          url.pathname = allowedPrefix;
          return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error getting user role in middleware for dashboard:', error);
      // If there's an error getting the role, redirect to user dashboard as fallback
      if (!pathname.startsWith('/dashboard/user')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard/user';
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse
}
