import { useEffect, useRef } from 'react';

export function useAudio(src: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio element only once
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src]);

  const play = async () => {
    try {
      if (audioRef.current) {
        // Reset audio to start
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      }
    } catch (error) {
      console.warn('Audio playback failed:', error);
      // Silently fail - audio is not critical for functionality
    }
  };

  return { play };
}