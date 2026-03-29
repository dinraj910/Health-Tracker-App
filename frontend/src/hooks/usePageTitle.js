import { useEffect } from 'react';

/**
 * Sets the browser tab title for a page.
 * @param {string} title - The page-specific title (e.g. "Dashboard")
 */
const usePageTitle = (title) => {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | MediTrack` : 'MediTrack — Health & Medicine Tracker';
    return () => {
      document.title = prev;
    };
  }, [title]);
};

export default usePageTitle;
