import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // First, run standard auth logic which generates a NextResponse
  const response = await updateSession(request);
  
  // Affiliate Referral Capture System
  const url = request.nextUrl;
  const pathname = url.pathname;
  const refParam = url.searchParams.get('ref');
  const storeHandle = pathname.startsWith('/store/') ? pathname.split('/')[2] : null;
  const ref = refParam || storeHandle;
  
  if (ref) {
    // If it was a ?ref= param, we want to redirect to a clean URL
    if (refParam) {
      const newUrl = new URL(url.pathname, request.url);
      url.searchParams.forEach((value, key) => {
        if (key !== 'ref') newUrl.searchParams.append(key, value);
      });

      const redirectResponse = NextResponse.redirect(newUrl);
      
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      
      redirectResponse.cookies.set('affiliate_ref', ref, { 
        path: '/', 
        maxAge: 30 * 24 * 60 * 60, 
        httpOnly: true,
        sameSite: 'lax',
      });
      
      return redirectResponse;
    }

    // If it's a /store/ route or we just want to set the cookie without redirecting
    response.cookies.set('affiliate_ref', ref, { 
      path: '/', 
      maxAge: 30 * 24 * 60 * 60, 
      httpOnly: true,
      sameSite: 'lax',
    });
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
