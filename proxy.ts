import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // First, run standard auth logic which generates a NextResponse
  const response = await updateSession(request);
  
  // Affiliate Referral Capture System
  const url = request.nextUrl;
  const ref = url.searchParams.get('ref');
  
  if (ref) {
    const newUrl = new URL(url.pathname, request.url);
    url.searchParams.forEach((value, key) => {
      if (key !== 'ref') newUrl.searchParams.append(key, value);
    });

    // Create a new redirect response representing the cleaned URL
    const redirectResponse = NextResponse.redirect(newUrl);
    
    // Merge any existing cookies setup by updateSession into this new redirect
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    
    // Finally, plant the affiliate tracker cookie
    redirectResponse.cookies.set('highline_affiliate_id', ref, { 
      path: '/', 
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      sameSite: 'lax',
    });
    
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
