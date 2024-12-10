import React from 'react';
import { Home, ImagePlus, Users, UserCircle, Calendar } from 'lucide-react';
import { useReminderNotifications } from '../hooks/useReminderNotifications';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  primary?: boolean;
  showNotification?: boolean;
}

const NavItem = ({ icon, label, active, onClick, primary, showNotification }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center py-2 transition-colors relative ${
      primary 
        ? 'flex-1 -mt-6 bg-primary-500 text-white rounded-full mx-4 py-4 shadow-lg hover:bg-primary-600'
        : `flex-1 ${active ? 'text-primary-500' : 'text-gray-500 hover:text-primary-500'}`
    }`}
  >
    <div className={`h-6 w-6 ${primary ? 'scale-110' : ''} relative`}>
      {icon}
      {showNotification && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
    <span className={`text-xs mt-1 font-medium ${primary ? 'text-white' : ''}`}>{label}</span>
  </button>
);

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  familyId?: string | null;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, familyId }) => {
  const { hasNewReminders, markAsRead } = useReminderNotifications(familyId);

  const handleAgendaClick = () => {
    setActiveTab('agenda');
    if (hasNewReminders) {
      markAsRead();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-safe">
      <div className="flex items-end justify-between">
        <NavItem
          icon={<Home className="w-6 h-6" />}
          label="Feed"
          active={activeTab === 'feed'}
          onClick={() => setActiveTab('feed')}
        />
        <NavItem
          icon={<Users className="w-6 h-6" />}
          label="Join Family"
          active={activeTab === 'join'}
          onClick={() => setActiveTab('join')}
        />
        <NavItem
          icon={<ImagePlus className="w-6 h-6" />}
          label="Add Photos"
          active={activeTab === 'photos'}
          onClick={() => setActiveTab('photos')}
          primary
        />
        <NavItem
          icon={<UserCircle className="w-6 h-6" />}
          label="Profile"
          active={activeTab === 'profile'}
          onClick={() => setActiveTab('profile')}
        />
        <NavItem
          icon={<Calendar className="w-6 h-6" />}
          label="Agenda"
          active={activeTab === 'agenda'}
          onClick={handleAgendaClick}
          showNotification={hasNewReminders}
        />
      </div>
    </div>
  );
};