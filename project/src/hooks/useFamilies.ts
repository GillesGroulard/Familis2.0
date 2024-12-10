import { useState, useEffect } from 'react';
import { supabase, checkConnection } from '../lib/supabase';

interface Family {
  id: string;
  name: string;
  display_name: string;
  color: string;
  join_code: string;
  family_picture: string | null;
}

export function useFamilies() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      const connected = await checkConnection();
      setIsConnected(connected);
      if (connected) {
        fetchFamilies();
      } else {
        setError('Unable to connect to the server. Please check your internet connection.');
        setLoading(false);
      }
    };

    checkSupabaseConnection();
    setupRealtimeSubscription();
  }, []);

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('families_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'family_members' },
        () => {
          fetchFamilies();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to family changes');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchFamilies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('family_members')
        .select(`
          families (
            id,
            name,
            display_name,
            color,
            join_code,
            family_picture
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching families:', error);
        setError(error.message);
        return;
      }

      if (!data) {
        setFamilies([]);
        return;
      }

      const processedFamilies = data.map(item => ({
        ...item.families,
        display_name: item.families.display_name || item.families.name,
        color: item.families.color || '#056aa0',
        family_picture: item.families.family_picture || null
      }));

      setFamilies(processedFamilies);
      setError(null);
    } catch (err) {
      console.error('Error fetching families:', err);
      setError('Failed to load families. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retryConnection = async () => {
    setLoading(true);
    setError(null);
    const connected = await checkConnection();
    setIsConnected(connected);
    if (connected) {
      await fetchFamilies();
    } else {
      setError('Still unable to connect. Please check your internet connection.');
    }
    setLoading(false);
  };

  return {
    families,
    loading,
    error,
    isConnected,
    refreshFamilies: fetchFamilies,
    retryConnection
  };
}