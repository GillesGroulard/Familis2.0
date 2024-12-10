-- Update reactions table structure
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_reaction_type_check;
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS valid_emoji_type;

-- Add proper constraints
ALTER TABLE reactions ADD CONSTRAINT reactions_reaction_type_check 
  CHECK (reaction_type IN ('LIKE', 'COMMENT', 'SLIDESHOW'));

ALTER TABLE reactions ADD CONSTRAINT valid_emoji_type 
  CHECK (emoji_type IN ('LOVE', 'SMILE', 'HUG', 'PROUD'));

-- Add user relationship
ALTER TABLE reactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user ON reactions(user_id);

-- Add RLS policies
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for reactions
CREATE POLICY "Users can view reactions for posts in their families"
ON reactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM posts
        JOIN family_members ON family_members.family_id = posts.family_id
        WHERE posts.id = reactions.post_id
        AND family_members.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create reactions for posts in their families"
ON reactions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM posts
        JOIN family_members ON family_members.family_id = posts.family_id
        WHERE posts.id = reactions.post_id
        AND family_members.user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own reactions"
ON reactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
ON reactions FOR DELETE
USING (auth.uid() = user_id);