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

export type GameEngine = 'unity' | 'godot';
export type GameStatus = 'draft' | 'generating' | 'completed' | 'failed';
export type AssetType = 'sprite' | 'background' | 'sound' | 'tilemap';

export type Game = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  engine: GameEngine;
  status: GameStatus;
  prompt: string | null;
  metadata: Record<string, any> | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type GameAsset = {
  id: string;
  game_id: string;
  type: AssetType;
  name: string;
  url: string;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export type GameScene = {
  id: string;
  game_id: string;
  name: string;
  description: string | null;
  scene_order: number;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
};

export type GameCode = {
  id: string;
  game_id: string;
  filename: string;
  code_content: string;
  language: string;
  created_at: string;
  updated_at: string;
}; 