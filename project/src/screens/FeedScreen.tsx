import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { usePosts } from '../hooks/usePosts';
import { SharedSidebar } from '../components/SharedSidebar';
import { NotificationBell } from '../components/NotificationBell';
import { useNavigation } from '../hooks/useNavigation';

interface FeedScreenProps {
  familyId: string | null;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ familyId }) => {
  const { posts, loading, error, refreshPosts } = usePosts(familyId);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { navigateToAgenda } = useNavigation();

  const handleFamilyChange = (id: string) => {
    window.location.hash = `family/${id}`;
  };

  const handleJoinFamily = () => {
    window.location.hash = 'join';
  };

  const handlePostDelete = () => {
    refreshPosts();
  };

  const handleNotificationClick = () => {
    navigateToAgenda();
  };

  if (!familyId) {
    return (
      <>
        <SharedSidebar
          currentFamilyId={familyId}
          onFamilyChange={handleFamilyChange}
          onJoinFamily={handleJoinFamily}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          currentPage="feed"
        />
        <div className={`max-w-lg mx-auto px-4 sm:px-6 transition-all duration-300 ${!isCollapsed ? 'pl-24' : ''}`}>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Select a Family
            </h2>
            <p className="text-gray-600 mb-6">
              Choose a family from the sidebar to view their posts
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SharedSidebar
        currentFamilyId={familyId}
        onFamilyChange={handleFamilyChange}
        onJoinFamily={handleJoinFamily}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        currentPage="feed"
      />
      
      <div className={`max-w-lg mx-auto px-4 sm:px-6 transition-all duration-300 ${!isCollapsed ? 'pl-24' : ''}`}>
        {/* Notification Bell */}
        <div className="fixed top-4 right-4 z-20">
          <NotificationBell familyId={familyId} onClick={handleNotificationClick} />
        </div>

        {loading ? (
          <div className="animate-pulse space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-64 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-xl p-6 text-red-600 text-center">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Posts Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Be the first one to share a moment with your family!
            </p>
            <button
              onClick={() => window.location.hash = 'photos'}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Share a Photo
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post} 
                onDelete={handlePostDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};