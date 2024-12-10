import React from 'react';
import { Clock, Calendar, Trash2 } from 'lucide-react';
import { useReminders } from '../hooks/useReminders';
import { format } from 'date-fns';

interface ReminderListProps {
  familyId: string;
}

export const ReminderList: React.FC<ReminderListProps> = ({ familyId }) => {
  const { reminders, loading, error, deleteReminder } = useReminders(familyId);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        {error}
      </div>
    );
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No reminders yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <div
          key={reminder.id}
          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-primary-200 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{reminder.title}</h3>
              {reminder.description && (
                <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {format(new Date(reminder.date), 'MMM d, yyyy')}
                </div>
                {reminder.time && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {format(new Date(`2000-01-01T${reminder.time}`), 'h:mm a')}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => deleteReminder(reminder.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Delete reminder"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}