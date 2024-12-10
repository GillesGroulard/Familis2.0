import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, Clock, Plus, X, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { useReminders } from '../hooks/useReminders';
import { SharedSidebar } from '../components/SharedSidebar';
import { Toast } from '../components/Toast';
import { useNavigation } from '../hooks/useNavigation';
import { supabase } from '../lib/supabase';
import type { Reminder } from '../types';

interface AgendaScreenProps {
  familyId: string | null;
}

export const AgendaScreen: React.FC<AgendaScreenProps> = ({ familyId }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { getActiveReminders, acknowledgeReminder, assignReminder, deleteReminder } = useReminders(familyId || '');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { navigateToPhotos } = useNavigation();

  useEffect(() => {
    if (familyId) {
      fetchReminders();
    }
  }, [familyId]);

  const fetchReminders = async () => {
    try {
      const activeReminders = await getActiveReminders();
      setReminders(activeReminders || []);
    } catch (err) {
      console.error('Error fetching reminders:', err);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    setSelectedDay(null);
  };

  const handleFamilyChange = (id: string) => {
    window.location.hash = `family/${id}`;
  };

  const handleJoinFamily = () => {
    window.location.hash = 'join';
  };

  const handleTakeCharge = async (reminderId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      await assignReminder(reminderId, user.id);
      await fetchReminders();
      setSuccess("You've taken charge of this reminder!");
    } catch (err) {
      console.error('Error assigning reminder:', err);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    try {
      await deleteReminder(reminderId);
      await fetchReminders();
      setSuccess('Reminder has been removed');
    } catch (err) {
      console.error('Error deleting reminder:', err);
    }
  };

  const handleAddReminder = () => {
    navigateToPhotos();
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getRemindersByDate = (date: Date) => {
    return reminders.filter(reminder => {
      const reminderDate = parseISO(reminder.date);
      return isSameDay(reminderDate, date);
    });
  };

  if (!familyId) {
    return (
      <>
        <SharedSidebar
          currentFamilyId={familyId}
          onFamilyChange={handleFamilyChange}
          onJoinFamily={handleJoinFamily}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          currentPage="feed"
        />
        <div className="max-w-4xl mx-auto p-4">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Select a Family
            </h2>
            <p className="text-gray-600">
              Choose a family from the sidebar to view their agenda
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SharedSidebar
        currentFamilyId={familyId}
        onFamilyChange={handleFamilyChange}
        onJoinFamily={handleJoinFamily}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPage="feed"
      />
      
      <div className={`min-h-screen bg-gray-50 transition-all duration-300 ${!isCollapsed ? 'pl-24' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Family Reminders Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Family Reminders</h2>
                <button
                  onClick={handleAddReminder}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Reminder</span>
                </button>
              </div>

              {reminders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No active reminders
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="flex flex-col p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="flex items-center gap-2 text-primary-600 mb-2">
                        <CalendarIcon className="w-5 h-5" />
                        <span className="font-medium">
                          {format(parseISO(reminder.date), 'MMM d, yyyy')}
                        </span>
                      </div>
                      {reminder.time && (
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <Clock className="w-4 h-4" />
                          <span>
                            {format(parseISO(`2000-01-01T${reminder.time}`), 'h:mm a')}
                          </span>
                        </div>
                      )}
                      <p className="text-gray-700 flex-grow mb-4">
                        {reminder.description}
                      </p>
                      
                      {reminder.assigned_to ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={reminder.assigned_to.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100'}
                              alt={reminder.assigned_to.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <span className="text-sm text-gray-600">
                              {reminder.assigned_to.name} will do it
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove reminder"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleTakeCharge(reminder.id)}
                          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors font-medium"
                        >
                          <Check className="w-4 h-4" />
                          I'll do it
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-800">Calendar</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-lg font-medium text-gray-700 min-w-[140px] text-center">
                    {format(currentDate, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div
                    key={day}
                    className="bg-gray-50 text-center py-3 text-sm font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
                {days.map((day, idx) => {
                  const dayReminders = getRemindersByDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDay && isSameDay(day, selectedDay);
                  
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDay(isSelected ? null : day)}
                      className={`min-h-[140px] p-3 cursor-pointer transition-all duration-200 ${
                        isCurrentMonth
                          ? isSelected
                            ? 'bg-primary-50 ring-2 ring-primary-500'
                            : isToday
                              ? 'bg-blue-50 ring-1 ring-blue-200'
                              : 'bg-white hover:bg-gray-50'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-2 ${
                        isToday
                          ? 'text-blue-600'
                          : isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1.5">
                        {dayReminders.map((reminder) => (
                          <div
                            key={reminder.id}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              isSelected
                                ? 'bg-white shadow-md scale-105'
                                : 'bg-primary-50 border border-primary-100 hover:bg-primary-100'
                            }`}
                          >
                            {reminder.time && (
                              <div className="text-xs text-primary-700 font-medium mb-1">
                                {format(parseISO(`2000-01-01T${reminder.time}`), 'h:mm a')}
                              </div>
                            )}
                            <div className={`text-sm text-primary-800 ${
                              isSelected ? 'line-clamp-none' : 'line-clamp-2'
                            }`}>
                              {reminder.description}
                            </div>
                            {reminder.assigned_to && (
                              <div className="flex items-center gap-2 mt-2">
                                <img
                                  src={reminder.assigned_to.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100'}
                                  alt={reminder.assigned_to.name}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                                <span className="text-xs text-primary-600 font-medium">
                                  {reminder.assigned_to.name}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {success && (
          <Toast
            message={success}
            type="success"
            onClose={() => setSuccess(null)}
          />
        )}
      </div>
    </>
  );
};