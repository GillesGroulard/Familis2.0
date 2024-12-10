import React, { useState } from 'react';
import { Users, Plus, ChevronLeft, ChevronRight, CreditCard, PlaySquare } from 'lucide-react';
import { useFamilies } from '../hooks/useFamilies';
import { SubscriptionModal } from './SubscriptionModal';

interface FamilySidebarProps {
  currentFamilyId: string | null;
  onFamilyChange: (familyId: string) => void;
  onJoinFamily: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const FamilySidebar: React.FC<FamilySidebarProps> = ({
  currentFamilyId,
  onFamilyChange,
  onJoinFamily,
  isCollapsed,
  onToggleCollapse
}) => {
  const { families, loading, error } = useFamilies();
  const [showSubscription, setShowSubscription] = useState(false);

  if (loading) {
    return (
      <div className={`fixed left-0 top-16 bottom-20 bg-white border-r border-gray-200 
        flex flex-col items-center py-4 transition-transform duration-300 z-10
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} w-16`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`fixed left-0 top-16 bottom-20 bg-white border-r border-gray-200 
        flex flex-col items-center py-4 transition-transform duration-300 z-10
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} w-16`}>
        <div className="text-red-500 text-xs text-center px-2">Error loading families</div>
      </div>
    );
  }

  const totalCost = families.length * 10;

  const handleSlideshowClick = () => {
    if (currentFamilyId) {
      window.location.hash = 'slideshow';
    }
  };

  return (
    <>
      <div className={`fixed left-0 top-16 bottom-20 bg-white border-r border-gray-200 
        flex flex-col items-center py-4 transition-transform duration-300 z-10
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} w-16`}>
        <div className="flex flex-col items-center gap-4 flex-1">
          {/* Family Bubbles */}
          <div className="flex flex-col items-center gap-4">
            {families.map((family) => (
              <div key={family.id} className="flex flex-col items-center gap-3">
                <button
                  onClick={() => onFamilyChange(family.id)}
                  className={`w-12 h-12 rounded-full relative group transition-all ${
                    currentFamilyId === family.id
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
                          currentFamilyId === family.id
                            ? 'opacity-100'
                            : 'opacity-75 group-hover:opacity-100'
                        }`}
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-full h-full rounded-full flex items-center justify-center transition-colors ${
                        currentFamilyId === family.id
                          ? 'bg-primary-100'
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}
                      style={{ backgroundColor: currentFamilyId === family.id ? `${family.color}20` : undefined }}
                    >
                      <Users
                        className="w-6 h-6"
                        style={{ color: currentFamilyId === family.id ? family.color : undefined }}
                      />
                    </div>
                  )}
                  {currentFamilyId === family.id && (
                    <div
                      className="absolute inset-0 rounded-full ring-2 transition-colors"
                      style={{ borderColor: family.color }}
                    />
                  )}
                </button>

                {/* Quick Action Buttons - Only show for selected family */}
                {currentFamilyId === family.id && (
                  <div className="flex flex-col items-center gap-3 animate-fade-in">
                    <div className="flex flex-col items-center">
                      <button
                        onClick={onJoinFamily}
                        className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 
                          hover:bg-primary-200 flex items-center justify-center transition-all
                          transform hover:scale-110"
                        title="Family Settings"
                      >
                        <Users className="w-5 h-5" />
                      </button>
                      <span className="text-xs text-gray-600 mt-1">Family</span>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <button
                        onClick={handleSlideshowClick}
                        className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 
                          hover:bg-primary-200 flex items-center justify-center transition-all
                          transform hover:scale-110"
                        title="Start Slideshow"
                      >
                        <PlaySquare className="w-5 h-5" />
                      </button>
                      <span className="text-xs text-gray-600 mt-1">Slideshow</span>
                    </div>

                    {/* Small spacer after quick actions */}
                    <div className="w-8 border-t border-gray-200 my-2"></div>
                  </div>
                )}
              </div>
            ))}
            
            <button
              onClick={onJoinFamily}
              className="w-12 h-12 rounded-full bg-gray-100 text-gray-600 
                hover:bg-gray-200 flex items-center justify-center transition-all"
              title="Join or create family"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowSubscription(true)}
          className="w-12 h-12 mt-4 rounded-full bg-primary-50 text-primary-600
            hover:bg-primary-100 flex items-center justify-center transition-all"
          title="Manage Subscription"
        >
          <CreditCard className="w-6 h-6" />
        </button>
      </div>

      <button
        onClick={onToggleCollapse}
        className={`fixed top-1/2 -translate-y-1/2 w-6 h-12 
          bg-white border border-gray-200 rounded-r-lg shadow-sm
          flex items-center justify-center text-gray-500 hover:text-gray-700
          transition-all duration-300 z-20
          ${isCollapsed ? 'left-0' : 'left-16'}`}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {showSubscription && (
        <SubscriptionModal
          families={families}
          totalCost={totalCost}
          onClose={() => setShowSubscription(false)}
        />
      )}
    </>
  );
};