import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserProfile();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) throw profileError;
      
      setUser(profile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Not authenticated');

      // Update auth email if provided
      if (updates.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: updates.email
        });
        if (emailError) throw emailError;
      }

      // Remove updated_at from updates object
      const { updated_at, ...profileUpdates } = updates;

      // Update profile data
      const { error: updateError } = await supabase
        .from('users')
        .update(profileUpdates)
        .eq('id', authUser.id);

      if (updateError) throw updateError;

      // Refresh profile data
      await fetchUserProfile();
      return true;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error updating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({ email, password }: { email: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({
    email,
    password,
    name,
    familyAction,
    familyName,
    joinCode,
  }: {
    email: string;
    password: string;
    name: string;
    familyAction: 'create' | 'join' | null;
    familyName?: string;
    joinCode?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (signUpError) throw signUpError;
      if (!authUser) throw new Error('Failed to create user');

      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email,
          name,
          avatar_url: null,
          streak_count: 0,
          notification_daily_reminder: true,
          notification_new_content: true,
          notification_streak_alert: true,
        }]);

      if (profileError) throw profileError;

      if (familyAction === 'create' && familyName) {
        const { data: family, error: familyError } = await supabase
          .from('families')
          .insert([{
            name: familyName,
            display_name: familyName,
            color: '#056aa0',
            join_code: Array.from({ length: 8 }, () => 
              'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
            ).join(''),
            slideshow_photo_limit: 30,
            slideshow_speed: 15,
          }])
          .select()
          .single();

        if (familyError) throw familyError;

        const { error: memberError } = await supabase
          .from('family_members')
          .insert([{
            family_id: family.id,
            user_id: authUser.id,
          }]);

        if (memberError) throw memberError;
      } else if (familyAction === 'join' && joinCode) {
        const { data: family, error: familyError } = await supabase
          .from('families')
          .select()
          .eq('join_code', joinCode)
          .single();

        if (familyError) throw new Error('Invalid family code');

        const { error: memberError } = await supabase
          .from('family_members')
          .insert([{
            family_id: family.id,
            user_id: authUser.id,
          }]);

        if (memberError) throw memberError;
      }
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePassword,
    refreshProfile: fetchUserProfile,
  };
}