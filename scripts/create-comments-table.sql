-- Create comments table for player stats reporting
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  player_name VARCHAR(255),
  goals INTEGER,
  assists INTEGER,
  saves INTEGER,
  team_name VARCHAR(255),
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_processed ON comments(is_processed);
CREATE INDEX IF NOT EXISTS idx_comments_player_name ON comments(player_name);
