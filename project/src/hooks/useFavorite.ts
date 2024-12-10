import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function useFavorite() {
  const [loading, setLoading] = useState(false);

  const toggleFavorite = async (postId: string, currentState: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_favorite: !currentState })
        .eq('id', postId);

      if (error) throw error;
      return !currentState;
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    toggleFavorite
  };
}