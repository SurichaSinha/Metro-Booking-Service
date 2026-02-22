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

function buildGraph(network) {
  const graph = {};

  for (const stationId of Object.keys(network.stations)) {
    graph[stationId] = [];
  }

  for (const connection of network.connections) {
    graph[connection.from].push({
      station: connection.to,
      duration: connection.duration,
      distance: connection.distance,
      line: connection.line,
    });

    graph[connection.to].push({
      station: connection.from,
      duration: connection.duration,
      distance: connection.distance,
      line: connection.line,
    });
  }

  return graph;
}

function calculateFare(distanceKm, fareRules) {
  const rule = fareRules.ranges.find((r) => distanceKm <= r.maxKm);
  return rule ? rule.fare : fareRules.ranges[fareRules.ranges.length - 1].fare;
}

function findShortestRoute(network, sourceId, destinationId) {
  const graph = buildGraph(network);

  if (!graph[sourceId] || !graph[destinationId]) {
    return null;
  }

  const distances = {};
  const previous = {};
  const previousLine = {};
  const pq = new PriorityQueue();

  for (const stationId of Object.keys(network.stations)) {
    distances[stationId] = Infinity;
    previous[stationId] = null;
    previousLine[stationId] = null;
  }

  distances[sourceId] = 0;
  pq.enqueue(sourceId, 0);

  while (!pq.isEmpty()) {
    const { val: currentStation } = pq.dequeue();

    if (currentStation === destinationId) {
      break;
    }

    if (distances[currentStation] === Infinity) {
      continue;
    }

    for (const neighbor of graph[currentStation]) {
      const currentLine = previousLine[currentStation];
      const interchangePenalty = currentLine && currentLine !== neighbor.line ? 2 : 0;
      const newDistance = distances[currentStation] + neighbor.duration + interchangePenalty;

      if (newDistance < distances[neighbor.station]) {
        distances[neighbor.station] = newDistance;
        previous[neighbor.station] = currentStation;
        previousLine[neighbor.station] = neighbor.line;
        pq.enqueue(neighbor.station, newDistance);
      }
    }
  }

  if (distances[destinationId] === Infinity) {
    return null;
  }

  const path = [];
  let current = destinationId;

  while (current) {
    path.unshift({
      stationId: current,
      line: previousLine[current],
    });
    current = previous[current];
  }

  return buildRouteResult(path, network);
}

function buildRouteResult(path, network) {
  if (path.length < 2) return null;

  const segments = [];
  let currentSegment = null;
  let totalDistance = 0;

  for (let i = 1; i < path.length; i++) {
    const fromId = path[i - 1].stationId;
    const toId = path[i].stationId;
    const lineId = path[i].line;

    const connection = network.connections.find(
      (c) => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId)
    );

    if (connection) {
      totalDistance += connection.distance;
    }

    if (!currentSegment || currentSegment.line.id !== lineId) {
      if (currentSegment) {
        segments.push(currentSegment);
      }

      const line = network.lines.find((l) => l.id === lineId);
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
        isInterchange: segments.length > 0,
      };
    } else {
      currentSegment.toStation = network.stations[toId];
      currentSegment.stops.push(network.stations[toId]);
      currentSegment.duration += connection?.duration || 0;
      currentSegment.distance += connection?.distance || 0;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);
  const totalStops = path.length;
  const interchanges = segments.length - 1;
  const fare = calculateFare(totalDistance, network.fareRules);

  return {
    segments,
    totalDuration,
    totalStops,
    totalDistance: Math.round(totalDistance * 10) / 10,
    interchanges,
    fare,
    path: path.map((p) => p.stationId),
  };
}

module.exports = {
  findShortestRoute,
  calculateFare,
};
