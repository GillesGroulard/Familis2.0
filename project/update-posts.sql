-- First drop existing table
DROP TABLE IF EXISTS reactions;
DROP TABLE IF EXISTS post_families;
DROP TABLE IF EXISTS posts;

-- Recreate posts table with correct structure
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    username TEXT NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL,
    caption TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    streak_count INTEGER DEFAULT 0,
    CONSTRAINT posts_media_type_check CHECK (media_type IN ('image', 'video'))
);

-- Create reactions table
CREATE TABLE reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reaction_type TEXT NOT NULL CHECK (reaction_type IN ('LIKE', 'COMMENT')),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_posts_family ON posts(family_id);
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_timestamp ON posts(timestamp DESC);
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for users in same family" ON posts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM family_members
            WHERE family_members.family_id = posts.family_id
            AND family_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON posts
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for post owners" ON posts
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for post owners" ON posts
    FOR DELETE
    USING (auth.uid() = user_id);

-- Reaction policies
CREATE POLICY "Enable read access for users in same family" ON reactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM posts
            JOIN family_members ON family_members.family_id = posts.family_id
            WHERE posts.id = reactions.post_id
            AND family_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Enable insert for authenticated users" ON reactions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM posts
            JOIN family_members ON family_members.family_id = posts.family_id
            WHERE posts.id = reactions.post_id
            AND family_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Enable update for reaction owners" ON reactions
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for reaction owners" ON reactions
    FOR DELETE
    USING (auth.uid() = user_id);