import type { Reminder } from '../types';

export const shouldShowReminder = (reminder: Reminder): boolean => {
  if (!reminder.date || !reminder.time) return false;

  const now = new Date();
  const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`);
  const timeDiff = reminderDateTime.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  // Show reminder at 24 hours and 30 minutes before
  return (
    (hoursDiff <= 24 && hoursDiff >= 23.9) || // 24-hour notification
    (hoursDiff <= 0.5 && hoursDiff >= 0.4)    // 30-minute notification
  );
};

export const isReminderDue = (reminder: Reminder): boolean => {
  if (!reminder.date) return false;

  const now = new Date();
  const reminderDate = new Date(reminder.date);
  
  if (reminder.time) {
    const [hours, minutes] = reminder.time.split(':').map(Number);
    reminderDate.setHours(hours, minutes);
  }

  return now >= reminderDate;
};

export const getReminderStatus = (reminder: Reminder): 'upcoming' | 'due' | 'past' => {
  const now = new Date();
  const reminderDateTime = new Date(`${reminder.date}T${reminder.time || '00:00:00'}`);

  if (now < reminderDateTime) return 'upcoming';
  if (now.toDateString() === reminderDateTime.toDateString()) return 'due';
  return 'past';
};