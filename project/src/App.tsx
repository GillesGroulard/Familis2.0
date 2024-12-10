import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { FeedScreen } from './screens/FeedScreen';
import { PhotosScreen } from './screens/PhotosScreen';
import { JoinScreen } from './screens/JoinScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SlideshowScreen } from './screens/SlideshowScreen';
import { AgendaScreen } from './screens/AgendaScreen';
import { AuthScreen } from './screens/AuthScreen';
import { supabase } from './lib/supabase';
import { useFamilies } from './hooks/useFamilies';

function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [session, setSession] = useState(null);
  const { families } = useFamilies();
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (families.length > 0 && !currentFamilyId) {
      setCurrentFamilyId(families[0].id);
    }
  }, [families]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('family/')) {
        const familyId = hash.split('/')[1];
        setCurrentFamilyId(familyId);
        setActiveTab('feed');
      } else if (hash.startsWith('slideshow/')) {
        const familyId = hash.split('/')[1];
        setCurrentFamilyId(familyId);
        setActiveTab('slideshow');
      } else if (hash === 'join') {
        setActiveTab('join');
      } else if (hash === 'photos') {
        setActiveTab('photos');
      } else if (hash === 'profile') {
        setActiveTab('profile');
      } else if (hash === 'agenda') {
        setActiveTab('agenda');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Handle initial hash

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (!session) {
    return <AuthScreen />;
  }

  const handleFamilyChange = (familyId: string) => {
    setCurrentFamilyId(familyId);
    window.location.hash = `family/${familyId}`;
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedScreen familyId={currentFamilyId} />;
      case 'photos':
        return <PhotosScreen />;
      case 'slideshow':
        return <SlideshowScreen familyId={currentFamilyId} setActiveTab={setActiveTab} />;
      case 'join':
        return <JoinScreen onSuccess={() => setActiveTab('feed')} />;
      case 'profile':
        return <ProfileScreen />;
      case 'agenda':
        return <AgendaScreen familyId={currentFamilyId} />;
      default:
        return <FeedScreen familyId={currentFamilyId} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {activeTab !== 'slideshow' && <Header currentFamilyId={currentFamilyId} />}
      <div className={activeTab === 'slideshow' ? 'h-screen' : 'pt-16 pb-20'}>
        <main className="mx-auto max-w-2xl transition-all duration-300">
          {renderScreen()}
        </main>
      </div>
      {activeTab !== 'slideshow' && (
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}
    </div>
  );
}

export default App;