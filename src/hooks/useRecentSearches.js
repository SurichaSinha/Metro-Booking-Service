import { useState, useCallback } from 'react';

const STORAGE_KEY = 'patna-metro-recent-searches';
const MAX_SEARCHES = 5;

export function useRecentSearches() {
  const [searches, setSearches] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addSearch = useCallback((source, destination) => {
    setSearches(prev => {
      const newSearch = {
        source,
        destination,
        timestamp: Date.now(),
      };
      
      const filtered = prev.filter(
        s => !(s.source.id === source.id && s.destination.id === destination.id)
      );
      
      const updated = [newSearch, ...filtered].slice(0, MAX_SEARCHES);
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save recent searches:', e);
      }
      
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    setSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear recent searches:', e);
    }
  }, []);

  return { searches, addSearch, clearSearches };
}
