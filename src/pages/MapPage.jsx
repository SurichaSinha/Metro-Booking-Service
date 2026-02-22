import { Link } from 'react-router-dom';
import MetroNetworkMap from '../components/map/MetroNetworkMap';
import StationDetailPanel from '../components/map/StationDetailPanel';
import { useMetro } from '../context/MetroContext';

export default function MapPage() {
  const { selectedStation, setSelectedStation, highlightedRoute, setHighlightedRoute, getStation } = useMetro();

  const handleClearHighlight = () => {
    setHighlightedRoute(null);
  };

  const startStation = highlightedRoute ? getStation(highlightedRoute[0]) : null;
  const endStation = highlightedRoute ? getStation(highlightedRoute[highlightedRoute.length - 1]) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Patna Metro Network Map</h1>
        <div className="flex items-center gap-3 text-sm flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#E53935' }} />
            <span className="text-gray-600">Red</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-metro-blue" />
            <span className="text-gray-600">Blue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-metro-yellow" />
            <span className="text-gray-600">Yellow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-metro-green" />
            <span className="text-gray-600">Green</span>
          </div>
        </div>
      </div>

      {highlightedRoute && startStation && endStation && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <span className="font-medium text-gray-900">{startStation.name}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="font-medium text-gray-900">{endStation.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{highlightedRoute.length} stations</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/book"
                className="text-sm text-metro-blue hover:text-metro-blue/80 font-medium"
              >
                Back to Booking
              </Link>
              <button
                onClick={handleClearHighlight}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <MetroNetworkMap onStationClick={setSelectedStation} />
        </div>

        {selectedStation && (
          <StationDetailPanel
            station={selectedStation}
            onClose={() => setSelectedStation(null)}
          />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border-[3px] bg-white" style={{ borderColor: '#E53935' }} />
            <span>Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-[2.5px] border-gray-500 bg-white" />
            <span>Interchange</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-metro-blue opacity-20 ring-2 ring-metro-blue" />
            <span>Route Endpoint</span>
          </div>
        </div>
      </div>
    </div>
  );
}
