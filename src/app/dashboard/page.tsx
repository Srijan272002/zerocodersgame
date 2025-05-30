'use client';

import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

interface GameProject {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  status: 'completed' | 'generating' | 'failed';
  created_at: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [games, setGames] = useState<GameProject[]>([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        console.log('Dashboard: Initializing, checking session');
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session && window.location.hash) {
          console.log('Dashboard: No session but found hash, may contain tokens');
          document.cookie = `auth_handling=true;path=/;max-age=10`;
          window.location.href = `/login${window.location.hash}`;
          return;
        }

        if (session) {
          console.log('Dashboard: Session found, loading content');
          document.cookie = `authentication_bypass=true;path=/;max-age=5`;
          
          // TODO: Fetch user's games from Supabase
          // For now using mock data
          setGames([
            {
              id: '1',
              title: 'Cyber Platformer',
              description: 'A 2D cyberpunk platformer with AI bosses',
              thumbnail: '/placeholder.png',
              status: 'completed',
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              title: 'Space Adventure',
              description: 'Retro-style space exploration game',
              thumbnail: '/placeholder.png',
              status: 'generating',
              created_at: new Date().toISOString()
            }
          ]);
        }

        setLoadingDashboard(false);
      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setLoadingDashboard(false);
      }
    };

    if (!loading) {
      initializeDashboard();
    }
  }, [loading]);

  if (loading || loadingDashboard) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size={40} className="text-primary" />
        <span className="ml-4">Loading dashboard...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size={40} className="text-primary" />
        <span className="ml-4">Verifying authentication...</span>
      </div>
    );
  }

  const handleDeleteGame = async (gameId: string) => {
    // TODO: Implement game deletion
    console.log('Deleting game:', gameId);
  };

  const handleDuplicateGame = async (gameId: string) => {
    // TODO: Implement game duplication
    console.log('Duplicating game:', gameId);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Games</h1>
          <p className="text-muted-foreground">Welcome back, {user?.email}!</p>
        </div>
        <Link href="/create">
          <Button size="lg" className="gap-2">
            <span>Create New Game</span>
            <span>+</span>
          </Button>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{game.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-md mb-4">
                  {/* TODO: Add game preview/thumbnail */}
                </div>
                <p className="text-sm text-muted-foreground">{game.description}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Created: {new Date(game.created_at).toLocaleDateString()}
                </div>
                {game.status === 'generating' && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <LoadingSpinner size={16} />
                    <span>Generating...</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                {game.status === 'completed' && (
                  <>
                    <Link href={`/preview/${game.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">Preview</Button>
                    </Link>
                    <Link href={`/edit/${game.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">Edit</Button>
                    </Link>
                  </>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleDuplicateGame(game.id)}
                >
                  Duplicate
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleDeleteGame(game.id)}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
} 