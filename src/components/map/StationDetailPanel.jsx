import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const facilityIcons = {
  parking: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
      </svg>
    ),
    label: 'Parking',
  },
  accessibility: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    label: 'Accessible',
  },
  toilets: {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    label: 'Toilets',
  },
  'food-court': {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    label: 'Food Court',
  },
};

export default function StationDetailPanel({ station, onClose }) {
  const navigate = useNavigate();
  const { setSource, setDestination } = useBooking();

  if (!station) return null;

  const handleBookFrom = () => {
    setSource(station);
    navigate('/book');
  };

  const handleBookTo = () => {
    setDestination(station);
    navigate('/book');
  };

  const lineDetails = station.lines.map(lineId => {
    const line = station.lineDetails?.find(l => l.id === lineId);
    return line || { id: lineId, name: lineId, color: '#666' };
  });

  return (
    <div className="absolute right-4 top-4 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-20">
      <div className="relative p-4 border-b border-gray-100">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          aria-label="Close panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-3">
          <div className="flex -space-x-1">
            {lineDetails.map((line) => (
              <div
                key={line.id}
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: line.color }}
              />
            ))}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 pr-8">{station.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {lineDetails.map((line) => (
                <Badge key={line.id} color={line.color} size="sm">
                  {line.name}
                </Badge>
              ))}
              {station.isInterchange && (
                <Badge variant="interchange" size="sm">
                  Interchange
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {station.facilities && station.facilities.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Facilities</h4>
          <div className="flex flex-wrap gap-3">
            {station.facilities.map((facility) => {
              const facilityInfo = facilityIcons[facility];
              if (!facilityInfo) return null;
              return (
                <div
                  key={facility}
                  className="flex items-center gap-1.5 text-gray-600"
                  title={facilityInfo.label}
                >
                  <span className="text-gray-400">{facilityInfo.icon}</span>
                  <span className="text-sm">{facilityInfo.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h4>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleBookFrom}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            From here
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handleBookTo}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            To here
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="text-xs text-gray-400">
          Zone {station.zone || 1} • Station Code: {station.id.toUpperCase().slice(0, 4)}
        </div>
      </div>
    </div>
  );
}
