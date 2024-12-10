import React from 'react';
import { Users, Home, PlaySquare } from 'lucide-react';

interface QuickActionsProps {
  currentPage: 'feed' | 'join';
  onFeedClick: (e: React.MouseEvent) => void;
  onFamilyClick: (e: React.MouseEvent) => void;
  onSlideshowClick: (e: React.MouseEvent) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  currentPage,
  onFeedClick,
  onFamilyClick,
  onSlideshowClick,
}) => {
  return (
    <div className="flex flex-col items-center gap-3 animate-fade-in">
      {currentPage === 'feed' ? (
        <div className="flex flex-col items-center">
          <button
            onClick={onFamilyClick}
            className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 
              hover:bg-primary-200 flex items-center justify-center transition-all
              transform hover:scale-110"
            title="Family Settings"
          >
            <Users className="w-5 h-5" />
          </button>
          <span className="text-xs text-gray-600 mt-1">Family</span>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <button
            onClick={onFeedClick}
            className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 
              hover:bg-primary-200 flex items-center justify-center transition-all
              transform hover:scale-110"
            title="Back to Feed"
          >
            <Home className="w-5 h-5" />
          </button>
          <span className="text-xs text-gray-600 mt-1">Feed</span>
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <button
          onClick={onSlideshowClick}
          className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 
            hover:bg-primary-200 flex items-center justify-center transition-all
            transform hover:scale-110"
          title="Start Slideshow"
        >
          <PlaySquare className="w-5 h-5" />
        </button>
        <span className="text-xs text-gray-600 mt-1">Slideshow</span>
      </div>

      <div className="w-8 border-t border-gray-200 my-2"></div>
    </div>
  );
};