import React, { useCallback } from 'react';
import { Users } from 'lucide-react';
import type { Family } from '../../types';

interface FamilyBubbleProps {
  family: Family;
  isSelected: boolean;
  onSelect: (familyId: string) => void;
}

export const FamilyBubble: React.FC<FamilyBubbleProps> = ({
  family,
  isSelected,
  onSelect,
}) => {
  const handleClick = useCallback(() => {
    onSelect(family.id);
  }, [family.id, onSelect]);

  return (
    <button
      onClick={handleClick}
      className={`w-12 h-12 rounded-full relative group transition-all ${
        isSelected
          ? 'ring-2 ring-primary-500'
          : 'hover:ring-2 hover:ring-gray-300'
      }`}
      title={family.display_name || family.name}
    >
      {family.family_picture ? (
        <div className="w-full h-full rounded-full overflow-hidden">
          <img
            src={family.family_picture}
            alt={family.display_name || family.name}
            className={`w-full h-full object-cover transition-opacity ${
              isSelected
                ? 'opacity-100'
                : 'opacity-75 group-hover:opacity-100'
            }`}
          />
        </div>
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-primary-100'
              : 'bg-gray-100 group-hover:bg-gray-200'
          }`}
          style={{ backgroundColor: isSelected ? `${family.color}20` : undefined }}
        >
          <Users
            className="w-6 h-6"
            style={{ color: isSelected ? family.color : undefined }}
          />
        </div>
      )}
    </button>
  );
};