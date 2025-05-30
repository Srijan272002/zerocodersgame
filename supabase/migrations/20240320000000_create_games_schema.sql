-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for status and asset types
CREATE TYPE game_status AS ENUM ('draft', 'generating', 'completed', 'failed');
CREATE TYPE asset_type AS ENUM ('sprite', 'background', 'sound', 'tilemap');
CREATE TYPE game_engine AS ENUM ('unity', 'godot');

-- Create games table
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    engine game_engine NOT NULL DEFAULT 'unity',
    status game_status NOT NULL DEFAULT 'draft',
    prompt TEXT, -- Original user prompt/description
    metadata JSONB, -- Flexible storage for additional game settings
    thumbnail_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create game_assets table
CREATE TABLE game_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    type asset_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    metadata JSONB, -- Store additional asset info (dimensions, duration, etc.)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create game_scenes table
CREATE TABLE game_scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    scene_order INTEGER NOT NULL,
    metadata JSONB, -- Store scene-specific settings
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create game_code table for storing generated code
CREATE TABLE game_code (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    code_content TEXT NOT NULL,
    language VARCHAR(50) NOT NULL, -- e.g., 'csharp', 'gdscript'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_game_assets_game_id ON game_assets(game_id);
CREATE INDEX idx_game_scenes_game_id ON game_scenes(game_id);
CREATE INDEX idx_game_code_game_id ON game_code(game_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_games_updated_at
    BEFORE UPDATE ON games
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_assets_updated_at
    BEFORE UPDATE ON game_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_scenes_updated_at
    BEFORE UPDATE ON game_scenes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_code_updated_at
    BEFORE UPDATE ON game_code
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_code ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Users can view their own games"
    ON games FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own games"
    ON games FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
    ON games FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
    ON games FOR DELETE
    USING (auth.uid() = user_id);

-- Game assets policies
CREATE POLICY "Users can view their games' assets"
    ON game_assets FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_assets.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can create assets for their games"
    ON game_assets FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_assets.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their games' assets"
    ON game_assets FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_assets.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their games' assets"
    ON game_assets FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_assets.game_id
        AND games.user_id = auth.uid()
    ));

-- Similar policies for game_scenes
CREATE POLICY "Users can view their games' scenes"
    ON game_scenes FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_scenes.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can create scenes for their games"
    ON game_scenes FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_scenes.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their games' scenes"
    ON game_scenes FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_scenes.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their games' scenes"
    ON game_scenes FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_scenes.game_id
        AND games.user_id = auth.uid()
    ));

-- Similar policies for game_code
CREATE POLICY "Users can view their games' code"
    ON game_code FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_code.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can create code for their games"
    ON game_code FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_code.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their games' code"
    ON game_code FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_code.game_id
        AND games.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their games' code"
    ON game_code FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM games
        WHERE games.id = game_code.game_id
        AND games.user_id = auth.uid()
    )); 