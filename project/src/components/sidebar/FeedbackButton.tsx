import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface FeedbackButtonProps {
  onOpenFeedback: () => void;
}

export const FeedbackButton: React.FC<FeedbackButtonProps> = ({ onOpenFeedback }) => {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onOpenFeedback}
        className="w-12 h-12 rounded-full bg-primary-50 text-primary-600
          hover:bg-primary-100 flex items-center justify-center transition-all
          transform hover:scale-105"
        title="Give Feedback"
      >
        <HelpCircle className="w-6 h-6" />
      </button>
      <span className="text-xs text-gray-600 mt-1">Feedback</span>
    </div>
  );
};