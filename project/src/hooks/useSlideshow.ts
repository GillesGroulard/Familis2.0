import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Post, Family, Reminder } from '../types';

export function useSlideshow(familyId: string | null) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [familySettings, setFamilySettings] = useState<Family | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1); // Start with agenda slide
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const [newPhotoAdded, setNewPhotoAdded] = useState(false);

  // Fetch family settings
  const fetchFamilySettings = useCallback(async () => {
    if (!familyId) return;
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();

      if (error) throw error;
      setFamilySettings(data);
    } catch (err) {
      console.error('Error fetching family settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    }
  }, [familyId]);

  // Fetch posts with family relationship
  const fetchPosts = useCallback(async () => {
    if (!familyId) return;
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_families!inner(family_id)
        `)
        .eq('post_families.family_id', familyId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Check if there are any new posts
      if (posts.length > 0 && data && data.length > posts.length) {
        setNewPhotoAdded(true);
        // Auto-hide new photo notification after 60 seconds
        setTimeout(() => setNewPhotoAdded(false), 60000);
      }

      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    }
  }, [familyId, posts.length]);

  // Fetch reminders for elderly
  const fetchReminders = useCallback(async () => {
    if (!familyId) return;
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('family_id', familyId)
        .eq('target_audience', 'ELDER')
        .order('date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reminders');
    }
  }, [familyId]);

  // Setup realtime subscriptions
  useEffect(() => {
    if (!familyId) return;

    const channel = supabase
      .channel('slideshow_changes')
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'posts',
          filter: `family_id=eq.${familyId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNewPhotoAdded(true);
            setTimeout(() => setNewPhotoAdded(false), 60000);
          }
          fetchPosts();
        }
      )
      .on('postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'reminders',
          filter: `family_id=eq.${familyId}`
        },
        () => {
          fetchReminders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, fetchPosts, fetchReminders]);

  // Initial data fetch
  useEffect(() => {
    if (familyId) {
      setLoading(true);
      Promise.all([
        fetchFamilySettings(),
        fetchPosts(),
        fetchReminders()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [familyId, fetchFamilySettings, fetchPosts, fetchReminders]);

  // Get filtered posts respecting family settings
  const getFilteredPosts = useCallback(() => {
    if (!familySettings || !posts.length) return [];

    const limit = familySettings.slideshow_photo_limit || 30;
    const favoritePosts = posts.filter(post => post.is_favorite);
    const nonFavoritePosts = posts.filter(post => !post.is_favorite);

    if (favoritePosts.length >= limit) {
      return favoritePosts.slice(0, limit);
    }

    const remainingSlots = limit - favoritePosts.length;
    return [...favoritePosts, ...nonFavoritePosts.slice(0, remainingSlots)];
  }, [posts, familySettings]);

  // Navigation functions
  const nextSlide = useCallback(() => {
    const filteredPosts = getFilteredPosts();
    const totalSlides = filteredPosts.length + 1; // +1 for agenda slide
    setCurrentIndex(prev => {
      const nextIndex = (prev + 1) % totalSlides;
      return nextIndex === totalSlides - 1 ? -1 : nextIndex;
    });
  }, [getFilteredPosts]);

  const previousSlide = useCallback(() => {
    const filteredPosts = getFilteredPosts();
    const totalSlides = filteredPosts.length + 1;
    setCurrentIndex(prev => {
      if (prev === -1) return totalSlides - 2;
      const newIndex = (prev - 1 + totalSlides) % totalSlides;
      return newIndex === totalSlides - 1 ? -1 : newIndex;
    });
  }, [getFilteredPosts]);

  return {
    posts: getFilteredPosts(),
    familySettings,
    reminders,
    loading,
    error,
    currentIndex,
    setCurrentIndex,
    nextSlide,
    previousSlide,
    autoplayEnabled,
    setAutoplayEnabled,
    newPhotoAdded,
    setNewPhotoAdded,
    refreshPosts: fetchPosts,
    refreshReminders: fetchReminders
  };
}