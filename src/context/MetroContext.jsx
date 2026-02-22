import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { patnaMetroNetwork } from '../data/patnaMetroNetwork';

const MetroContext = createContext(null);
const STORAGE_KEY = 'patna-metro-network';

function loadNetworkFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load network from storage:', e);
  }
  return patnaMetroNetwork;
}

function saveNetworkToStorage(network) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(network));
  } catch (e) {
    console.error('Failed to save network to storage:', e);
  }
}

export function MetroProvider({ children }) {
  const [network, setNetworkState] = useState(loadNetworkFromStorage);
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
      lineDetails: station.lines.map(lineId => {
        const line = network.lines.find(l => l.id === lineId);
        return line ? { id: line.id, name: line.name, color: line.color } : null;
      }).filter(Boolean),
    }));
  }, [network.stations, network.lines]);

  const getStation = (stationId) => network.stations[stationId];
  const getLine = (lineId) => network.lines.find(l => l.id === lineId);

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
