/**
 * Route Calculator Module
 * 
 * This module implements the core pathfinding algorithm for the metro booking system.
 * It uses a modified Dijkstra's algorithm to find multiple diverse routes between stations.
 * 
 * Key Concepts:
 * - Graph representation: Adjacency list where each station connects to its neighbors
 * - Edge weights: Travel duration + interchange penalty (switching lines costs extra time)
 * - K-shortest paths: We find up to 3 different routes using edge exclusion technique
 * 
 * Time Complexity: O(k * (V + E) log V) where k = number of routes, V = stations, E = connections
 * Space Complexity: O(V + E) for the graph representation
 */

import { patnaMetroNetwork, calculateFare } from '../data/patnaMetroNetwork';

/**
 * Priority Queue implementation for Dijkstra's algorithm
 * 
 * Why a custom PriorityQueue instead of array.sort() each time?
 * - Semantic clarity: enqueue/dequeue operations are intuitive
 * - Encapsulation: Queue behavior is self-contained
 * 
 * Note: This is a simple O(n log n) implementation using sort().
 * For production with large graphs, consider a binary heap O(log n) implementation.
 */
class PriorityQueue {
  constructor() {
    this.values = [];
  }

  enqueue(val, priority) {
    this.values.push({ val, priority });
    this.sort();
  }

  dequeue() {
    return this.values.shift();
  }

  sort() {
    this.values.sort((a, b) => a.priority - b.priority);
  }

  isEmpty() {
    return this.values.length === 0;
  }
}

/**
 * Builds an adjacency list graph from the metro network data
 * 
 * @param {Object} network - The metro network containing stations and connections
 * @param {Array} excludeEdges - Edges to exclude (used for finding alternative routes)
 * @returns {Object} Graph as adjacency list: { stationId: [{ station, duration, distance, line }] }
 * 
 * Why exclude edges?
 * When finding alternative routes, we exclude edges from the primary path.
 * This forces Dijkstra to find genuinely different routes instead of minor variations.
 * This technique is inspired by Yen's K-shortest paths algorithm.
 */
function buildGraph(network, excludeEdges = []) {
  const graph = {};
  
  // Initialize all stations with empty adjacency lists
  // This ensures even isolated stations exist in the graph
  for (const stationId of Object.keys(network.stations)) {
    graph[stationId] = [];
  }
  
  // Add bidirectional edges for each connection
  // Metro lines are bidirectional - you can travel both directions
  for (const connection of network.connections) {
    // Check if this edge should be excluded (for alternative route finding)
    const isExcluded = excludeEdges.some(
      e => (e.from === connection.from && e.to === connection.to) ||
           (e.from === connection.to && e.to === connection.from)
    );
    
    if (!isExcluded) {
      // Add edge A -> B
      graph[connection.from].push({
        station: connection.to,
        duration: connection.duration,
        distance: connection.distance,
        line: connection.line,
      });
      
      // Add edge B -> A (bidirectional)
      graph[connection.to].push({
        station: connection.from,
        duration: connection.duration,
        distance: connection.distance,
        line: connection.line,
      });
    }
  }
  
  return graph;
}

/**
 * Dijkstra's Algorithm Implementation
 * 
 * Finds the shortest path between two stations using travel time as the weight.
 * 
 * Key modification: INTERCHANGE PENALTY
 * When a passenger switches from one line to another, we add a 2-minute penalty.
 * This reflects real-world time lost walking between platforms.
 * 
 * @param {Object} graph - Adjacency list representation of the metro network
 * @param {string} sourceId - Starting station ID
 * @param {string} destinationId - Target station ID
 * @param {Object} network - Full network data for station lookups
 * @returns {Object|null} { path: [{stationId, line}], distance: number } or null if no path
 */
function dijkstra(graph, sourceId, destinationId, network) {
  // Validate that both stations exist in the graph
  if (!graph[sourceId] || !graph[destinationId]) {
    return null;
  }

  // distances[station] = shortest known time to reach this station
  const distances = {};
  // previous[station] = the station we came from on the shortest path
  const previous = {};
  // previousLine[station] = which metro line we used to reach this station
  // Needed to calculate interchange penalties and build the final path
  const previousLine = {};
  const pq = new PriorityQueue();
  
  // Initialize all stations with infinite distance (unvisited)
  for (const stationId of Object.keys(network.stations)) {
    distances[stationId] = Infinity;
    previous[stationId] = null;
    previousLine[stationId] = null;
  }
  
  // Source station has distance 0
  distances[sourceId] = 0;
  pq.enqueue(sourceId, 0);
  
  // Main Dijkstra loop
  while (!pq.isEmpty()) {
    const { val: currentStation } = pq.dequeue();
    
    // Early termination: if we've reached destination, we have the shortest path
    if (currentStation === destinationId) {
      break;
    }
    
    // Skip if we've already found a shorter path to this station
    // (can happen with our simple priority queue implementation)
    if (distances[currentStation] === Infinity) {
      continue;
    }
    
    // Explore all neighbors
    for (const neighbor of graph[currentStation]) {
      const currentLine = previousLine[currentStation];
      
      // INTERCHANGE PENALTY: Add 2 minutes if switching lines
      // This reflects real-world time: walking to different platform, waiting for train
      const interchangePenalty = currentLine && currentLine !== neighbor.line ? 2 : 0;
      
      const newDistance = distances[currentStation] + neighbor.duration + interchangePenalty;
      
      // Relaxation step: if we found a shorter path, update
      if (newDistance < distances[neighbor.station]) {
        distances[neighbor.station] = newDistance;
        previous[neighbor.station] = currentStation;
        previousLine[neighbor.station] = neighbor.line;
        pq.enqueue(neighbor.station, newDistance);
      }
    }
  }
  
  // If destination is still at infinity, no path exists
  if (distances[destinationId] === Infinity) {
    return null;
  }
  
  // Reconstruct path by backtracking from destination to source
  const path = [];
  let current = destinationId;
  
  while (current) {
    path.unshift({
      stationId: current,
      line: previousLine[current],
    });
    current = previous[current];
  }
  
  return { path, distance: distances[destinationId] };
}

/**
 * Simple route finder - returns a single optimal route
 * Used for quick lookups when only one route is needed
 */
export function findRoute(sourceId, destinationId) {
  const network = patnaMetroNetwork;
  const graph = buildGraph(network);
  const result = dijkstra(graph, sourceId, destinationId, network);
  
  if (!result) return null;
  
  return buildRouteResult(result.path, network);
}

/**
 * Transforms the raw Dijkstra path into a user-friendly route object
 * 
 * Groups consecutive stations on the same line into "segments" for cleaner display.
 * Example: [A, B, C] on Red Line + [C, D] on Blue Line = 2 segments
 * 
 * @param {Array} path - Array of { stationId, line } from Dijkstra
 * @param {Object} network - Network data for station/line lookups
 * @returns {Object} Route with segments, duration, fare, etc.
 */
function buildRouteResult(path, network) {
  if (path.length < 2) return null;
  
  const segments = [];
  let currentSegment = null;
  let totalDistance = 0;
  
  // Iterate through path, grouping consecutive same-line stations
  for (let i = 1; i < path.length; i++) {
    const fromId = path[i - 1].stationId;
    const toId = path[i].stationId;
    const lineId = path[i].line;
    
    // Find the connection to get distance data
    const connection = network.connections.find(
      c => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
    );
    
    if (connection) {
      totalDistance += connection.distance;
    }
    
    // Check if we need to start a new segment (different line or first segment)
    if (!currentSegment || currentSegment.line.id !== lineId) {
      // Save previous segment if exists
      if (currentSegment) {
        segments.push(currentSegment);
      }
      
      // Start new segment
      const line = network.lines.find(l => l.id === lineId);
      currentSegment = {
        line: {
          id: line.id,
          name: line.name,
          color: line.color,
        },
        fromStation: network.stations[fromId],
        toStation: network.stations[toId],
        stops: [network.stations[fromId], network.stations[toId]],
        duration: connection?.duration || 0,
        distance: connection?.distance || 0,
        isInterchange: segments.length > 0, // True if this isn't the first segment
      };
    } else {
      // Continue current segment - same line
      currentSegment.toStation = network.stations[toId];
      currentSegment.stops.push(network.stations[toId]);
      currentSegment.duration += connection?.duration || 0;
      currentSegment.distance += connection?.distance || 0;
    }
  }
  
  // Don't forget to add the last segment
  if (currentSegment) {
    segments.push(currentSegment);
  }
  
  // Calculate summary statistics
  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
  const totalStops = path.length;
  const interchanges = segments.length - 1; // Number of line changes
  const fare = calculateFare(totalDistance);
  
  return {
    segments,
    totalDuration,
    totalStops,
    totalDistance,
    interchanges,
    fare,
    path: path.map(p => p.stationId), // Flat array of station IDs for map highlighting
  };
}

/**
 * Extracts edges from a path for use in alternative route finding
 * 
 * @param {Array} path - Array of { stationId, line }
 * @returns {Array} Array of { from, to } edge objects
 */
function getPathEdges(path) {
  const edges = [];
  for (let i = 0; i < path.length - 1; i++) {
    edges.push({
      from: path[i].stationId,
      to: path[i + 1].stationId,
    });
  }
  return edges;
}

/**
 * Determines if two paths are too similar to both be shown
 * 
 * Uses Jaccard similarity: intersection / union
 * If paths share more than threshold% of stations, they're considered too similar.
 * 
 * Why 70-80% threshold?
 * - Too low (50%): Would show nearly identical routes
 * - Too high (90%): Would miss genuinely useful alternatives
 * - 70-80% strikes a balance: routes must differ meaningfully
 * 
 * @param {Array} path1 - First path (array of station IDs)
 * @param {Array} path2 - Second path (array of station IDs)
 * @param {number} threshold - Similarity threshold (0-1)
 * @returns {boolean} True if paths are too similar
 */
function arePathsSimilar(path1, path2, threshold = 0.7) {
  const set1 = new Set(path1);
  const set2 = new Set(path2);
  const intersection = [...set1].filter(x => set2.has(x)).length;
  const union = new Set([...set1, ...set2]).size;
  return intersection / union > threshold;
}

/**
 * Main route finder - returns multiple diverse routes
 * 
 * STRATEGY FOR FINDING MULTIPLE ROUTES:
 * 1. Find the optimal (shortest) path using standard Dijkstra
 * 2. Find alternatives by excluding edges from the primary path
 *    - This forces Dijkstra to find genuinely different routes
 * 3. Try routing through interchange stations as waypoints
 *    - Sometimes a slightly longer route through a major hub is preferable
 * 4. Filter out routes that are too similar (>80% shared stations)
 * 5. Sort by duration and mark shortest as "Recommended"
 * 
 * @param {string} sourceId - Starting station ID
 * @param {string} destinationId - Target station ID
 * @param {number} maxRoutes - Maximum number of routes to return (default: 3)
 * @returns {Array} Array of route objects, sorted by duration
 */
export function findAllRoutes(sourceId, destinationId, maxRoutes = 3) {
  const network = patnaMetroNetwork;
  const routes = [];
  const foundPaths = []; // Track found paths to check similarity
  
  // STEP 1: Find the primary (shortest) route
  const graph = buildGraph(network);
  const primaryResult = dijkstra(graph, sourceId, destinationId, network);
  
  if (!primaryResult) {
    return []; // No path exists between these stations
  }
  
  const primaryRoute = buildRouteResult(primaryResult.path, network);
  if (primaryRoute) {
    routes.push({ ...primaryRoute, isRecommended: true });
    foundPaths.push(primaryResult.path.map(p => p.stationId));
  }
  
  // STEP 2: Find alternatives by excluding middle edges of primary path
  // We skip first and last edges because excluding them often makes path impossible
  const primaryEdges = getPathEdges(primaryResult.path);
  for (let i = 1; i < primaryEdges.length - 1 && routes.length < maxRoutes; i++) {
    const excludeEdge = primaryEdges[i];
    const modifiedGraph = buildGraph(network, [excludeEdge]);
    const altResult = dijkstra(modifiedGraph, sourceId, destinationId, network);
    
    if (altResult) {
      const altPath = altResult.path.map(p => p.stationId);
      
      // Check if this alternative is genuinely different from existing routes
      const isSimilar = foundPaths.some(fp => arePathsSimilar(fp, altPath, 0.8));
      
      if (!isSimilar) {
        const altRoute = buildRouteResult(altResult.path, network);
        if (altRoute) {
          routes.push({ ...altRoute, isRecommended: false });
          foundPaths.push(altPath);
        }
      }
    }
  }
  
  // STEP 3: Try routing through major interchange stations
  // Sometimes going via a hub provides a good alternative even if slightly longer
  const interchangeStations = Object.values(network.stations)
    .filter(s => s.isInterchange && s.id !== sourceId && s.id !== destinationId);
  
  for (const interchange of interchangeStations) {
    if (routes.length >= maxRoutes) break;
    
    // Find path: source -> interchange -> destination
    const toInterchange = dijkstra(graph, sourceId, interchange.id, network);
    const fromInterchange = dijkstra(graph, interchange.id, destinationId, network);
    
    if (toInterchange && fromInterchange) {
      // Combine paths, avoiding duplicate of interchange station
      const combinedPath = [
        ...toInterchange.path,
        ...fromInterchange.path.slice(1), // Skip first element (interchange) to avoid duplicate
      ];
      
      const altPath = combinedPath.map(p => p.stationId);
      const isSimilar = foundPaths.some(fp => arePathsSimilar(fp, altPath, 0.8));
      
      // Only include if not too similar AND not more than 50% longer than optimal
      if (!isSimilar) {
        const altRoute = buildRouteResult(combinedPath, network);
        if (altRoute && altRoute.totalDuration <= routes[0].totalDuration * 1.5) {
          routes.push({ ...altRoute, isRecommended: false });
          foundPaths.push(altPath);
        }
      }
    }
  }
  
  // STEP 4: Sort all routes by duration (shortest first)
  routes.sort((a, b) => a.totalDuration - b.totalDuration);
  
  // STEP 5: Mark the shortest route as recommended
  // Reset all flags first (in case order changed after sorting)
  if (routes.length > 0) {
    routes.forEach(r => r.isRecommended = false);
    routes[0].isRecommended = true;
  }
  
  return routes.slice(0, maxRoutes);
}
