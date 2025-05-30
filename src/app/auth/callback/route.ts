import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error_description = requestUrl.searchParams.get('error_description');
    const accessToken = requestUrl.searchParams.get('access_token');
    const refreshToken = requestUrl.searchParams.get('refresh_token');

    // Handle errors returned from OAuth provider
    if (error_description) {
      console.error('OAuth error:', error_description);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error_description)}`, request.url));
    }

    let isSuccess = false;

    // If we have a code, use the authorization code flow
    if (code) {
      console.log('Auth callback processing code');
      
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Auth callback error during code exchange:', error);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Authentication failed')}`, request.url));
      }
      
      isSuccess = true;
    }
    // If we have tokens directly in the URL (uncommon but possible)
    else if (accessToken) {
      console.log('Auth callback processing direct tokens');
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) {
          console.error('Auth callback error during token setting:', error);
          return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Token authentication failed')}`, request.url));
        }
        
        isSuccess = true;
      } catch (err) {
        console.error('Error setting session from tokens:', err);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Token processing failed')}`, request.url));
      }
    }
    // Handle missing authentication data
    else {
      console.log('No code or tokens in callback URL');
      return NextResponse.redirect(new URL('/login?error=missing_auth_data', request.url));
    }

    // Verify the session was created successfully
    if (isSuccess) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No session after authentication');
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Session creation failed')}`, request.url));
      }

      console.log('Auth successful, redirecting to dashboard');
      
      // Create response with redirect
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      
      // Set cookie with successful auth flag to help client-side handling
      response.cookies.set('auth_success', 'true', { 
        maxAge: 30, // Short-lived flag (30 seconds)
        path: '/',
        httpOnly: false, // Allow JavaScript access for client debugging
      });
      
      return response;
    }

    // Fallback error
    return NextResponse.redirect(new URL('/login?error=auth_process_failed', request.url));
  } catch (error) {
    console.error('Auth callback unexpected error:', error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Unexpected error')}`, request.url));
  }
} 