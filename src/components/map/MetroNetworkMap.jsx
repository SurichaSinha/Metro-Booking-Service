

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useMetro } from '../../context/MetroContext';

export default function MetroNetworkMap({ onStationClick }) {
  const { network, highlightedRoute, stationsList } = useMetro();
  
  // Refs for DOM elements
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  
  // Pan/zoom transform state
  // x, y: translation offset for panning
  // scale: zoom level (0.5 to 3)
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  // Drag state for pan functionality
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Hover state for station tooltips
  const [hoveredStation, setHoveredStation] = useState(null);
  
  const [animationKey, setAnimationKey] = useState(0);

  const viewBox = { minX: 0, minY: 50, width: 1000, height: 400 };

  useEffect(() => {
    if (highlightedRoute) {
      setAnimationKey(prev => prev + 1);
    }
  }, [highlightedRoute]);

  const handleWheel = useCallback((e) => {
    e.preventDefault(); // Prevent page scroll
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(transform.scale * delta, 0.5), 3);
    setTransform(prev => ({ ...prev, scale: newScale }));
  }, [transform.scale]);

  const handleMouseDown = (e) => {
    // data-station attribute identifies station elements
    if (e.target.closest('[data-station]')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setTransform(prev => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Zoom control functions
  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  const zoomIn = () => {
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 3) }));
  };

  const zoomOut = () => {
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale * 0.8, 0.5) }));
  };

  const isStationOnRoute = useCallback((stationId) => {
    return highlightedRoute?.includes(stationId);
  }, [highlightedRoute]);

  const routeSegments = useMemo(() => {
    if (!highlightedRoute || highlightedRoute.length < 2) return [];
    
    const segments = [];
    let currentLineId = null;
    let segmentStations = [];

    for (let i = 0; i < highlightedRoute.length; i++) {
      const stationId = highlightedRoute[i];
      const station = network.stations[stationId];
      if (!station) continue;

      // First station just gets added to the segment
      if (i === 0) {
        segmentStations.push(station);
        continue;
      }

      const prevStationId = highlightedRoute[i - 1];
      const prevStation = network.stations[prevStationId];
      
      /**
       * Find which line connects these two consecutive stations
       * A line connects them if both stations appear in the line's station list
       * AND they are adjacent in that list (index difference of 1)
       */
      let connectingLine = null;
      for (const line of network.lines) {
        const prevIdx = line.stations.indexOf(prevStationId);
        const currIdx = line.stations.indexOf(stationId);
        if (prevIdx !== -1 && currIdx !== -1 && Math.abs(prevIdx - currIdx) === 1) {
          connectingLine = line;
          break;
        }
      }

      if (connectingLine) {
        // Line change detected - save previous segment and start new one
        if (currentLineId !== connectingLine.id) {
          if (segmentStations.length > 1 && currentLineId) {
            const prevLine = network.lines.find(l => l.id === currentLineId);
            segments.push({
              line: prevLine,
              stations: [...segmentStations],
            });
          }
          currentLineId = connectingLine.id;
          // Include previous station as it's the start of the new segment
          segmentStations = [prevStation, station];
        } else {
          // Same line - just add to current segment
          segmentStations.push(station);
        }
      }
    }

    // Don't forget the last segment
    if (segmentStations.length > 1 && currentLineId) {
      const line = network.lines.find(l => l.id === currentLineId);
      segments.push({
        line,
        stations: segmentStations,
      });
    }

    return segments;
  }, [highlightedRoute, network]);

  const renderLine = (line) => {
    const stations = line.stations.map(id => network.stations[id]).filter(Boolean);
    if (stations.length < 2) return null;

    const pathData = stations.map((station, index) => {
      const { x, y } = station.coordinates;
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    // Dim non-route lines when a journey is highlighted
    const opacity = highlightedRoute ? 0.12 : 1;

    return (
      <g key={line.id}>
        <path
          d={pathData}
          stroke={line.color}
          strokeWidth={6}
          fill="none"
          strokeLinecap="round"    // Rounded line ends
          strokeLinejoin="round"   // Rounded corners
          opacity={opacity}
          style={{ transition: 'opacity 0.4s ease' }}
        />
      </g>
    );
  };

  const renderJourneyPath = () => {
    if (!routeSegments.length) return null;

    return (
      // Key changes when route changes, forcing animation replay
      <g key={`journey-${animationKey}`}>
        {routeSegments.map((segment, segIndex) => {
          // Build SVG path for this segment
          const pathData = segment.stations.map((station, index) => {
            const { x, y } = station.coordinates;
            return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
          }).join(' ');

          // Calculate path length for animation using Euclidean distance
          let segmentLength = 0;
          for (let i = 1; i < segment.stations.length; i++) {
            const prev = segment.stations[i - 1].coordinates;
            const curr = segment.stations[i].coordinates;
            segmentLength += Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
          }

          // Stagger animation for multi-segment journeys
          // Each segment starts 0.2s after the previous
          const delay = segIndex * 0.2;

          return (
            <g key={`seg-${segIndex}`}>
              <path
                d={pathData}
                stroke={segment.line.color}
                strokeWidth={8}  // Thicker than regular lines for emphasis
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  // Set up the dash pattern for drawing animation
                  strokeDasharray: segmentLength,
                  strokeDashoffset: segmentLength, // Start fully hidden
                  // CSS animation draws the path over 0.6s
                  animation: `drawRoutePath 0.6s ease-out ${delay}s forwards`,
                }}
              />
            </g>
          );
        })}

        {/* Render interchange indicators at line change points */}
        {routeSegments.length > 1 && routeSegments.slice(0, -1).map((segment, idx) => {
          const lastStation = segment.stations[segment.stations.length - 1];
          const { x, y } = lastStation.coordinates;
          
          return (
            <circle
              key={`interchange-marker-${idx}`}
              cx={x}
              cy={y}
              r={16}
              fill="none"
              stroke="#F59E0B"  // Amber color for interchange markers
              strokeWidth={2}
              opacity={0.5}
              className="interchange-indicator"
            />
          );
        })}
      </g>
    );
  };

  const renderStation = (station) => {
    const { x, y } = station.coordinates;
    const isOnRoute = isStationOnRoute(station.id);
    const isHovered = hoveredStation === station.id;
    
    // Dim stations not on route when a journey is highlighted
    const opacity = highlightedRoute ? (isOnRoute ? 1 : 0.15) : 1;
    
    // Interchange stations are larger for visual distinction
    const radius = station.isInterchange ? 10 : 7;

    // Check if this is the start or end of the highlighted route
    const isRouteEndpoint = highlightedRoute && 
      (station.id === highlightedRoute[0] || station.id === highlightedRoute[highlightedRoute.length - 1]);

    return (
      <g
        key={station.id}
        data-station={station.id}  // Used to detect station clicks vs pan drags
        onClick={() => onStationClick?.(station)}
        onMouseEnter={() => setHoveredStation(station.id)}
        onMouseLeave={() => setHoveredStation(null)}
        className="cursor-pointer"
        role="button"
        aria-label={`${station.name}${station.isInterchange ? ' (Interchange)' : ''}`}
        tabIndex={0}  // Make focusable for keyboard navigation
        style={{ opacity, transition: 'opacity 0.4s ease' }}
      >
        {/* Glow ring for route endpoints */}
        {isRouteEndpoint && (
          <circle
            cx={x}
            cy={y}
            r={radius + 6}
            fill={station.lineDetails[0]?.color || '#666'}
            opacity={0.2}
          />
        )}
        
        {station.isInterchange ? (
          // Interchange station: white circle with colored dots positioned around center
          <>
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill="white"
              stroke="#374151"  // Gray border
              strokeWidth={2.5}
            />
            {/* Colored dots for each line passing through */}
            {station.lineDetails.map((line, idx) => {
              // Position dots evenly around the center
              const angle = (idx * 360) / station.lineDetails.length - 90;
              const rad = (angle * Math.PI) / 180;
              const dotRadius = radius - 4;
              return (
                <circle
                  key={line.id}
                  cx={x + Math.cos(rad) * dotRadius * 0.5}
                  cy={y + Math.sin(rad) * dotRadius * 0.5}
                  r={2.5}
                  fill={line.color}
                />
              );
            })}
          </>
        ) : (
          /* Regular station: simple circle with line color */
          <circle
            cx={x}
            cy={y}
            r={radius}
            fill="white"
            stroke={station.lineDetails[0]?.color || '#666'}
            strokeWidth={3}
          />
        )}

        {/* Station name tooltip (shown on hover or for endpoints) */}
        {(isHovered || isRouteEndpoint) && (
          <g>
            <rect
              x={x - 55}
              y={y - 32}
              width={110}
              height={22}
              rx={4}
              fill="rgba(17, 24, 39, 0.9)"  // Dark semi-transparent background
            />
            <text
              x={x}
              y={y - 17}
              textAnchor="middle"
              fill="white"
              fontSize={11}
              fontWeight={500}
            >
              {station.name}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Zoom controls (top right) */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5">
        <button
          onClick={zoomIn}
          className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-colors border border-gray-200"
          aria-label="Zoom in"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-colors border border-gray-200"
          aria-label="Zoom out"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white transition-colors border border-gray-200"
          aria-label="Reset view"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Route info badge (top left, only shown when route is highlighted) */}
      {highlightedRoute && (
        <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur rounded-lg shadow-sm px-3 py-2 border border-gray-200">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-600">
              {highlightedRoute.length} stations
              {routeSegments.length > 1 && ` • ${routeSegments.length - 1} change${routeSegments.length > 2 ? 's' : ''}`}
            </span>
          </div>
        </div>
      )}

      {/* Main SVG canvas */}
      <svg
        ref={svgRef}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
        className="w-full h-[500px] select-none bg-gray-50/50"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* 
          Transform group handles pan and zoom
          All map content is nested inside this group
        */}
        <g
          transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
          style={{ transformOrigin: 'center' }}
        >
          {/* Layer 1: Metro lines (bottom) */}
          {network.lines.map(renderLine)}
          
          {/* Layer 2: Highlighted journey path (middle) */}
          {renderJourneyPath()}
          
          {/* Layer 3: Station nodes (top) */}
          {stationsList.map(renderStation)}
        </g>
      </svg>
    </div>
  );
}
