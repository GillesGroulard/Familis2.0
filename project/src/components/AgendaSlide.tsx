import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Reminder } from '../types';

interface AgendaSlideProps {
  reminders: Reminder[];
}

export const AgendaSlide: React.FC<AgendaSlideProps> = ({ reminders }) => {
  const [now, setNow] = useState(new Date());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const weeklyReminders = reminders
    .filter(reminder => {
      const reminderDate = new Date(reminder.date);
      return (
        reminder.target_audience === 'ELDER' &&
        reminderDate >= weekStart && 
        reminderDate <= weekEnd
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-blue-50 via-blue-100 to-white text-gray-800 p-8 md:p-12">
      {/* Current Date and Time */}
      <div className="text-center mb-8 md:mb-12 animate-fade-in">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 max-w-2xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            {format(now, 'EEEE')}
          </h1>
          <h2 className="text-3xl md:text-4xl text-blue-800 mb-4">
            {format(now, 'MMMM d, yyyy')}
          </h2>
          <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl text-blue-600">
            <Clock className="w-6 h-6 md:w-8 md:h-8" />
            <span>{format(now, 'h:mm a')}</span>
          </div>
        </div>
      </div>

      {/* Weekly Reminders */}
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 h-full">
          <div className="flex items-center gap-3 mb-6 md:mb-8 animate-fade-in">
            <Calendar className="w-8 h-8 md:w-10 md:h-10 text-blue-600" />
            <h2 className="text-2xl md:text-3xl font-semibold text-blue-800">
              This Week's Schedule
            </h2>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-400px)] pr-4 -mr-4">
            {weeklyReminders.length > 0 ? (
              <div className="space-y-4 md:space-y-6 animate-fade-in">
                {weeklyReminders.map((reminder, index) => (
                  <div
                    key={reminder.id}
                    className="bg-white rounded-xl p-4 md:p-6 transition-all hover:bg-blue-50 shadow-md border border-blue-100"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 md:mb-3">
                      <span className="text-xl md:text-2xl font-medium text-blue-800">
                        {format(new Date(reminder.date), 'EEEE, MMMM d')}
                      </span>
                      {reminder.time && (
                        <span className="text-lg md:text-xl text-blue-600 font-medium">
                          {format(new Date(`2000-01-01T${reminder.time}`), 'h:mm a')}
                        </span>
                      )}
                    </div>
                    <p className="text-lg md:text-xl text-blue-700 font-medium">
                      {reminder.description}
                    </p>
                    {reminder.recurrence_type !== 'NONE' && (
                      <div className="mt-2 text-sm text-blue-500 font-medium">
                        {reminder.recurrence_type === 'DAILY' && '🔄 Repeats daily'}
                        {reminder.recurrence_type === 'WEEKLY' && '🔄 Repeats weekly'}
                        {reminder.recurrence_type === 'MONTHLY' && `🔄 Repeats monthly on day ${reminder.recurrence_day}`}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 md:py-12 animate-fade-in">
                <div className="text-xl md:text-2xl text-blue-600 mb-4">
                  No scheduled reminders for this week
                </div>
                <p className="text-lg text-blue-500">
                  Enjoy your peaceful week ahead! 😊
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};