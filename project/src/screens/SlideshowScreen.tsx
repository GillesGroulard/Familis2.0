import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart, Lock, Unlock } from 'lucide-react';
import { useSlideshow } from '../hooks/useSlideshow';
import { useAutoplay } from '../hooks/useAutoplay';
import { useReactions } from '../hooks/useReactions';
import { useReminders } from '../hooks/useReminders';
import { useFavorite } from '../hooks/useFavorite';
import { ReminderAnimation } from '../components/ReminderAnimation';
import { GiftBoxAnimation } from '../components/GiftBoxAnimation';
import { ReactionOverlay } from '../components/ReactionOverlay';
import { AgendaSlide } from '../components/AgendaSlide';
import { useAudio } from '../hooks/useAudio';
import { shouldShowReminder } from '../utils/reminderTiming';
import type { Reminder } from '../types';

interface SlideshowScreenProps {
  familyId: string | null;
  setActiveTab: (tab: string) => void;
}

export const SlideshowScreen: React.FC<SlideshowScreenProps> = ({ familyId, setActiveTab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const unlockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unlockStartTimeRef = useRef<number | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isLocked, setIsLocked] = useState(true);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [currentReaction, setCurrentReaction] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [currentReminder, setCurrentReminder] = useState<Reminder | null>(null);

  const { play: playNewPhotoSound } = useAudio('/sounds/new-photo.mp3');
  const { toggleFavorite, loading: favoriteLoading } = useFavorite();
  const { getActiveReminders, acknowledgeReminder } = useReminders(familyId || '');
  const { addElderlyReaction, getCurrentReaction } = useReactions();

  const {
    posts,
    familySettings,
    reminders,
    loading,
    error,
    currentIndex,
    setCurrentIndex,
    nextSlide,
    previousSlide,
    autoplayEnabled,
    setAutoplayEnabled,
    newPhotoAdded,
    setNewPhotoAdded,
    refreshPosts,
    refreshReminders
  } = useSlideshow(familyId);

  const { recordInteraction } = useAutoplay({
    enabled: autoplayEnabled && !showReactions && !showReminder && !newPhotoAdded,
    interval: (familySettings?.slideshow_speed || 15) * 1000,
    onNext: nextSlide,
    paused: showReactions || showReminder || newPhotoAdded
  });

  useEffect(() => {
    if (familyId) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      refreshIntervalRef.current = setInterval(() => {
        refreshPosts();
        refreshReminders();
      }, 300000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [familyId]);

  useEffect(() => {
    const checkReminders = async () => {
      if (!familyId) return;

      const activeReminders = await getActiveReminders();
      const reminderToShow = activeReminders?.find(reminder => 
        reminder.target_audience === 'ELDER' && 
        !reminder.is_acknowledged && 
        shouldShowReminder(reminder)
      );

      if (reminderToShow) {
        setCurrentReminder(reminderToShow);
        setShowReminder(true);
        setAutoplayEnabled(false);
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [familyId, getActiveReminders]);

  useEffect(() => {
    loadCurrentReaction();
  }, [currentIndex]);

  const loadCurrentReaction = async () => {
    try {
      if (currentIndex < 0 || !posts[currentIndex]) return;
      const reaction = await getCurrentReaction(posts[currentIndex].id);
      setCurrentReaction(reaction);
    } catch (err) {
      console.error('Error loading reaction:', err);
    }
  };

  const handleFavoriteToggle = async () => {
    if (currentIndex >= 0 && posts[currentIndex] && !favoriteLoading) {
      try {
        recordInteraction();
        const post = posts[currentIndex];
        await toggleFavorite(post.id, post.is_favorite);
        await refreshPosts();
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    }
  };

  const handleLockPress = () => {
    unlockStartTimeRef.current = Date.now();
    unlockTimerRef.current = setInterval(() => {
      if (!unlockStartTimeRef.current) return;
      
      const elapsed = Date.now() - unlockStartTimeRef.current;
      const progress = Math.min((elapsed / 5000) * 100, 100);
      setUnlockProgress(progress);
      
      if (progress >= 100) {
        clearInterval(unlockTimerRef.current!);
        unlockTimerRef.current = null;
        unlockStartTimeRef.current = null;
        setUnlockProgress(0);
        setIsLocked(false);
        setActiveTab('feed');
      }
    }, 50);
  };

  const handleLockRelease = () => {
    if (unlockTimerRef.current) {
      clearInterval(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    unlockStartTimeRef.current = null;
    setUnlockProgress(0);
  };

  const handleReactionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    recordInteraction();
    setAutoplayEnabled(false);
    setShowReactions(true);
  };

  const handleReaction = async (emojiType: string) => {
    try {
      if (currentIndex < 0 || !posts[currentIndex]) return;

      await addElderlyReaction(posts[currentIndex].id, emojiType);
      setCurrentReaction(emojiType);
      setShowReactions(false);
      setAutoplayEnabled(true);
    } catch (err) {
      console.error('Failed to add reaction:', err);
    }
  };

  const handleGiftOpen = () => {
    setNewPhotoAdded(false);
    setAutoplayEnabled(true);
  };

  const handleReminderAcknowledge = async () => {
    if (currentReminder) {
      await acknowledgeReminder(currentReminder.id);
      setShowReminder(false);
      setCurrentReminder(null);
      setAutoplayEnabled(true);
    }
  };

  const handlePrevious = () => {
    recordInteraction();
    previousSlide();
    setAutoplayEnabled(false);
  };

  const handleNext = () => {
    recordInteraction();
    nextSlide();
    setAutoplayEnabled(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-white text-xl">Loading photos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black">
      <button
        onMouseDown={handleLockPress}
        onMouseUp={handleLockRelease}
        onTouchStart={handleLockPress}
        onTouchEnd={handleLockRelease}
        className="absolute top-4 right-4 z-50 p-4 text-white/50 hover:text-white/75 transition-colors rounded-full"
        style={{
          background: unlockProgress > 0 
            ? `linear-gradient(to right, rgba(59, 130, 246, 0.5) ${unlockProgress}%, transparent ${unlockProgress}%)` 
            : undefined
        }}
      >
        {isLocked ? (
          <Lock className="w-8 h-8" />
        ) : (
          <Unlock className="w-8 h-8" />
        )}
      </button>

      <div className={`relative w-full h-full ${showReactions ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
        {currentIndex === -1 ? (
          <AgendaSlide reminders={reminders} />
        ) : posts[currentIndex] && (
          <>
            {posts[currentIndex].media_type === 'video' ? (
              <video
                ref={videoRef}
                src={posts[currentIndex].media_url}
                className="w-full h-full object-contain"
                controls={false}
                playsInline
                autoPlay
                onEnded={() => {
                  handleNext();
                  setAutoplayEnabled(true);
                }}
              />
            ) : (
              <img
                ref={imageRef}
                src={posts[currentIndex].media_url}
                alt={posts[currentIndex].caption}
                className="w-full h-full object-contain"
              />
            )}

            <button
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              className={`absolute top-4 left-4 p-4 transition-all duration-300 favorite-star ${
                posts[currentIndex].is_favorite 
                  ? 'active scale-110 drop-shadow-glow' 
                  : 'text-white/50 hover:text-white/75'
              }`}
            >
              <Star 
                className={`w-8 h-8 ${
                  posts[currentIndex].is_favorite 
                    ? 'fill-yellow-400' 
                    : ''
                }`} 
              />
            </button>

            <button
              onClick={handleReactionClick}
              className={`absolute bottom-8 right-8 p-6 rounded-full shadow-lg z-10
                transform transition-all duration-300 hover:scale-105 active:scale-95
                ${currentReaction 
                  ? 'bg-white/20 backdrop-blur-sm hover:bg-white/30' 
                  : 'bg-primary-500 hover:bg-primary-600'}`}
            >
              {currentReaction ? (
                <span className="text-4xl filter drop-shadow-lg">
                  {{'LOVE': '❤️', 'SMILE': '😊', 'HUG': '🤗', 'PROUD': '👏'}[currentReaction]}
                </span>
              ) : (
                <Heart className="w-12 h-12 text-white" />
              )}
            </button>

            <div className="absolute bottom-8 left-8 right-8">
              <div className="inline-flex items-start gap-4 p-4 rounded-2xl bg-black/40 backdrop-blur-sm">
                <img
                  src={posts[currentIndex].avatar_url}
                  alt={posts[currentIndex].username}
                  className="w-16 h-16 rounded-full border-2 border-white object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-semibold text-white">
                    {posts[currentIndex].username}
                  </h3>
                  <p className="text-xl text-white mt-1 line-clamp-2 break-words">
                    {posts[currentIndex].caption}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full
            hover:bg-black/75 transition-colors transform hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-4 rounded-full
            hover:bg-black/75 transition-colors transform hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      </div>

      {showReactions && (
        <ReactionOverlay
          onReact={handleReaction}
          onClose={() => {
            setShowReactions(false);
            setAutoplayEnabled(true);
          }}
          currentReaction={currentReaction}
        />
      )}

      {newPhotoAdded && (
        <GiftBoxAnimation onOpen={handleGiftOpen} />
      )}

      {showReminder && currentReminder && (
        <ReminderAnimation
          reminder={currentReminder}
          onAcknowledge={handleReminderAcknowledge}
        />
      )}
    </div>
  );
};