import React, { useState, useEffect } from 'react';
import { Clock, Bell } from 'lucide-react';
import type { Reminder } from '../types';

interface ReminderAnimationProps {
  reminder: Reminder;
  onAcknowledge: () => void;
}

export const ReminderAnimation: React.FC<ReminderAnimationProps> = ({
  reminder,
  onAcknowledge,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 1 minute
    const timeout = setTimeout(() => {
      handleClose();
    }, 60000);

    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    if (!isClosing) { // Prevent double-closing
      setIsClosing(true);
      setTimeout(() => {
        setIsVisible(false);
        onAcknowledge();
      }, 800);
    }
  };

  const formattedTime = reminder.time
    ? new Date(`2000-01-01T${reminder.time}`).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  const getRecurrenceText = () => {
    switch (reminder.recurrence_type) {
      case 'DAILY':
        return 'Daily reminder';
      case 'WEEKLY':
        return `Repeats every ${new Date(reminder.date).toLocaleDateString('en-US', { weekday: 'long' })}`;
      case 'MONTHLY':
        return `Repeats monthly on day ${reminder.recurrence_day}`;
      default:
        return null;
    }
  };

  return isVisible ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div 
        className={`transform ${isClosing ? 'animate-bounce-out' : 'animate-bounce-in'}`}
      >
        <button
          onClick={handleClose}
          className="bg-primary-500 text-white p-8 rounded-2xl shadow-lg
            transform transition-transform hover:scale-110
            flex flex-col items-center gap-4
            animate-float"
        >
          {reminder.target_audience === 'ELDER' ? (
            <Clock className="w-16 h-16" />
          ) : (
            <Bell className="w-16 h-16" />
          )}
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">{reminder.description}</div>
            {formattedTime && (
              <div className="text-lg mb-2">Time: {formattedTime}</div>
            )}
            {getRecurrenceText() && (
              <div className="text-sm opacity-75">{getRecurrenceText()}</div>
            )}
          </div>
        </button>
      </div>
    </div>
  ) : null;
};