
import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { patnaMetroNetwork } from '../data/patnaMetroNetwork';

const MetroContext = createContext(null);

// Storage key for localStorage - using a descriptive name to avoid conflicts
const STORAGE_KEY = 'patna-metro-network';


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


function saveNetworkToStorage(network) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(network));
  } catch (e) {
    console.error('Failed to save network to storage:', e);
    // Could add toast notification here to inform user
  }
}


export function MetroProvider({ children }) {
  // Initialize state from localStorage (or defaults if nothing stored)
  // Using function form of useState for lazy initialization
  const [network, setNetworkState] = useState(loadNetworkFromStorage);
  
  // UI state for map interactions
  const [highlightedRoute, setHighlightedRoute] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);

  
  const setNetwork = (updater) => {
    setNetworkState(prev => {
      const newNetwork = typeof updater === 'function' ? updater(prev) : updater;
      saveNetworkToStorage(newNetwork);
      return newNetwork;
    });
  };

  
  const resetNetwork = () => {
    localStorage.removeItem(STORAGE_KEY);
    setNetworkState(patnaMetroNetwork);
  };

  
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

  
  const getStation = (stationId) => network.stations[stationId];
  
  
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


export function useMetro() {
  const context = useContext(MetroContext);
  if (!context) {
    throw new Error('useMetro must be used within a MetroProvider');
  }
  return context;
}
