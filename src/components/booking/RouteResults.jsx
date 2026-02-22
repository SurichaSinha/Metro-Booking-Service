import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useMetro } from '../../context/MetroContext';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { findAllRoutes } from '../../utils/routeCalculator';
import RouteTimeline from './RouteTimeline';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';

export default function RouteResults() {
  const navigate = useNavigate();
  const { source, destination, setRoute, selectedRoute, startBooking } = useBooking();
  const { setHighlightedRoute } = useMetro();
  const { addSearch } = useRecentSearches();
  const [expandedRoute, setExpandedRoute] = useState(0);

  const routes = useMemo(() => {
    if (!source || !destination) return [];
    return findAllRoutes(source.id, destination.id);
  }, [source, destination]);

  useEffect(() => {
    if (selectedRoute && routes.length > 0) {
      const selectedIndex = routes.findIndex(r => 
        r.path.join(',') === selectedRoute.path.join(',')
      );
      if (selectedIndex !== -1) {
        setExpandedRoute(selectedIndex);
      }
    }
  }, [selectedRoute, routes]);

  const handleViewOnMap = () => {
    if (selectedRoute) {
      navigate('/map');
    }
  };

  const handleSelectRoute = (route, index) => {
    setRoute(route);
    setExpandedRoute(index);
    setHighlightedRoute(route.path);
    addSearch(source, destination);
  };

  const handleProceedToBooking = () => {
    if (selectedRoute) {
      startBooking();
    }
  };

  if (!source || !destination) {
    return null;
  }

  if (routes.length === 0) {
    return (
      <Card className="text-center py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">No Route Found</h3>
            <p className="text-gray-500">
              Sorry, we couldn't find a route between {source.name} and {destination.name}.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Available Routes ({routes.length})
        </h2>
        <p className="text-sm text-gray-500">
          {source.name} → {destination.name}
        </p>
      </div>

      {routes.map((route, index) => (
        <Card
          key={index}
          className={`transition-all ${
            selectedRoute === route ? 'ring-2 ring-metro-blue' : ''
          }`}
          padding="none"
        >
          <div
            className="p-4 cursor-pointer"
            onClick={() => handleSelectRoute(route, index)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {route.isRecommended && (
                  <Badge variant="success">Recommended</Badge>
                )}
                <div className="flex items-center gap-1">
                  {route.segments.map((seg, i) => (
                    <div key={i} className="flex items-center">
                      <div
                        className="w-6 h-2 rounded"
                        style={{ backgroundColor: seg.line.color }}
                        title={seg.line.name}
                      />
                      {i < route.segments.length - 1 && (
                        <div className="w-2 h-2 bg-gray-300 rounded-full mx-0.5" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-metro-blue">₹{route.fare}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">{route.totalDuration}</p>
                <p className="text-sm text-gray-500">minutes</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">{route.totalStops}</p>
                <p className="text-sm text-gray-500">stops</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">{route.interchanges}</p>
                <p className="text-sm text-gray-500">interchange{route.interchanges !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          {expandedRoute === index && (
            <div className="border-t border-gray-100 p-4">
              <h4 className="font-medium text-gray-700 mb-4">Route Details</h4>
              <RouteTimeline segments={route.segments} showStops={true} />
              
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleViewOnMap}
                  disabled={selectedRoute !== route}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  View on Map
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleProceedToBooking}
                  disabled={selectedRoute !== route}
                >
                  Proceed to Booking
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
