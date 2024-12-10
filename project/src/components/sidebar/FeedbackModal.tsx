import React from 'react';
import { X, MessageSquare } from 'lucide-react';

interface FeedbackModalProps {
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 bg-white rounded-full shadow-lg text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Share Your Feedback
          </h2>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">
            We value your input! Help us improve your experience by sharing your thoughts.
          </p>
          {/* Placeholder for Google Forms integration */}
          <button
            className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium 
              hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 
              transition-colors"
            onClick={() => {
              // TODO: Add Google Forms link
              console.log('Open feedback form');
            }}
          >
            Open Feedback Form
          </button>
        </div>
      </div>
    </div>
  );
};