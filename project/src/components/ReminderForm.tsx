import React, { useState } from 'react';
import { Clock, Calendar, X, Loader2 } from 'lucide-react';
import { useReminders } from '../hooks/useReminders';

interface ReminderFormProps {
  familyId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ReminderForm: React.FC<ReminderFormProps> = ({ familyId, onSuccess, onCancel }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [targetAudience, setTargetAudience] = useState<'ELDER' | 'FAMILY'>('FAMILY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createReminder } = useReminders(familyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError('Please select a date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createReminder({
        description: title || 'Untitled Reminder', // Make description optional
        date,
        time: time || null,
        family_id: familyId,
        target_audience: targetAudience,
        recurrence_type: 'NONE',
        recurrence_day: null
      });

      onSuccess?.();
    } catch (err) {
      console.error('Error creating reminder:', err);
      setError(err instanceof Error ? err.message : 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onCancel}
        className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg text-gray-500 hover:text-gray-700"
      >
        <X className="w-5 h-5" />
      </button>

      <h3 className="text-lg font-semibold text-gray-800 mb-6">Add Reminder</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title (optional)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter reminder title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Show Reminder To
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="FAMILY"
                checked={targetAudience === 'FAMILY'}
                onChange={(e) => setTargetAudience(e.target.value as 'FAMILY')}
                className="mr-2"
              />
              Family Only
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="ELDER"
                checked={targetAudience === 'ELDER'}
                onChange={(e) => setTargetAudience(e.target.value as 'ELDER')}
                className="mr-2"
              />
              Elder & Family
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date*
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                className="w-full p-3 pl-10 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !date}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Reminder'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};