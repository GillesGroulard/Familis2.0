```typescript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Reminder } from '../types';

export function useReminderManager(familyId: string | null) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (familyId) {
      fetchReminders();
      setupRealtimeSubscription();
    }
  }, [familyId]);

  const setupRealtimeSubscription = () => {
    if (!familyId) return;

    const channel = supabase
      .channel('reminders_changes')
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
  };

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('family_id', familyId)
        .order('date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (reminder: Omit<Reminder, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .insert([reminder]);

      if (error) throw error;
      await fetchReminders();
      return true;
    } catch (err) {
      console.error('Error adding reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to add reminder');
      return false;
    }
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchReminders();
      return true;
    } catch (err) {
      console.error('Error updating reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to update reminder');
      return false;
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchReminders();
      return true;
    } catch (err) {
      console.error('Error deleting reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete reminder');
      return false;
    }
  };

  const getElderReminders = () => {
    return reminders.filter(reminder => reminder.target_audience === 'ELDER');
  };

  const getFamilyReminders = () => {
    return reminders.filter(reminder => reminder.target_audience === 'FAMILY');
  };

  return {
    reminders,
    loading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
    getElderReminders,
    getFamilyReminders,
    refreshReminders: fetchReminders
  };
}
```