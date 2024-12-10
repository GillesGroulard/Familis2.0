import { useState, useEffect } from 'react';
import { supabase, checkConnection } from '../lib/supabase';
import type { Post, NewPost } from '../types';

interface Family {
  id: string;
  name: string;
  display_name: string;
  color: string;
  join_code: string;
  family_picture: string | null;
}

export function usePosts(familyId: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (familyId) {
      fetchPosts(familyId);
      setupRealtimeSubscription();
    }
  }, [familyId]);

  const setupRealtimeSubscription = () => {
    if (!familyId) return;

    const channel = supabase
      .channel('posts_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts',
          filter: `family_id=eq.${familyId}`
        },
        () => {
          fetchPosts(familyId);
        }
      )
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'reactions',
        },
        () => {
          fetchPosts(familyId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchPosts = async (currentFamilyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, get family settings to know the photo limit
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('slideshow_photo_limit')
        .eq('id', currentFamilyId)
        .single();

      if (familyError) throw familyError;

      const photoLimit = familyData.slideshow_photo_limit || 30;

      // Get all posts for this family
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_families!inner (
            family_id
          ),
          reactions (
            id,
            user_id,
            reaction_type,
            emoji_type,
            comment,
            created_at,
            users (
              name,
              avatar_url
            )
          )
        `)
        .eq('post_families.family_id', currentFamilyId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Process posts and check if we need to remove any
      const processedPosts = data?.map((post) => {
        const reactions = post.reactions || [];
        const likes = reactions.filter((r) => r.reaction_type === 'LIKE');
        const comments = reactions.filter((r) => r.reaction_type === 'COMMENT');

        return {
          ...post,
          family_id: currentFamilyId,
          reactions,
          likes_count: likes.length,
          comments_count: comments.length,
          user_has_liked: likes.some((r) => r.user_id === user.id),
          elderly_reactions: reactions.filter((r) => r.reaction_type === 'SLIDESHOW')
        };
      }) || [];

      // Check if we need to remove old posts
      if (processedPosts.length > photoLimit) {
        // Get non-favorite posts
        const nonFavoritePosts = processedPosts
          .filter(post => !post.is_favorite)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        // Calculate how many posts need to be removed
        const postsToRemove = processedPosts.length - photoLimit;

        if (nonFavoritePosts.length >= postsToRemove) {
          // Remove oldest non-favorite posts
          const postsToDelete = nonFavoritePosts.slice(0, postsToRemove);
          
          // Delete posts from database
          for (const post of postsToDelete) {
            await supabase
              .from('posts')
              .delete()
              .eq('id', post.id);
          }

          // Update local state to exclude deleted posts
          const remainingPosts = processedPosts.filter(
            post => !postsToDelete.some(p => p.id === post.id)
          );
          setPosts(remainingPosts);
        } else {
          // If we can't remove enough posts due to favorites, just set all posts
          setPosts(processedPosts);
        }
      } else {
        setPosts(processedPosts);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (post: NewPost, familyIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('name, avatar_url, streak_count, last_post_date')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Calculate streak based on last post date
      const today = new Date().toISOString().split('T')[0];
      const lastPostDate = userProfile.last_post_date 
        ? new Date(userProfile.last_post_date).toISOString().split('T')[0]
        : null;
      
      let newStreakCount = 0;
      
      if (lastPostDate) {
        const daysSinceLastPost = Math.floor(
          (new Date(today).getTime() - new Date(lastPostDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastPost === 1) {
          newStreakCount = userProfile.streak_count + 1;
        } else if (daysSinceLastPost === 0) {
          newStreakCount = userProfile.streak_count;
        } else {
          newStreakCount = 1;
        }
      } else {
        newStreakCount = 1;
      }

      const { data: newPost, error: postError } = await supabase
        .from('posts')
        .insert([
          {
            username: userProfile.name,
            media_url: post.media_url,
            media_type: post.media_type,
            caption: post.caption,
            avatar_url: userProfile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100',
            user_id: user.id,
            streak_count: newStreakCount
          }
        ])
        .select()
        .single();

      if (postError) throw postError;

      const postFamilies = familyIds.map(familyId => ({
        post_id: newPost.id,
        family_id: familyId
      }));

      const { error: familyError } = await supabase
        .from('post_families')
        .insert(postFamilies);

      if (familyError) throw familyError;

      const { error: updateError } = await supabase
        .from('users')
        .update({
          streak_count: newStreakCount,
          last_post_date: today
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return newPost;
    } catch (err) {
      console.error('Error creating post:', err);
      throw new Error('Failed to create post');
    }
  };

  const toggleFavorite = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) throw new Error('Post not found');

      const { error } = await supabase
        .from('posts')
        .update({ is_favorite: !post.is_favorite })
        .eq('id', postId);

      if (error) throw error;

      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, is_favorite: !p.is_favorite }
            : p
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw new Error('Failed to update favorite status');
    }
  };

  return {
    posts,
    loading,
    error,
    createPost,
    refreshPosts: () => familyId && fetchPosts(familyId),
    toggleFavorite
  };
}