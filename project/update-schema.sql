-- Add post_families table if it doesn't exist
CREATE TABLE IF NOT EXISTS post_families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, family_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_families_post ON post_families(post_id);
CREATE INDEX IF NOT EXISTS idx_post_families_family ON post_families(family_id);

-- Enable RLS
ALTER TABLE post_families ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view post_families"
ON post_families FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.family_id = post_families.family_id
        AND family_members.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create post_families"
ON post_families FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.family_id = family_id
        AND family_members.user_id = auth.uid()
    )
);

-- Add slideshow settings to families table if not exists
ALTER TABLE families 
ADD COLUMN IF NOT EXISTS slideshow_photo_limit INTEGER DEFAULT 30 CHECK (slideshow_photo_limit IN (10, 20, 30)),
ADD COLUMN IF NOT EXISTS slideshow_speed INTEGER DEFAULT 15 CHECK (slideshow_speed IN (10, 15, 30));