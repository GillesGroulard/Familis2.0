import React, { useState } from 'react';
import { Clock, Plus, Bell, Calendar, Loader2 } from 'lucide-react';
import { useReminders } from '../hooks/useReminders';
import type { Family } from '../types';

interface ReminderSectionProps {
  families: Family[];
  onSuccess?: () => void;
}

export const ReminderSection: React.FC<ReminderSectionProps> = ({ families, onSuccess }) => {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [targetAudiences, setTargetAudiences] = useState<Set<'ELDER' | 'FAMILY'>>(new Set());
  const [recurrenceType, setRecurrenceType] = useState<'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY'>('NONE');
  const [recurrenceDay, setRecurrenceDay] = useState<number | null>(null);
  const { createReminder, loading, error } = useReminders(selectedFamilyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamilyId || !description || !date || targetAudiences.size === 0) return;

    try {
      // Create a reminder for each selected audience
      const audiences = Array.from(targetAudiences);
      await Promise.all(audiences.map(audience => 
        createReminder({
          description,
          date,
          time: time || null,
          family_id: selectedFamilyId,
          target_audience: audience,
          recurrence_type: recurrenceType,
          recurrence_day: recurrenceDay
        })
      ));
      
      // Reset form
      setDescription('');
      setDate('');
      setTime('');
      setTargetAudiences(new Set());
      setRecurrenceType('NONE');
      setRecurrenceDay(null);
      
      onSuccess?.();
    } catch (err) {
      console.error('Error creating reminder:', err);
    }
  };

  const handleAudienceToggle = (audience: 'ELDER' | 'FAMILY') => {
    setTargetAudiences(prev => {
      const newSet = new Set(prev);
      if (newSet.has(audience)) {
        newSet.delete(audience);
      } else {
        newSet.add(audience);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
          <Clock className="w-5 h-5 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Add Reminder</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Family
          </label>
          <select
            value={selectedFamilyId}
            onChange={(e) => setSelectedFamilyId(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          >
            <option value="">Choose a family</option>
            {families.map((family) => (
              <option key={family.id} value={family.id}>
                {family.display_name || family.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
            required
            placeholder="Enter reminder description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time (optional)
            </label>
            <div className="relative">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Show Reminder To
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={targetAudiences.has('ELDER')}
                onChange={() => handleAudienceToggle('ELDER')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Elder (Slideshow)</span>
            </label>
            <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={targetAudiences.has('FAMILY')}
                onChange={() => handleAudienceToggle('FAMILY')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">Family (Feed)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recurrence
          </label>
          <select
            value={recurrenceType}
            onChange={(e) => {
              setRecurrenceType(e.target.value as 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY');
              setRecurrenceDay(null);
            }}
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="NONE">One-time reminder</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>

          {recurrenceType === 'MONTHLY' && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Day of Month
              </label>
              <select
                value={recurrenceDay || ''}
                onChange={(e) => setRecurrenceDay(parseInt(e.target.value))}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              >
                <option value="">Select day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !selectedFamilyId || !description || !date || targetAudiences.size === 0}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Add Reminder
            </>
          )}
        </button>
      </form>
    </div>
  );
};