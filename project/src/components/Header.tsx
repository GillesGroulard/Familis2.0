import React from 'react';
import { Heart } from 'lucide-react';
import { useFamilies } from '../hooks/useFamilies';

interface HeaderProps {
  currentFamilyId: string | null;
}

export const Header: React.FC<HeaderProps> = ({ currentFamilyId }) => {
  const { families } = useFamilies();
  const currentFamily = families.find(f => f.id === currentFamilyId);

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center">
          <Heart className="w-6 h-6 text-primary-500" />
          <h1 className="ml-2 text-xl font-bold bg-gradient-to-r from-primary-500 to-primary-400 bg-clip-text text-transparent">
            Familis
          </h1>
        </div>
        {currentFamily && (
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              Family of {currentFamily.display_name || currentFamily.name}
            </h2>
          </div>
        )}
      </div>
    </div>
  );
}