'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    // Handle URL fragments (hash) for implicit OAuth flow
    const handleHashParams = async () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        setLocalLoading(true);
        try {
          console.log('Found hash params, attempting to process');
          
          // If we have a hash in the URL, we might have tokens from implicit OAuth flow
          const { data, error } = await supabase.auth.getSession();
          
          if (data?.session) {
            console.log('Session found from hash params, redirecting to dashboard');
            router.push('/dashboard');
            return;
          }
          
          // Try to set session from hash
          const hashUrl = window.location.hash.substring(1); // Remove the # character
          if (hashUrl.includes('access_token=')) {
            console.log('Found access_token in hash, attempting to set session');
            // Extract token data from hash
            const hashParams = new URLSearchParams(hashUrl);
            const accessToken = hashParams.get('access_token');
            
            if (accessToken) {
              // Attempt to set session with the token
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: hashParams.get('refresh_token') || '',
              });
              
              // Check if session was set successfully
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData?.session) {
                console.log('Successfully set session from hash tokens');
                router.push('/dashboard');
                return;
              }
            }
          }
        } catch (e) {
          console.error('Error processing hash params:', e);
          setError('Authentication failed');
        } finally {
          setLocalLoading(false);
        }
      }
    };

    // Check for error query parameter
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }

    // Process URL hash if present
    handleHashParams();

    // Check for authenticated user and redirect if needed
    if (user && !loading) {
      console.log('Login page: User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }

    // Check for auth_success cookie (set by callback route)
    const authSuccessCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_success='));
    
    if (authSuccessCookie) {
      console.log('Login page: Auth success cookie detected');
      // Clear the cookie by setting its expiry in the past
      document.cookie = 'auth_success=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      // Force refresh session
      window.location.href = '/dashboard';
    }
  }, [user, loading, router, searchParams]);

  const handleSignInWithGoogle = async () => {
    setError(null); // Clear any previous errors
    await signInWithGoogle();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to GameForge
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to start creating your games
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}

        <Button
          variant="outline"
          onClick={handleSignInWithGoogle}
          disabled={loading || localLoading}
          className="w-full"
        >
          {(loading || localLoading) ? (
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-current" />
          ) : (
            <>
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 