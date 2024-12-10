import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Post } from '../types';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('public:posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Change received!', payload);
          fetchPosts();
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel('public:reactions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        (payload) => {
          console.log('Reaction change received!', payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(reactionsChannel);
    };
  }, []);

  async function fetchPosts() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get user's family ID
      const { data: familyMember, error: familyError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (familyError) throw familyError;

      // Fetch posts with reactions count and user's like status
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          username,
          media_url,
          media_type,
          caption,
          avatar_url,
          timestamp,
          user_id,
          users!inner (
            streak_count
          ),
          reactions!left (
            id,
            user_id,
            reaction_type,
            comment,
            created_at,
            users!inner (
              name,
              avatar_url
            )
          )
        `)
        .eq('family_id', familyMember.family_id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      setPosts(
        data?.map((post) => {
          const reactions = post.reactions || [];
          const likes = reactions.filter((r) => r.reaction_type === 'LIKE');
          const comments = reactions.filter((r) => r.reaction_type === 'COMMENT');

          return {
            id: post.id,
            username: post.username,
            media_url: post.media_url,
            media_type: post.media_type,
            caption: post.caption,
            avatar_url: post.avatar_url,
            timestamp: post.timestamp,
            reactions: reactions,
            likes_count: likes.length,
            comments_count: comments.length,
            user_has_liked: likes.some((r) => r.user_id === user.id),
            streak_count: post.users.streak_count,
          };
        }) || []
      );
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return {
    posts,
    loading,
    error,
    refreshPosts: fetchPosts,
  };
}