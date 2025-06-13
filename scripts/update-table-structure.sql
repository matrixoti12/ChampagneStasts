-- Update the players table to use Spanish positions
DROP TABLE IF EXISTS players CASCADE;

CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL,
  photo TEXT,
  league_logo_url TEXT,
  team_logo_url TEXT,
  position VARCHAR(20) CHECK (position IN ('delantero', 'defensa', 'medio', 'portero', 'polivalente')),
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  mvp_count INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  card_style VARCHAR(20) CHECK (card_style IN ('glass', 'elite', 'fire', 'holographic', 'diamond', 'cosmic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_players_position ON players(position);
CREATE INDEX IF NOT EXISTS idx_players_goals ON players(goals DESC);
CREATE INDEX IF NOT EXISTS idx_players_assists ON players(assists DESC);
CREATE INDEX IF NOT EXISTS idx_players_mvp_count ON players(mvp_count DESC);
