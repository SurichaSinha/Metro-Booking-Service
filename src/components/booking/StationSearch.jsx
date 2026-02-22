import { useCallback } from 'react';
import { useBooking } from '../../context/BookingContext';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import StationSearchInput from './StationSearchInput';
import Button from '../ui/Button';

export default function StationSearch({ onSearch }) {
  const { source, destination, setSource, setDestination, swapStations } = useBooking();
  const { searches } = useRecentSearches();

  const handleSwap = useCallback(() => {
    swapStations();
  }, [swapStations]);

  const handleRecentSearchClick = useCallback((search) => {
    setSource(search.source);
    setDestination(search.destination);
  }, [setSource, setDestination]);

  const canSearch = source && destination && source.id !== destination.id;

  return (
    <div className="space-y-6">
      <div className="relative grid md:grid-cols-[1fr,1fr] gap-4 md:gap-12 items-start">
        <StationSearchInput
          label="From"
          value={source}
          onChange={setSource}
          placeholder="Select source station"
          excludeStation={destination}
          aria-label="Select source station"
        />

        {/* Centered swap button */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-0 z-10">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!source && !destination}
            className="py-2 px-3 bg-metro-blue text-white rounded-full shadow-lg hover:bg-blue-700 
              transition-all transform hover:scale-110
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
              focus:outline-none focus:ring-2 focus:ring-metro-blue focus:ring-offset-2"
            aria-label="Swap source and destination"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        {/* Mobile swap button */}
        <div className="md:hidden flex justify-center -my-2">
          <button
            type="button"
            onClick={handleSwap}
            disabled={!source && !destination}
            className="p-2.5 bg-metro-blue text-white rounded-full shadow-md hover:bg-blue-700 
              transition-colors disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-metro-blue focus:ring-offset-2"
            aria-label="Swap source and destination"
          >
            <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        <StationSearchInput
          label="To"
          value={destination}
          onChange={setDestination}
          placeholder="Select destination station"
          excludeStation={source}
          aria-label="Select destination station"
        />
      </div>

      {searches.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {searches.map((search, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleRecentSearchClick(search)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg
                  text-sm text-gray-700 hover:border-metro-blue hover:text-metro-blue transition-colors shadow-sm"
              >
                <span className="font-medium">{search.source.name}</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                <span className="font-medium">{search.destination.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={onSearch}
          disabled={!canSearch}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Routes
        </Button>
      </div>
    </div>
  );
}
