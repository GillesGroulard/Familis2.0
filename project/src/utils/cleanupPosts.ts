import { supabase } from '../lib/supabase';

export const cleanupOldPosts = async () => {
  try {
    // Calculate date one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const cutoffDate = oneYearAgo.toISOString();

    // Delete posts older than one year
    const { error } = await supabase
      .from('posts')
      .delete()
      .lt('timestamp', cutoffDate);

    if (error) throw error;

    console.log('Successfully cleaned up old posts');
  } catch (err) {
    console.error('Error cleaning up old posts:', err);
  }
};