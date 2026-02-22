import Badge from '../ui/Badge';

export default function RouteTimeline({ segments, showStops = false }) {
  if (!segments || segments.length === 0) return null;

  return (
    <div className="space-y-2">
      {segments.map((segment, segmentIndex) => (
        <div key={segmentIndex} className="relative">
          {segment.isInterchange && (
            <div className="flex items-center gap-3 py-3 pl-6 bg-amber-50 rounded-lg mb-2 border border-amber-200">
              <div className="flex items-center justify-center w-8 h-8 bg-amber-500 rounded-full">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-amber-800">Change at {segment.fromStation.name}</p>
                <p className="text-sm text-amber-600">
                  Transfer from {segments[segmentIndex - 1].line.name} to {segment.line.name}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className="w-4 h-4 rounded-full border-4 border-white shadow-md z-10"
                style={{ backgroundColor: segment.line.color }}
              />
              <div
                className="w-1 flex-1 -mt-1"
                style={{ backgroundColor: segment.line.color }}
              />
              <div
                className="w-4 h-4 rounded-full border-4 border-white shadow-md z-10 -mt-1"
                style={{ backgroundColor: segment.line.color }}
              />
            </div>

            <div className="flex-1 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{segment.fromStation.name}</p>
                  {segmentIndex === 0 && (
                    <Badge variant="success" size="sm">Start</Badge>
                  )}
                </div>
                <Badge color={segment.line.color} size="sm">
                  {segment.line.name}
                </Badge>
              </div>

              {showStops && segment.stops.length > 2 && (
                <div className="ml-2 my-2 pl-4 border-l-2 border-gray-200">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                      {segment.stops.length - 2} intermediate stops
                    </summary>
                    <ul className="mt-2 space-y-1">
                      {segment.stops.slice(1, -1).map((stop, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: segment.line.color }}
                          />
                          {stop.name}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 my-2">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {segment.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {segment.stops.length} stops
                </span>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{segment.toStation.name}</p>
                {segmentIndex === segments.length - 1 && (
                  <Badge variant="primary" size="sm">End</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
