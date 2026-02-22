import { useState, useCallback } from 'react';
import { useMetro } from '../../context/MetroContext';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  return lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const row = { _rowIndex: index + 2 };
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    return row;
  });
}

function parseJSON(text) {
  try {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      return data.map((item, index) => ({ ...item, _rowIndex: index + 1 }));
    }
    if (data.stations && Array.isArray(data.stations)) {
      return data.stations.map((item, index) => ({ ...item, _rowIndex: index + 1 }));
    }
    return [];
  } catch {
    return [];
  }
}

function validateImportData(data, existingStations, network) {
  const errors = [];
  const valid = [];
  const interchanges = [];
  const existingWarnings = [];
  const seenIds = new Set();

  for (const row of data) {
    const rowErrors = [];
    
    const id = row.id || row.station_id || row.stationId || '';
    const name = row.name || row.station_name || row.stationName || '';
    const line = row.line || row.line_id || row.lineId || '';
    const connectTo = row.connect_to || row.connectTo || '';
    
    // Parse is_interchange flag from CSV (accepts true/false, yes/no, 1/0)
    const isInterchangeFlag = row.is_interchange || row.isInterchange || row.interchange || '';
    const isMarkedAsInterchange = ['true', 'yes', '1'].includes(isInterchangeFlag.toString().toLowerCase());

    if (!id) {
      rowErrors.push({ field: 'id', error: 'Station ID is required' });
    }
    if (!name) {
      rowErrors.push({ field: 'name', error: 'Station name is required' });
    }
    if (!line) {
      rowErrors.push({ field: 'line', error: 'Line is required' });
    }

    if (id && seenIds.has(id)) {
      rowErrors.push({ field: 'id', error: 'Duplicate ID in import file' });
    }
    seenIds.add(id);

    // Check if station already exists by ID
    const stationIdNormalized = id.toLowerCase().replace(/\s+/g, '-');
    const existingStationById = existingStations[stationIdNormalized] || existingStations[id];
    
    // Check by name match for interchange detection
    const existingByName = Object.values(existingStations).find(
      s => s.name.toLowerCase() === name.toLowerCase()
    );

    // Determine the status of this station
    let stationStatus = 'new'; // new, interchange, exists
    let existingStationRef = null;

    if (existingStationById) {
      // Station with same ID already exists - this is a duplicate
      stationStatus = 'exists';
      existingStationRef = existingStationById;
    } else if (isMarkedAsInterchange && existingByName) {
      // Marked as interchange AND a station with same name exists
      stationStatus = 'interchange';
      existingStationRef = existingByName;
    } else if (existingByName && !isMarkedAsInterchange) {
      // Station with same name exists but not marked as interchange - warn user
      stationStatus = 'exists_by_name';
      existingStationRef = existingByName;
    }

    if (rowErrors.length > 0) {
      errors.push({ row: row._rowIndex, errors: rowErrors, data: row });
    } else if (stationStatus === 'exists') {
      // Station ID already exists - add to warnings
      existingWarnings.push({
        row: row._rowIndex,
        id,
        name,
        line,
        existingStation: existingStationRef,
        reason: 'Station ID already exists in system'
      });
    } else if (stationStatus === 'exists_by_name' && !isMarkedAsInterchange) {
      // Station name exists but not marked as interchange - add to warnings
      existingWarnings.push({
        row: row._rowIndex,
        id,
        name,
        line,
        existingStation: existingStationRef,
        reason: `Station "${name}" already exists. Mark is_interchange=true to create interchange.`
      });
    } else {
      const stationData = {
        id,
        name,
        line,
        coordinates: {
          x: parseInt(row.x) || 500,
          y: parseInt(row.y) || 250,
        },
        facilities: (row.facilities || '').split(';').filter(Boolean),
        zone: parseInt(row.zone) || 1,
        connectTo: connectTo || null,
        isMarkedAsInterchange,
        stationStatus,
      };

      if (stationStatus === 'interchange') {
        stationData.willBeInterchange = true;
        stationData.existingStationId = existingStationRef.id;
        stationData.existingLines = existingStationRef.lines || [];
        interchanges.push(stationData);
      }
      
      valid.push(stationData);
    }
  }

  return { valid, errors, interchanges, existingWarnings };
}

// Confirmation Modal Component
function ConfirmationModal({ isOpen, onClose, onConfirm, validData, interchanges, skippedCount, isImporting }) {
  if (!isOpen) return null;

  const newStationsCount = (validData?.length || 0) - (interchanges?.length || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#90E0EF] rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-[#0077B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Are you sure you want to add?</h3>
              <p className="text-sm text-gray-500">Please confirm to proceed with the import</p>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-700">{newStationsCount}</p>
                <p className="text-sm text-green-600">New Stations</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">{interchanges?.length || 0}</p>
                <p className="text-sm text-purple-600">Interchanges</p>
              </div>
            </div>

            {skippedCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-medium">{skippedCount}</span> station(s) will be skipped (already exist in system)
                </p>
              </div>
            )}

            {interchanges.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-purple-800 mb-2">
                      Interchange stations to be created:
                    </p>
                    <ul className="text-sm text-purple-700 space-y-1">
                      {interchanges.map((station, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          <span className="font-medium">{station.name}</span>
                          <span className="text-purple-500">
                            ({station.existingLines?.join(', ') || 'existing'} → +{station.line})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 font-medium mb-2">What will happen after confirmation:</p>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  New stations will be added to the network
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Metro map will be updated automatically
                </li>
                {interchanges.length > 0 && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Interchange connections will be created
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  All changes will be persisted (saved)
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isImporting}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={onConfirm}
            loading={isImporting}
          >
            {isImporting ? 'Importing...' : 'Yes, Import Stations'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BulkImport() {
  const { network, setNetwork } = useMetro();
  const { importData, importStatus, importErrors, setImportData, setImportStatus, setImportErrors, resetImport } = useAdmin();
  const toast = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [validatedData, setValidatedData] = useState(null);
  const [interchangeStations, setInterchangeStations] = useState([]);
  const [existingStationWarnings, setExistingStationWarnings] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const processFile = useCallback(async (file) => {
    const text = await file.text();
    const isJSON = file.name.endsWith('.json') || file.type === 'application/json';
    
    const data = isJSON ? parseJSON(text) : parseCSV(text);
    
    if (data.length === 0) {
      toast.error('No valid data found in file');
      return;
    }

    const { valid, errors, interchanges, existingWarnings } = validateImportData(data, network.stations, network);
    
    setImportData(data);
    setImportErrors(errors);
    setValidatedData(valid);
    setInterchangeStations(interchanges);
    setExistingStationWarnings(existingWarnings || []);
    setImportStatus('preview');
    
    if (errors.length > 0 || existingWarnings.length > 0) {
      const totalIssues = errors.length + existingWarnings.length;
      toast.warning(`Found ${totalIssues} rows with issues`);
    } else {
      const interchangeMsg = interchanges.length > 0 
        ? ` (${interchanges.length} will be interchanges)` 
        : '';
      toast.success(`${valid.length} stations ready to import${interchangeMsg}`);
    }
  }, [network, setImportData, setImportErrors, setImportStatus, toast]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer?.files?.[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.json'))) {
      processFile(file);
    } else {
      toast.error('Please upload a CSV or JSON file');
    }
  }, [processFile, toast]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleShowConfirmation = () => {
    if (!validatedData || validatedData.length === 0) return;
    setShowConfirmModal(true);
  };

  /**
   * handleImport - Core import logic that updates the entire metro network
   * 
   * This function handles three types of station imports:
   * 1. New stations on a NEW line (creates line + stations + connections)
   * 2. New stations on an EXISTING line (appends to line + creates connections)
   * 3. Interchange stations (updates existing station to connect multiple lines)
   * 
   * The import order matters: stations are processed in CSV order to maintain
   * the correct sequence for connection creation between consecutive stations.
   */
  const handleImport = async () => {
    if (!validatedData || validatedData.length === 0) return;

    setImportStatus('importing');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newStations = {};
      const updatedStations = {};
      const lineUpdates = {}; // Tracks which stations belong to which line
      const newLines = {}; // Tracks brand new lines that need to be created
      const newConnections = [];

      // Predefined colors for new lines - used when creating lines not in the original network
      const lineColors = {
        purple: '#9C27B0',
        orange: '#FF9800',
        pink: '#E91E63',
        cyan: '#00BCD4',
        brown: '#795548',
        indigo: '#3F51B5',
        teal: '#009688',
        lime: '#CDDC39',
      };

      for (const station of validatedData) {
        const stationId = station.id.toLowerCase().replace(/\s+/g, '-');
        
        /**
         * CASE 1: Interchange Station
         * When is_interchange=true and a station with same name exists,
         * we update the existing station to include the new line instead of
         * creating a duplicate. This creates a multi-line interchange point.
         */
        if (station.willBeInterchange && station.existingStationId) {
          const existingId = station.existingStationId;
          const existingStation = network.stations[existingId];
          
          if (existingStation) {
            // Update existing station to be an interchange
            updatedStations[existingId] = {
              ...existingStation,
              lines: [...new Set([...existingStation.lines, station.line])],
              isInterchange: true,
            };
            
            // Track this station for the new line's station list
            if (!lineUpdates[station.line]) {
              lineUpdates[station.line] = [];
            }
            lineUpdates[station.line].push(existingId);
            
            continue;
          }
        }
        
        /**
         * CASE 2: New Station
         * Create a new station entry with all required properties.
         * Coordinates default to center of map if not provided in CSV.
         */
        newStations[stationId] = {
          id: stationId,
          name: station.name,
          lines: [station.line],
          isInterchange: false,
          coordinates: station.coordinates,
          facilities: station.facilities,
          zone: station.zone,
        };

        // Track this station for its line
        if (!lineUpdates[station.line]) {
          lineUpdates[station.line] = [];
        }
        lineUpdates[station.line].push(stationId);

        /**
         * Handle explicit connections from CSV (connect_to column)
         * This allows custom connection paths instead of just consecutive stations
         */
        if (station.connectTo) {
          const connectToId = station.connectTo.toLowerCase().replace(/\s+/g, '-');
          newConnections.push({
            from: stationId,
            to: connectToId,
            line: station.line,
            distance: 1.5, // Default distance in km
            duration: 3,   // Default duration in minutes
          });
        }
      }

      // Update network with new stations, updated interchanges, and line updates
      setNetwork(prev => {
        // Merge all stations (existing + new + updated interchanges)
        const mergedStations = { 
          ...prev.stations, 
          ...newStations,
          ...updatedStations,
        };

        /**
         * Line Processing Strategy:
         * 1. First, update existing lines with any new stations
         * 2. Then, create brand new lines for line IDs not in the network
         * 
         * This ensures both extending existing lines and creating new lines work correctly.
         */
        let updatedLines = prev.lines.map(line => {
          if (lineUpdates[line.id]) {
            // Append new stations to existing line, avoiding duplicates
            return { 
              ...line, 
              stations: [...line.stations, ...lineUpdates[line.id].filter(s => !line.stations.includes(s))] 
            };
          }
          return line;
        });

        /**
         * Create NEW lines for any line IDs that don't exist in the network
         * This is crucial for importing stations on a brand new line like 'purple'
         */
        for (const lineId of Object.keys(lineUpdates)) {
          const lineExists = prev.lines.some(l => l.id === lineId);
          if (!lineExists) {
            // Generate a proper display name (capitalize first letter)
            const lineName = lineId.charAt(0).toUpperCase() + lineId.slice(1) + ' Line';
            
            // Use predefined color or generate a random one
            const lineColor = lineColors[lineId] || 
              `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
            
            updatedLines.push({
              id: lineId,
              name: lineName,
              color: lineColor,
              stations: lineUpdates[lineId], // All stations for this new line
            });
          }
        }

        // Add explicit connections from CSV
        let updatedConnections = [...prev.connections];
        for (const conn of newConnections) {
          const exists = updatedConnections.some(
            c => (c.from === conn.from && c.to === conn.to) || (c.from === conn.to && c.to === conn.from)
          );
          if (!exists) {
            updatedConnections.push(conn);
          }
        }

        /**
         * Auto-generate connections between consecutive stations in each line
         * This creates the "path" that the map will render as a line.
         * 
         * Connection logic:
         * 1. For existing lines: connect last existing station to first new station
         * 2. For all lines: connect consecutive new stations to each other
         */
        for (const lineId of Object.keys(lineUpdates)) {
          const lineStations = lineUpdates[lineId];
          const existingLine = prev.lines.find(l => l.id === lineId);
          const lastExistingStation = existingLine?.stations[existingLine.stations.length - 1];
          
          // Connect last existing station to first new station (for extending existing lines)
          if (lastExistingStation && lineStations.length > 0) {
            const firstNewStation = lineStations[0];
            const exists = updatedConnections.some(
              c => (c.from === lastExistingStation && c.to === firstNewStation) || 
                   (c.from === firstNewStation && c.to === lastExistingStation)
            );
            if (!exists) {
              updatedConnections.push({
                from: lastExistingStation,
                to: firstNewStation,
                line: lineId,
                distance: 1.5,
                duration: 3,
              });
            }
          }

          // Connect consecutive new stations to create the line path
          for (let i = 0; i < lineStations.length - 1; i++) {
            const from = lineStations[i];
            const to = lineStations[i + 1];
            const exists = updatedConnections.some(
              c => (c.from === from && c.to === to) || (c.from === to && c.to === from)
            );
            if (!exists) {
              updatedConnections.push({
                from,
                to,
                line: lineId,
                distance: 1.5,
                duration: 3,
              });
            }
          }
        }

        return {
          ...prev,
          stations: mergedStations,
          lines: updatedLines,
          connections: updatedConnections,
        };
      });

      setShowConfirmModal(false);
      setImportStatus('success');
      
      const interchangeCount = interchangeStations.length;
      const newCount = validatedData.length - interchangeCount;
      const msg = interchangeCount > 0 
        ? `Successfully imported ${newCount} new stations and updated ${interchangeCount} interchanges`
        : `Successfully imported ${validatedData.length} stations`;
      toast.success(msg);
    } catch (error) {
      setImportStatus('error');
      toast.error('Import failed. Please try again.');
    }
  };

  const handleReset = () => {
    resetImport();
    setValidatedData(null);
    setInterchangeStations([]);
    setExistingStationWarnings([]);
    setShowConfirmModal(false);
  };

  if (importStatus === 'success') {
    return (
      <Card className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Import Complete!</h3>
        <p className="text-gray-500 mb-6">{validatedData?.length} stations were successfully imported.</p>
        <Button onClick={handleReset}>Import More</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Upload Metro Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload a CSV or JSON file with station data. Required fields: id, name, line.
          Optional: x, y, facilities, zone, connect_to, is_interchange.
        </p>
        
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center transition-colors
            ${dragActive ? 'border-metro-blue bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          `}
        >
          <input
            type="file"
            accept=".csv,.json"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-gray-600 mb-1">
              <span className="text-metro-blue font-medium">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-400">CSV or JSON files only</p>
          </label>
        </div>
      </Card>

      {importStatus === 'preview' && importData && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Preview Import Data</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="success">{validatedData?.length || 0} valid</Badge>
              {interchangeStations.length > 0 && (
                <Badge variant="interchange">{interchangeStations.length} interchanges</Badge>
              )}
              {existingStationWarnings.length > 0 && (
                <Badge className="bg-amber-100 text-amber-800">{existingStationWarnings.length} already exist</Badge>
              )}
              {importErrors.length > 0 && (
                <Badge variant="danger">{importErrors.length} errors</Badge>
              )}
            </div>
          </div>

          {interchangeStations.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-purple-800">Interchange Stations Detected</p>
                  <p className="text-purple-700 mt-1">
                    {interchangeStations.length} station(s) marked with <code className="bg-purple-100 px-1 rounded">is_interchange=true</code> will 
                    connect to existing stations, creating interchange points.
                  </p>
                </div>
              </div>
            </div>
          )}

          {existingStationWarnings.length > 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-amber-800">Stations Already Exist</p>
                  <p className="text-amber-700 mt-1">
                    {existingStationWarnings.length} station(s) already exist in the system and will be skipped. 
                    To create an interchange, set <code className="bg-amber-100 px-1 rounded">is_interchange=true</code> in CSV.
                  </p>
                  <ul className="mt-2 space-y-1">
                    {existingStationWarnings.slice(0, 3).map((warn, idx) => (
                      <li key={idx} className="text-amber-700">
                        <span className="font-medium">{warn.name}</span> - {warn.reason}
                      </li>
                    ))}
                    {existingStationWarnings.length > 3 && (
                      <li className="text-amber-600">...and {existingStationWarnings.length - 3} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Row</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">ID</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Line</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Interchange Flag</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {importData.slice(0, 10).map((row, index) => {
                  const error = importErrors.find(e => e.row === row._rowIndex);
                  const stationId = (row.id || row.station_id || '').toLowerCase().replace(/\s+/g, '-');
                  const stationName = row.name || row.station_name || '';
                  const isInterchangeFlag = row.is_interchange || row.isInterchange || row.interchange || '';
                  const isMarkedInterchange = ['true', 'yes', '1'].includes(isInterchangeFlag.toString().toLowerCase());
                  
                  const isInterchange = interchangeStations.some(
                    s => s.id === stationId || s.name.toLowerCase() === stationName.toLowerCase()
                  );
                  const existsWarning = existingStationWarnings.find(
                    w => w.id === (row.id || row.station_id) || w.name.toLowerCase() === stationName.toLowerCase()
                  );
                  
                  let rowClass = '';
                  if (error) rowClass = 'bg-red-50';
                  else if (existsWarning) rowClass = 'bg-amber-50';
                  else if (isInterchange) rowClass = 'bg-purple-50';
                  
                  return (
                    <tr key={index} className={rowClass}>
                      <td className="px-4 py-2 text-gray-500">{row._rowIndex}</td>
                      <td className="px-4 py-2 font-mono text-xs">{row.id || row.station_id || '-'}</td>
                      <td className="px-4 py-2">{stationName || '-'}</td>
                      <td className="px-4 py-2">{row.line || row.line_id || '-'}</td>
                      <td className="px-4 py-2">
                        {isMarkedInterchange ? (
                          <span className="inline-flex items-center gap-1 text-purple-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {error ? (
                          <span className="text-red-600 text-xs">
                            {error.errors.map(e => e.error).join(', ')}
                          </span>
                        ) : existsWarning ? (
                          <Badge className="bg-amber-100 text-amber-800" size="sm">Already Exists</Badge>
                        ) : isInterchange ? (
                          <Badge variant="interchange" size="sm">Interchange</Badge>
                        ) : (
                          <Badge variant="success" size="sm">New Station</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {importData.length > 10 && (
              <p className="text-sm text-gray-500 text-center py-2">
                And {importData.length - 10} more rows...
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" onClick={handleReset}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleShowConfirmation}
              disabled={!validatedData || validatedData.length === 0}
            >
              Review & Import {validatedData?.length || 0} Stations
            </Button>
          </div>
        </Card>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleImport}
        validData={validatedData}
        interchanges={interchangeStations}
        skippedCount={existingStationWarnings.length}
        isImporting={importStatus === 'importing'}
      />

      <Card>
        <h3 className="font-semibold text-gray-900 mb-2">Sample CSV Format</h3>
        <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 overflow-x-auto">
{`id,name,line,x,y,facilities,zone,connect_to,is_interchange
station-1,New Station,purple,500,300,parking;accessibility,2,,false
station-2,Gandhi Maidan,purple,600,200,toilets,3,station-1,true
station-3,Another Station,purple,700,200,,2,station-2,false`}
        </pre>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2">
            <span className="font-medium text-sm text-gray-700 min-w-[130px]">Required fields:</span>
            <span className="text-sm text-gray-500">id, name, line</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-sm text-gray-700 min-w-[130px]">Optional fields:</span>
            <span className="text-sm text-gray-500">x, y, facilities, zone, connect_to, is_interchange</span>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-3">
            <p className="text-sm font-medium text-purple-800 mb-2">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              is_interchange Flag
            </p>
            <ul className="text-sm text-purple-700 space-y-1">
              <li><code className="bg-purple-100 px-1 rounded">true/yes/1</code> - Station will connect to existing station with same name (creates interchange)</li>
              <li><code className="bg-purple-100 px-1 rounded">false/no/0</code> - Normal new station</li>
              <li>If station already exists and flag is false, it will be skipped</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
