-- Update users table to use avatar_url
ALTER TABLE users DROP COLUMN IF EXISTS profile_image;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add default avatar URL for existing users
UPDATE users 
SET avatar_url = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100'
WHERE avatar_url IS NULL;

-- Add timestamp to posts if not exists
ALTER TABLE posts ALTER COLUMN timestamp SET DEFAULT CURRENT_TIMESTAMP;

-- Add emoji_type to reactions
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS emoji_type TEXT;
ALTER TABLE reactions ADD CONSTRAINT valid_emoji_type 
  CHECK (emoji_type IN ('LOVE', 'SMILE', 'HUG', 'PROUD'));

-- Add is_senior to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_senior BOOLEAN DEFAULT false;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_posts_timestamp ON posts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_posts_family_user ON posts(family_id, user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);

-- Update existing reactions to have valid emoji_type
UPDATE reactions 
SET emoji_type = 'LOVE' 
WHERE emoji_type IS NULL AND reaction_type = 'LIKE';