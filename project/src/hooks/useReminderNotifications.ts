import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Reminder } from '../types';

export function useReminderNotifications(familyId: string | null) {
  const [hasNewReminders, setHasNewReminders] = useState(false);
  const [lastCheckedTimestamp, setLastCheckedTimestamp] = useState<string>(
    localStorage.getItem('lastCheckedReminders') || new Date().toISOString()
  );

  useEffect(() => {
    if (!familyId) return;

    const checkNewReminders = async () => {
      try {
        const { data, error } = await supabase
          .from('reminders')
          .select('created_at')
          .eq('family_id', familyId)
          .gt('created_at', lastCheckedTimestamp)
          .limit(1);

        if (error) throw error;
        setHasNewReminders(data && data.length > 0);
      } catch (err) {
        console.error('Error checking new reminders:', err);
      }
    };

    checkNewReminders();

    const channel = supabase
      .channel('reminder_notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'reminders',
          filter: 'family_id=eq.' + familyId
        },
        () => {
          setHasNewReminders(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, lastCheckedTimestamp]);

  const markAsRead = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastCheckedReminders', now);
    setLastCheckedTimestamp(now);
    setHasNewReminders(false);
  };

  return {
    hasNewReminders,
    markAsRead
  };
}