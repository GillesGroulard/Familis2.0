import React from 'react';
import { X } from 'lucide-react';

const REACTIONS = [
  { emoji: '❤️', type: 'LOVE', label: 'Love' },
  { emoji: '😊', type: 'SMILE', label: 'Happy' },
  { emoji: '🤗', type: 'HUG', label: 'Hug' },
  { emoji: '👏', type: 'PROUD', label: 'Proud' }
] as const;

interface ReactionOverlayProps {
  onReact: (type: string) => void;
  onClose: () => void;
  currentReaction?: string | null;
}

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({
  onReact,
  onClose,
  currentReaction
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 animate-scale-up">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white w-10 h-10 rounded-full shadow-lg
            flex items-center justify-center text-gray-600 hover:text-gray-900
            transform transition-transform hover:scale-110 active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold text-center mb-8">
          How do you feel about this photo?
        </h2>

        <div className="grid grid-cols-2 gap-6">
          {REACTIONS.map(({ emoji, type, label }) => (
            <button
              key={type}
              onClick={() => onReact(type)}
              className={`flex flex-col items-center gap-4 p-6 rounded-2xl
                transition-all duration-300 transform hover:scale-105 active:scale-95
                ${currentReaction === type 
                  ? 'bg-primary-100 ring-2 ring-primary-500'
                  : 'bg-gray-50 hover:bg-primary-50'}`}
            >
              <span className="text-6xl filter drop-shadow-md">{emoji}</span>
              <span className={`text-xl font-medium ${
                currentReaction === type ? 'text-primary-900' : 'text-gray-900'
              }`}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};