import React from 'react';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Reaction } from '../types';

interface ElderlyReactionsProps {
  reactions: Reaction[];
}

const EMOJI_LABELS = {
  'LOVE': '❤️',
  'SMILE': '😊',
  'HUG': '🤗',
  'PROUD': '👏'
} as const;

export const ElderlyReactions: React.FC<ElderlyReactionsProps> = ({ reactions }) => {
  if (!reactions || reactions.length === 0) return null;

  return (
    <div className="mt-4 bg-blue-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3 text-blue-800">
        <Heart className="w-5 h-5" />
        <h4 className="font-medium">Elder's Reactions</h4>
      </div>
      <div className="space-y-2">
        {reactions.map((reaction) => (
          <div 
            key={reaction.id}
            className="flex items-center gap-3 p-2 bg-white/50 rounded-lg"
          >
            <span className="text-2xl">
              {EMOJI_LABELS[reaction.emoji_type]}
            </span>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {reaction.user?.name}
                </span>
                <span className="text-xs text-blue-600">
                  {formatDistanceToNow(new Date(reaction.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}