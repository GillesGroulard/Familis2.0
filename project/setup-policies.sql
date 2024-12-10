-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view posts" ON posts;
DROP POLICY IF EXISTS "Users can create posts" ON posts;
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
DROP POLICY IF EXISTS "Users can view post families" ON post_families;
DROP POLICY IF EXISTS "Users can create post families" ON post_families;

-- Posts policies
CREATE POLICY "Users can view posts"
ON posts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM post_families
        JOIN family_members ON family_members.family_id = post_families.family_id
        WHERE post_families.post_id = posts.id
        AND family_members.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
ON posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);

-- Post families policies
CREATE POLICY "Users can view post families"
ON post_families FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.family_id = post_families.family_id
        AND family_members.user_id = auth.uid()
    )
);

CREATE POLICY "Users can create post families"
ON post_families FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.family_id = family_id
        AND family_members.user_id = auth.uid()
    )
);