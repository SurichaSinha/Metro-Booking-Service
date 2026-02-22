
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useMetro } from '../../context/MetroContext';
import { useDebounce } from '../../hooks/useDebounce';
import Badge from '../ui/Badge';

export default function StationSearchInput({
  label,
  value,           // Currently selected station object
  onChange,        // Callback when selection changes
  placeholder = 'Search station...',
  excludeStation = null,  // Station to exclude from list (e.g., source when selecting destination)
  'aria-label': ariaLabel,
}) {
  const { stationsList } = useMetro();
  
  // Local state for the input text (separate from selected value)
  // This allows typing while keeping track of the actual selection
  const [inputValue, setInputValue] = useState(value?.name || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const listRef = useRef(null);
  

  const debouncedQuery = useDebounce(inputValue, 300);


  const filteredStations = useMemo(() => {
    // If no query, show all stations (except excluded)
    if (!debouncedQuery.trim()) {
      return stationsList.filter(s => s.id !== excludeStation?.id);
    }
    
    const query = debouncedQuery.toLowerCase();
    return stationsList
      .filter(station => 
        // Exclude the other selected station (prevent same source & destination)
        station.id !== excludeStation?.id &&
        // Match against station name OR line name
        (station.name.toLowerCase().includes(query) ||
         station.lines.some(l => l.toLowerCase().includes(query)))
      )
      .sort((a, b) => {
        // Prefix matches should appear first
        const aStartsWith = a.name.toLowerCase().startsWith(query);
        const bStartsWith = b.name.toLowerCase().startsWith(query);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        // Then sort alphabetically
        return a.name.localeCompare(b.name);
      });
  }, [debouncedQuery, stationsList, excludeStation]);

  useEffect(() => {
    if (value?.name !== inputValue && value) {
      setInputValue(value.name);
    }
  }, [value]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredStations]);


  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsOpen(true);
    
    // If user types after selecting, clear the selection
    // (they're searching for something different)
    if (value && newValue !== value.name) {
      onChange(null);
    }
  };


  const handleSelect = useCallback((station) => {
    setInputValue(station.name);
    onChange(station);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [onChange]);


  const handleKeyDown = (e) => {
    // If dropdown is closed, open it on arrow down or enter
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault(); // Prevent cursor from moving in input
        // Cycle through options, wrap to start
        setHighlightedIndex(prev => 
          prev < filteredStations.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Cycle through options, wrap to end
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredStations.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault(); // Prevent form submission
        if (highlightedIndex >= 0 && filteredStations[highlightedIndex]) {
          handleSelect(filteredStations[highlightedIndex]);
        }
        break;
      case 'Escape':
        // Close dropdown without selecting
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        // Let tab work naturally, just close dropdown
        setIsOpen(false);
        break;
    }
  };


  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlighted = listRef.current.children[highlightedIndex];
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleBlur = (e) => {
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Input field with ARIA attributes for accessibility */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg
            focus:ring-2 focus:ring-metro-blue focus:border-metro-blue
            placeholder-gray-400 text-gray-900"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={ariaLabel || label}
          aria-activedescendant={
            highlightedIndex >= 0 ? `station-option-${filteredStations[highlightedIndex]?.id}` : undefined
          }
          autoComplete="off" // Prevent browser autocomplete from interfering
        />
        
        {/* Clear button (only shown when value is selected) */}
        {value && (
          <button
            type="button"
            onClick={() => {
              setInputValue('');
              onChange(null);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown list */}
      {isOpen && filteredStations.length > 0 && (
        <ul
          ref={listRef}
          data-station-list
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
          role="listbox"
          aria-label="Station suggestions"
        >
          {filteredStations.map((station, index) => (
            <li
              key={station.id}
              id={`station-option-${station.id}`}
              role="option"
              aria-selected={highlightedIndex === index}
              className={`
                px-4 py-3 cursor-pointer flex items-center justify-between
                ${highlightedIndex === index ? 'bg-metro-blue/10' : 'hover:bg-gray-50'}
                ${index !== filteredStations.length - 1 ? 'border-b border-gray-100' : ''}
              `}
              
              onMouseDown={(e) => {
                e.preventDefault(); // CRUCIAL: Prevents blur from firing
                handleSelect(station);
              }}
              
              onTouchEnd={(e) => {
                e.preventDefault();
                handleSelect(station);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center gap-3">
                {/* Line color indicators */}
                <div className="flex -space-x-1">
                  {station.lineDetails.map((line) => (
                    <div
                      key={line.id}
                      className="w-3 h-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: line.color }}
                      title={line.name}
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-900">{station.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {station.isInterchange && (
                  <Badge variant="interchange" size="sm" data-testid="interchange-badge">
                    Interchange
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Empty state */}
      {isOpen && filteredStations.length === 0 && inputValue.trim() && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
          No stations found for "{inputValue}"
        </div>
      )}
    </div>
  );
}
