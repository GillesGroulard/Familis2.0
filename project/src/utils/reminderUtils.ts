import { Reminder } from '../types';

export const redirectToAddReminder = () => {
  window.location.hash = 'photos';
  // Add a small delay to ensure the page loads before focusing the reminders section
  setTimeout(() => {
    const remindersSection = document.getElementById('reminders-section');
    if (remindersSection) {
      remindersSection.scrollIntoView({ behavior: 'smooth' });
      const reminderInput = document.querySelector('[name="reminder-description"]') as HTMLElement;
      if (reminderInput) {
        reminderInput.focus();
      }
    }
  }, 100);
};

export const filterRemindersByAudience = (
  reminders: Reminder[],
  audience: 'ELDER' | 'FAMILY'
): Reminder[] => {
  return reminders.filter(reminder => reminder.target_audience === audience);
};

export const sortRemindersByDate = (reminders: Reminder[]): Reminder[] => {
  return [...reminders].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const getWeeklyReminders = (reminders: Reminder[]): Reminder[] => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return reminders.filter(reminder => {
    const reminderDate = new Date(reminder.date);
    return reminderDate >= weekStart && reminderDate <= weekEnd;
  });
};