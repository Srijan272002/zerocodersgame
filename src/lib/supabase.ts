import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Game = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
};

export type GameAsset = {
  id: string;
  game_id: string;
  type: 'sprite' | 'background' | 'sound';
  url: string;
  created_at: string;
}; 