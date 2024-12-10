import { useCallback } from 'react';

export function useNavigation() {
  const navigateToFamily = useCallback((familyId: string) => {
    window.location.hash = `family/${familyId}`;
  }, []);

  const navigateToSlideshow = useCallback((familyId: string) => {
    window.location.hash = `slideshow/${familyId}`;
  }, []);

  const navigateToJoin = useCallback(() => {
    window.location.hash = 'join';
  }, []);

  const navigateToPhotos = useCallback(() => {
    window.location.hash = 'photos';
  }, []);

  const navigateToAgenda = useCallback(() => {
    window.location.hash = 'agenda';
  }, []);

  return {
    navigateToFamily,
    navigateToSlideshow,
    navigateToJoin,
    navigateToPhotos,
    navigateToAgenda
  };
}