import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentSearches } from './useRecentSearches';

describe('useRecentSearches', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockClear();
  });

  it('returns empty array initially', () => {
    const { result } = renderHook(() => useRecentSearches());
    expect(result.current.searches).toEqual([]);
  });

  it('adds a search to the list', () => {
    const { result } = renderHook(() => useRecentSearches());
    
    const source = { id: 'danapur', name: 'Danapur Cantonment' };
    const destination = { id: 'patna-junction', name: 'Patna Junction' };
    
    act(() => {
      result.current.addSearch(source, destination);
    });

    expect(result.current.searches).toHaveLength(1);
    expect(result.current.searches[0].source).toEqual(source);
    expect(result.current.searches[0].destination).toEqual(destination);
  });

  it('keeps only the last 5 searches', () => {
    const { result } = renderHook(() => useRecentSearches());
    
    for (let i = 0; i < 7; i++) {
      act(() => {
        result.current.addSearch(
          { id: `source-${i}`, name: `Source ${i}` },
          { id: `dest-${i}`, name: `Dest ${i}` }
        );
      });
    }

    expect(result.current.searches).toHaveLength(5);
    expect(result.current.searches[0].source.id).toBe('source-6');
  });

  it('removes duplicate searches', () => {
    const { result } = renderHook(() => useRecentSearches());
    
    const source = { id: 'danapur', name: 'Danapur' };
    const destination = { id: 'patna-junction', name: 'Patna Junction' };
    
    act(() => {
      result.current.addSearch(source, destination);
      result.current.addSearch(source, destination);
    });

    expect(result.current.searches).toHaveLength(1);
  });

  it('clears all searches', () => {
    localStorage.getItem.mockReturnValue(JSON.stringify([
      { source: { id: 'a' }, destination: { id: 'b' }, timestamp: Date.now() }
    ]));
    
    const { result } = renderHook(() => useRecentSearches());
    
    act(() => {
      result.current.clearSearches();
    });

    expect(result.current.searches).toHaveLength(0);
  });
});
