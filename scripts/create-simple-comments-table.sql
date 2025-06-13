-- Drop the old comments table if it exists
DROP TABLE IF EXISTS comments;

-- Create simplified comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_is_processed ON comments(is_processed);
