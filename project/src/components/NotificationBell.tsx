import React from 'react';
import { Bell } from 'lucide-react';
import { useReminderNotifications } from '../hooks/useReminderNotifications';

interface NotificationBellProps {
  familyId: string | null;
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ familyId, onClick }) => {
  const { hasNewReminders } = useReminderNotifications(familyId);

  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors"
      title="View Reminders"
    >
      <Bell className="w-6 h-6" />
      {hasNewReminders && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );
};