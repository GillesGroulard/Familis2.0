import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useReactions() {
  const [loading, setLoading] = useState(false);

  const toggleLike = async (postId: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user already liked the post
      const { data: existingLike, error: checkError } = await supabase
        .from('reactions')
        .select()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', 'LIKE')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('reactions')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('reactions')
          .insert([
            {
              post_id: postId,
              user_id: user.id,
              reaction_type: 'LIKE'
            }
          ]);

        if (insertError) throw insertError;
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (postId: string, comment: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase
        .from('reactions')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            reaction_type: 'COMMENT',
            comment
          }
        ]);

      if (insertError) throw insertError;
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addElderlyReaction = async (postId: string, emojiType: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First, delete any existing elderly reaction from this user on this post
      const { error: deleteError } = await supabase
        .from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', 'SLIDESHOW');

      if (deleteError) throw deleteError;

      // Add the new reaction
      const { error: insertError } = await supabase
        .from('reactions')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            reaction_type: 'SLIDESHOW',
            emoji_type: emojiType
          }
        ]);

      if (insertError) throw insertError;
    } catch (err) {
      console.error('Error adding elderly reaction:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentReaction = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('reactions')
        .select('emoji_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', 'SLIDESHOW')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.emoji_type || null;
    } catch (err) {
      console.error('Error getting current reaction:', err);
      return null;
    }
  };

  return {
    loading,
    toggleLike,
    addComment,
    addElderlyReaction,
    getCurrentReaction
  };
}