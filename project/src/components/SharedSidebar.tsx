import React, { useState, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { useFamilies } from '../hooks/useFamilies';
import { useNavigation } from '../hooks/useNavigation';
import { SubscriptionModal } from './SubscriptionModal';
import { FamilyBubble } from './sidebar/FamilyBubble';
import { QuickActions } from './sidebar/QuickActions';
import { FeedbackButton } from './sidebar/FeedbackButton';
import { FeedbackModal } from './sidebar/FeedbackModal';

interface SharedSidebarProps {
  currentFamilyId: string | null;
  onFamilyChange: (familyId: string) => void;
  onJoinFamily: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentPage: 'feed' | 'join';
}

export const SharedSidebar: React.FC<SharedSidebarProps> = ({
  currentFamilyId,
  onFamilyChange,
  onJoinFamily,
  isCollapsed,
  onToggleCollapse,
  currentPage
}) => {
  const { families, loading, error } = useFamilies();
  const [showSubscription, setShowSubscription] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { navigateToFamily, navigateToSlideshow, navigateToJoin } = useNavigation();

  const handleFamilySelect = useCallback((familyId: string) => {
    onFamilyChange(familyId);
    navigateToFamily(familyId);
  }, [onFamilyChange, navigateToFamily]);

  const handleSlideshowClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentFamilyId) {
      navigateToSlideshow(currentFamilyId);
    }
  }, [currentFamilyId, navigateToSlideshow]);

  const handleFeedClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentFamilyId) {
      navigateToFamily(currentFamilyId);
    }
  }, [currentFamilyId, navigateToFamily]);

  const handleFamilySettingsClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigateToJoin();
  }, [navigateToJoin]);

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

  return (
    <>
      <div className={`fixed left-0 top-16 bottom-20 bg-white border-r border-gray-200 
        flex flex-col items-center py-4 transition-transform duration-300 z-10
        ${isCollapsed ? '-translate-x-full' : 'translate-x-0'} w-16`}>
        <div className="flex flex-col items-center gap-4 flex-1">
          {families.map((family) => (
            <div key={family.id} className="flex flex-col items-center gap-3">
              <FamilyBubble
                family={family}
                isSelected={currentFamilyId === family.id}
                onSelect={handleFamilySelect}
              />

              {currentFamilyId === family.id && (
                <QuickActions
                  currentPage={currentPage}
                  onFeedClick={handleFeedClick}
                  onFamilyClick={handleFamilySettingsClick}
                  onSlideshowClick={handleSlideshowClick}
                />
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

        <div className="mt-4 space-y-4">
          <FeedbackButton onOpenFeedback={() => setShowFeedback(true)} />
          
          <button
            onClick={() => setShowSubscription(true)}
            className="w-12 h-12 rounded-full bg-primary-50 text-primary-600
              hover:bg-primary-100 flex items-center justify-center transition-all"
            title="Manage Subscription"
          >
            <CreditCard className="w-6 h-6" />
          </button>
        </div>
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
          totalCost={families.length * 10}
          onClose={() => setShowSubscription(false)}
        />
      )}

      {showFeedback && (
        <FeedbackModal onClose={() => setShowFeedback(false)} />
      )}
    </>
  );
};