/**
 * MetroContext - Core State Management for Metro Network Data
 * 
 * This context serves as the single source of truth for all metro network data
 * including stations, lines, connections, and fare rules. It also manages
 * map-related UI state like highlighted routes and selected stations.
 * 
 * DESIGN DECISIONS:
 * 
 * 1. Why Context API instead of Redux?
 *    - The metro network state is relatively simple (one main object)
 *    - No complex async actions or middleware needed
 *    - Reduces bundle size and boilerplate
 *    - Sufficient for a medium-complexity application
 * 
 * 2. Why localStorage persistence?
 *    - Allows admin changes to persist across sessions
 *    - Works offline without a backend
 *    - Simple synchronous API (no async complexity)
 *    - Easy to clear/reset if needed
 * 
 * 3. Why wrap setNetwork instead of exposing raw setState?
 *    - Automatic persistence on every change
 *    - Supports both direct values and updater functions
 *    - Single point of control for all network updates
 */

import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { patnaMetroNetwork } from '../data/patnaMetroNetwork';

const MetroContext = createContext(null);

// Storage key for localStorage - using a descriptive name to avoid conflicts
const STORAGE_KEY = 'patna-metro-network';

/**
 * Loads network data from localStorage with fallback to default data
 * 
 * Error handling is crucial here because:
 * - localStorage might be disabled (private browsing)
 * - Stored data might be corrupted
 * - JSON parsing might fail
 * 
 * In all error cases, we gracefully fall back to the default network data.
 */
function loadNetworkFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    // Log for debugging but don't crash the app
    console.error('Failed to load network from storage:', e);
  }
  // Return default network if nothing in storage or on error
  return patnaMetroNetwork;
}

/**
 * Saves network data to localStorage
 * 
 * Wrapped in try-catch because localStorage can throw:
 * - QuotaExceededError if storage is full
 * - SecurityError in some browser configurations
 */
function saveNetworkToStorage(network) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(network));
  } catch (e) {
    console.error('Failed to save network to storage:', e);
    // Could add toast notification here to inform user
  }
}

/**
 * MetroProvider - Provides metro network data to the entire application
 * 
 * STATE STRUCTURE:
 * - network: The complete metro network data (stations, lines, connections, fares)
 * - highlightedRoute: Array of station IDs for journey highlighting on map
 * - selectedStation: Currently selected station object (for detail panel)
 * 
 * EXPOSED VALUES:
 * - network: Read the current network state
 * - setNetwork: Update network (auto-persists to localStorage)
 * - resetNetwork: Clear localStorage and reset to defaults
 * - stationsList: Memoized array of stations with line details
 * - highlightedRoute/setHighlightedRoute: For map journey highlighting
 * - selectedStation/setSelectedStation: For station detail panel
 * - getStation: O(1) station lookup by ID
 * - getLine: Line lookup by ID
 */
export function MetroProvider({ children }) {
  // Initialize state from localStorage (or defaults if nothing stored)
  // Using function form of useState for lazy initialization
  const [network, setNetworkState] = useState(loadNetworkFromStorage);
  
  // UI state for map interactions
  const [highlightedRoute, setHighlightedRoute] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  /**
   * Wrapped network setter that automatically persists to localStorage
   * 
   * This is a key pattern: by wrapping the setter, we ensure that
   * ANY update to the network (from admin panel, bulk import, etc.)
   * is automatically persisted without requiring explicit save calls.
   * 
   * Supports both:
   * - Direct value: setNetwork(newNetwork)
   * - Updater function: setNetwork(prev => ({ ...prev, stations: {...} }))
   */
  const setNetwork = (updater) => {
    setNetworkState(prev => {
      const newNetwork = typeof updater === 'function' ? updater(prev) : updater;
      saveNetworkToStorage(newNetwork);
      return newNetwork;
    });
  };

  /**
   * Resets network to factory defaults
   * 
   * Useful when:
   * - User wants to undo all admin changes
   * - Debugging/testing
   * - Corrupted localStorage data
   */
  const resetNetwork = () => {
    localStorage.removeItem(STORAGE_KEY);
    setNetworkState(patnaMetroNetwork);
  };

  /**
   * Memoized array of stations with enriched line details
   * 
   * WHY MEMOIZE?
   * This transformation is expensive:
   * - Converts stations object to array
   * - For each station, looks up line details
   * - Creates new objects with enriched data
   * 
   * Without useMemo, this would run on every render (60+ times per second during animations)
   * With useMemo, it only recalculates when network.stations or network.lines actually change.
   * 
   * WHY THIS STRUCTURE?
   * Components displaying stations (map, search) need quick access to line colors.
   * Pre-computing this avoids repeated lookups in render functions.
   */
  const stationsList = useMemo(() => {
    return Object.values(network.stations).map(station => ({
      ...station,
      // Enrich with line details (name, color) for each line this station belongs to
      lineDetails: station.lines.map(lineId => {
        const line = network.lines.find(l => l.id === lineId);
        return line ? { id: line.id, name: line.name, color: line.color } : null;
      }).filter(Boolean), // Remove nulls (handles case where line ID doesn't exist)
    }));
  }, [network.stations, network.lines]);

  /**
   * O(1) station lookup by ID
   * 
   * WHY OBJECT INSTEAD OF ARRAY?
   * stations is stored as { id: station } object, not an array.
   * This gives O(1) constant-time lookups instead of O(n) array.find()
   * Critical for route calculation which does hundreds of lookups.
   */
  const getStation = (stationId) => network.stations[stationId];
  
  /**
   * Line lookup by ID
   * 
   * Lines are stored as array (small count, ~4-5 lines) so array.find() is acceptable.
   * If we had hundreds of lines, we'd use an object like stations.
   */
  const getLine = (lineId) => network.lines.find(l => l.id === lineId);

  // Expose all state and actions through context value
  const value = {
    network,
    setNetwork,
    resetNetwork,
    stationsList,
    highlightedRoute,
    setHighlightedRoute,
    selectedStation,
    setSelectedStation,
    getStation,
    getLine,
  };

  return (
    <MetroContext.Provider value={value}>
      {children}
    </MetroContext.Provider>
  );
}

/**
 * Custom hook for consuming metro context
 * 
 * Throws error if used outside provider - this is intentional to catch
 * bugs early during development. Without this check, you'd get cryptic
 * "cannot read property 'network' of null" errors.
 */
export function useMetro() {
  const context = useContext(MetroContext);
  if (!context) {
    throw new Error('useMetro must be used within a MetroProvider');
  }
  return context;
}
