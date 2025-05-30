'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to get cookies
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [redirectBlocked, setRedirectBlocked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth, current pathname:', pathname);
        
        // Check for a redirect block cookie or recent auth handling
        const redirectBlock = getCookie('redirect_blocked');
        const authHandling = getCookie('auth_handling');
        
        if (redirectBlock === 'true' || authHandling === 'true') {
          console.log('Redirect blocked due to active auth handling');
          setRedirectBlocked(true);
          
          // Set a short timeout to clear this state
          setTimeout(() => setRedirectBlocked(false), 3000);
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          setUser(null);
          return;
        }

        setUser(session?.user ?? null);
        
        // Only redirect if:
        // 1. We're not in the auth callback
        // 2. Auth is initialized 
        // 3. We're not in a redirect block
        if (!pathname.startsWith('/auth/') && authInitialized && !redirectBlocked) {
          if (session?.user && (pathname === '/login')) {
            console.log('AuthContext: User logged in, on login page, redirecting to dashboard');
            
            // Set bypass cookie for middleware
            document.cookie = 'authentication_bypass=true;path=/;max-age=5';
            router.push('/dashboard');
          } else if (!session?.user && pathname.startsWith('/dashboard')) {
            console.log('AuthContext: No user, on protected page, redirecting to login');
            router.push('/login');
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        setUser(null);
      } finally {
        setLoading(false);
        if (!authInitialized) {
          setAuthInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Prevent redirects if we're handling auth or blocked
      if (getCookie('auth_handling') === 'true' || getCookie('redirect_blocked') === 'true') {
        console.log('Skipping redirect due to auth handling in progress');
        return;
      }
      
      // Only handle redirects if we're not in the auth callback
      if (!pathname.startsWith('/auth/')) {
        if (event === 'SIGNED_IN') {
          console.log('Auth event: SIGNED_IN, redirecting to dashboard');
          
          // Block further redirects temporarily
          document.cookie = 'redirect_blocked=true;path=/;max-age=5';
          
          // Set bypass cookie for middleware
          document.cookie = 'authentication_bypass=true;path=/;max-age=5';
          
          // Add a small delay to ensure session is properly set
          setTimeout(() => router.push('/dashboard'), 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('Auth event: SIGNED_OUT, redirecting to login');
          router.push('/login');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname, authInitialized, redirectBlocked]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('Initiating Google sign in');
      
      // Set a cookie to indicate we're handling authentication
      if (typeof document !== 'undefined') {
        document.cookie = 'auth_handling=true;path=/;max-age=10';
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            response_type: 'code', // Explicitly request authorization code flow
          },
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }

      // The user will be redirected to Google's OAuth page
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 