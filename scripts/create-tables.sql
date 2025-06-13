-- Create players table with new fields
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  team VARCHAR(255) NOT NULL,
  photo TEXT,
  league_logo_url TEXT,
  team_logo_url TEXT,
  position VARCHAR(20) CHECK (position IN ('field', 'goalkeeper')),
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  mvp_count INTEGER DEFAULT 0,
  rating INTEGER DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  card_style VARCHAR(20) CHECK (card_style IN ('glass', 'elite', 'fire', 'holographic', 'diamond', 'cosmic')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keep all other tables the same
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  voter_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name VARCHAR(255) NOT NULL UNIQUE,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS json_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  uploaded_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_votes_player_id ON votes(player_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);
CREATE INDEX IF NOT EXISTS idx_players_mvp_count ON players(mvp_count DESC);
CREATE INDEX IF NOT EXISTS idx_standings_points ON standings(points DESC);
