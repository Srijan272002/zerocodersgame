'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-lg border bg-card p-8">
          <h1 className="mb-4 text-2xl font-bold">Profile</h1>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1">{user.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Created</label>
              <p className="mt-1">
                {new Date(user.created_at!).toLocaleDateString()}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Sign In</label>
              <p className="mt-1">
                {new Date(user.last_sign_in_at!).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 