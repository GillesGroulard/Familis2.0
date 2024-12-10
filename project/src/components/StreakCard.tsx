import React from 'react';
import { Flame, Calendar } from 'lucide-react';

interface StreakCardProps {
  streak: number;
  lastPostDate: string | null;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak, lastPostDate }) => {
  const getStreakStatus = () => {
    if (!lastPostDate) return 'Start your streak by sharing your first photo!';
    
    const today = new Date().toISOString().split('T')[0];
    const lastPost = new Date(lastPostDate).toISOString().split('T')[0];
    const daysSinceLastPost = Math.floor(
      (new Date(today).getTime() - new Date(lastPost).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastPost === 0) return "You've posted today! 🎉";
    if (daysSinceLastPost === 1) return 'Post today to keep your streak alive!';
    return 'Post today to start a new streak!';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Sharing Streak</h3>
            <p className="text-sm text-gray-500">{getStreakStatus()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-orange-500">{streak}</span>
          <span className="text-sm text-gray-500">days</span>
        </div>
      </div>
      
      {lastPostDate && (
        <div className="flex items-center text-sm text-gray-500 mt-4">
          <Calendar className="w-4 h-4 mr-2" />
          <span>Last shared: {formatDate(lastPostDate)}</span>
        </div>
      )}

      <div className="mt-4 p-4 bg-orange-50 rounded-lg">
        <p className="text-sm text-orange-700">
          <strong>How streaks work:</strong> Share a photo every day to build your streak. 
          Miss a day and your streak resets. Multiple posts in one day count as a single day.
        </p>
      </div>
    </div>
  );
};