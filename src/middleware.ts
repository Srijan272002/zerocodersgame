import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  try {
    // Check if there's a authentication_bypass cookie (to break redirect loops)
    const authBypass = request.cookies.get('authentication_bypass');
    if (authBypass && authBypass.value === 'true') {
      console.log('Middleware: Authentication bypass active, allowing access');
      
      // Create a response that allows access
      const bypassResponse = NextResponse.next();
      
      // Clear the bypass cookie after using it once
      bypassResponse.cookies.set('authentication_bypass', '', { 
        expires: new Date(0),
        path: '/',
      });
      
      return bypassResponse;
    }

    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error in middleware:', error);
      return res; // Just continue instead of redirecting to avoid loops
    }
    
    // Always attach the session to the response for client side access
    const response = NextResponse.next();
    
    // Skip auth check for public routes, static files and auth callbacks
    if (
      request.nextUrl.pathname.startsWith('/auth/') ||
      request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/' ||
      request.nextUrl.pathname.startsWith('/_next/') ||
      request.nextUrl.pathname.includes('favicon.ico')
    ) {
      return response;
    }

    // Check for recent authentication flag from client
    const authSuccessCookie = request.cookies.get('auth_success');
    
    // Protected routes require authentication
    if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
      // If we recently had a successful auth, allow through once with bypass cookie
      if (authSuccessCookie && authSuccessCookie.value === 'true') {
        console.log('Middleware: Auth success cookie detected, setting bypass');
        const redirectUrl = new URL('/dashboard', request.url);
        const bypassResponse = NextResponse.redirect(redirectUrl);
        
        // Set a temporary bypass cookie that will allow the next request through
        bypassResponse.cookies.set('authentication_bypass', 'true', { 
          maxAge: 5, // Very short-lived (5 seconds)
          path: '/',
        });
        
        // Clear the auth success cookie
        bypassResponse.cookies.set('auth_success', '', {
          expires: new Date(0),
          path: '/',
        });
        
        return bypassResponse;
      }
      
      console.log('Middleware: No session, redirecting from protected route to login');
      const redirectUrl = new URL('/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // For authenticated users, let the client handle redirects from auth pages
    // to prevent potential redirect loops
    if (session && (request.nextUrl.pathname === '/login')) {
      console.log('Middleware: Session exists, user on login page');
      // Let client-side handle this redirect to avoid loops
      return response;
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return res; // Just continue instead of redirecting to avoid loops
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 