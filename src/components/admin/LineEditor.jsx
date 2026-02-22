import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMetro } from '../../context/MetroContext';
import { useAdmin } from '../../context/AdminContext';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Card from '../ui/Card';
import { useToast } from '../ui/Toast';

function SortableStationItem({ station, lineColor, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: station.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg
        ${isDragging ? 'shadow-lg' : 'shadow-sm'}
      `}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>

      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: lineColor }}
      />

      <div className="flex-1">
        <span className="font-medium text-gray-900">{station.name}</span>
        {station.isInterchange && (
          <Badge variant="interchange" size="sm" className="ml-2">
            Interchange
          </Badge>
        )}
      </div>

      <button
        onClick={() => onRemove(station.id)}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
        aria-label={`Remove ${station.name}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default function LineEditor() {
  const { network, setNetwork, resetNetwork } = useMetro();
  const { selectedLine, selectLine } = useAdmin();
  const toast = useToast();
  const [newStationName, setNewStationName] = useState('');

  const handleResetNetwork = () => {
    if (window.confirm('Reset all changes to default? This cannot be undone.')) {
      resetNetwork();
      toast.success('Network reset to default');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const currentLine = selectedLine || network.lines[0];
  const lineStations = currentLine?.stations
    .map(id => network.stations[id])
    .filter(Boolean) || [];

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = lineStations.findIndex(s => s.id === active.id);
      const newIndex = lineStations.findIndex(s => s.id === over.id);

      const newStationOrder = arrayMove(lineStations, oldIndex, newIndex);
      
      setNetwork(prev => ({
        ...prev,
        lines: prev.lines.map(line => 
          line.id === currentLine.id
            ? { ...line, stations: newStationOrder.map(s => s.id) }
            : line
        ),
      }));

      toast.success('Station order updated');
    }
  };

  const handleRemoveStation = (stationId) => {
    setNetwork(prev => ({
      ...prev,
      lines: prev.lines.map(line =>
        line.id === currentLine.id
          ? { ...line, stations: line.stations.filter(id => id !== stationId) }
          : line
      ),
    }));
    toast.success('Station removed from line');
  };

  const handleAddStation = () => {
    if (!newStationName.trim()) return;

    const stationId = newStationName.toLowerCase().replace(/\s+/g, '-');
    
    if (network.stations[stationId]) {
      toast.error('Station already exists');
      return;
    }

    const newStation = {
      id: stationId,
      name: newStationName,
      lines: [currentLine.id],
      isInterchange: false,
      coordinates: { x: 500, y: 250 },
      facilities: [],
      zone: 1,
    };

    setNetwork(prev => ({
      ...prev,
      stations: { ...prev.stations, [stationId]: newStation },
      lines: prev.lines.map(line =>
        line.id === currentLine.id
          ? { ...line, stations: [...line.stations, stationId] }
          : line
      ),
    }));

    setNewStationName('');
    toast.success('Station added successfully');
  };

  return (
    <div className="grid md:grid-cols-[240px,1fr] gap-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">Metro Lines</h3>
          <button
            onClick={handleResetNetwork}
            className="text-xs text-gray-500 hover:text-red-500 transition-colors"
            title="Reset to default"
          >
            Reset
          </button>
        </div>
        {network.lines.map(line => (
          <button
            key={line.id}
            onClick={() => selectLine(line)}
            className={`
              w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors
              ${currentLine?.id === line.id 
                ? 'bg-gray-100 border-2 border-gray-300' 
                : 'bg-white border border-gray-200 hover:bg-gray-50'}
            `}
          >
            <div
              className="w-4 h-12 rounded"
              style={{ backgroundColor: line.color }}
            />
            <div>
              <p className="font-medium text-gray-900">{line.name}</p>
              <p className="text-sm text-gray-500">{line.stations.length} stations</p>
            </div>
          </button>
        ))}
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-8 rounded"
                style={{ backgroundColor: currentLine?.color }}
              />
              <div>
                <h3 className="font-semibold text-gray-900">{currentLine?.name}</h3>
                <p className="text-sm text-gray-500">{lineStations.length} stations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newStationName}
              onChange={(e) => setNewStationName(e.target.value)}
              placeholder="New station name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-metro-blue focus:border-metro-blue"
              onKeyDown={(e) => e.key === 'Enter' && handleAddStation()}
            />
            <Button onClick={handleAddStation} disabled={!newStationName.trim()}>
              Add Station
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lineStations.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {lineStations.map((station, index) => (
                  <div key={station.id} className="flex items-center gap-2">
                    <span className="w-6 text-center text-sm text-gray-400">{index + 1}</span>
                    <div className="flex-1">
                      <SortableStationItem
                        station={station}
                        lineColor={currentLine?.color}
                        onRemove={handleRemoveStation}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {lineStations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No stations in this line. Add one above.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
