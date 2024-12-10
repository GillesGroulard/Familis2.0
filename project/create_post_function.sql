-- Create a function to handle post creation with family relationships
CREATE OR REPLACE FUNCTION create_post(
    p_username TEXT,
    p_media_url TEXT,
    p_media_type TEXT,
    p_caption TEXT,
    p_avatar_url TEXT,
    p_user_id UUID,
    p_streak_count INTEGER,
    p_family_ids UUID[]
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_post_id UUID;
    v_result JSONB;
    v_family_id UUID;
BEGIN
    -- Verify user has access to all families
    FOR v_family_id IN SELECT UNNEST(p_family_ids)
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM family_members
            WHERE family_id = v_family_id
            AND user_id = p_user_id
        ) THEN
            RAISE EXCEPTION 'User does not have access to family %', v_family_id;
        END IF;
    END LOOP;

    -- Insert the post
    INSERT INTO posts (
        username,
        media_url,
        media_type,
        caption,
        avatar_url,
        user_id,
        streak_count,
        timestamp
    ) VALUES (
        p_username,
        p_media_url,
        p_media_type,
        p_caption,
        p_avatar_url,
        p_user_id,
        p_streak_count,
        NOW()
    ) RETURNING id INTO v_post_id;

    -- Create family relationships
    INSERT INTO post_families (post_id, family_id)
    SELECT v_post_id, UNNEST(p_family_ids);

    -- Return the created post with family information
    SELECT jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'media_url', p.media_url,
        'media_type', p.media_type,
        'caption', p.caption,
        'timestamp', p.timestamp,
        'avatar_url', p.avatar_url,
        'user_id', p.user_id,
        'streak_count', p.streak_count,
        'families', (
            SELECT jsonb_agg(f.id)
            FROM post_families pf
            JOIN families f ON f.id = pf.family_id
            WHERE pf.post_id = p.id
        )
    ) INTO v_result
    FROM posts p
    WHERE p.id = v_post_id;

    RETURN v_result;
EXCEPTION
    WHEN OTHERS THEN
        -- Roll back any changes if an error occurs
        RAISE EXCEPTION 'Failed to create post: %', SQLERRM;
END;
$$;