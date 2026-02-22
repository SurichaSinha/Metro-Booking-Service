export const patnaMetroNetwork = {
  lines: [
    {
      id: 'red',
      name: 'Red Line',
      color: '#E53935',
      stations: [
        'danapur-cantonment',
        'saguna-more',
        'rps-more',
        'rukanpura',
        'bailey-road',
        'patna-junction',
        'akashvani',
        'rajendra-nagar-terminal',
      ],
    },
    {
      id: 'blue',
      name: 'Blue Line',
      color: '#1E88E5',
      stations: [
        'patna-junction',
        'gandhi-maidan',
        'pmch',
        'patna-university',
        'patna-secretariat',
        'rajbansi-nagar',
        'malahi-pakri',
        'new-isbt',
      ],
    },
    {
      id: 'yellow',
      name: 'Yellow Line',
      color: '#FDD835',
      stations: [
        'patliputra',
        'boring-road',
        'sri-krishna-puri',
        'gandhi-maidan',
        'mithapur',
        'patna-city',
        'gulzarbagh',
      ],
    },
    {
      id: 'green',
      name: 'Green Line',
      color: '#43A047',
      stations: [
        'bailey-road',
        'kankarbagh',
        'lohia-nagar',
        'rajendra-nagar',
        'patna-university',
        'eco-park',
        'new-isbt',
      ],
    },
  ],
  stations: {
    // RED LINE - Horizontal at y=250
    'danapur-cantonment': {
      id: 'danapur-cantonment',
      name: 'Danapur Cantonment',
      lines: ['red'],
      isInterchange: false,
      coordinates: { x: 60, y: 250 },
      facilities: ['parking', 'accessibility'],
      zone: 1,
    },
    'saguna-more': {
      id: 'saguna-more',
      name: 'Saguna More',
      lines: ['red'],
      isInterchange: false,
      coordinates: { x: 130, y: 250 },
      facilities: ['parking'],
      zone: 1,
    },
    'rps-more': {
      id: 'rps-more',
      name: 'RPS More',
      lines: ['red'],
      isInterchange: false,
      coordinates: { x: 200, y: 250 },
      facilities: ['accessibility'],
      zone: 1,
    },
    'rukanpura': {
      id: 'rukanpura',
      name: 'Rukanpura',
      lines: ['red'],
      isInterchange: false,
      coordinates: { x: 270, y: 250 },
      facilities: [],
      zone: 2,
    },
    'bailey-road': {
      id: 'bailey-road',
      name: 'Bailey Road',
      lines: ['red', 'green'],
      isInterchange: true,
      coordinates: { x: 340, y: 250 },
      facilities: ['parking', 'accessibility'],
      zone: 2,
    },
    'patna-junction': {
      id: 'patna-junction',
      name: 'Patna Junction',
      lines: ['red', 'blue'],
      isInterchange: true,
      coordinates: { x: 420, y: 250 },
      facilities: ['parking', 'accessibility', 'toilets', 'food-court'],
      zone: 2,
    },
    'akashvani': {
      id: 'akashvani',
      name: 'Akashvani',
      lines: ['red'],
      isInterchange: false,
      coordinates: { x: 500, y: 250 },
      facilities: [],
      zone: 3,
    },
    'rajendra-nagar-terminal': {
      id: 'rajendra-nagar-terminal',
      name: 'Rajendra Nagar Terminal',
      lines: ['red'],
      isInterchange: false,
      coordinates: { x: 580, y: 250 },
      facilities: ['parking', 'accessibility'],
      zone: 3,
    },

    // BLUE LINE - Goes up from Patna Junction then right
    'gandhi-maidan': {
      id: 'gandhi-maidan',
      name: 'Gandhi Maidan',
      lines: ['blue', 'yellow'],
      isInterchange: true,
      coordinates: { x: 420, y: 170 },
      facilities: ['accessibility', 'toilets'],
      zone: 2,
    },
    'pmch': {
      id: 'pmch',
      name: 'PMCH',
      lines: ['blue'],
      isInterchange: false,
      coordinates: { x: 500, y: 130 },
      facilities: ['accessibility'],
      zone: 2,
    },
    'patna-university': {
      id: 'patna-university',
      name: 'Patna University',
      lines: ['blue', 'green'],
      isInterchange: true,
      coordinates: { x: 580, y: 100 },
      facilities: ['accessibility'],
      zone: 3,
    },
    'patna-secretariat': {
      id: 'patna-secretariat',
      name: 'Patna Secretariat',
      lines: ['blue'],
      isInterchange: false,
      coordinates: { x: 670, y: 100 },
      facilities: ['parking', 'accessibility'],
      zone: 3,
    },
    'rajbansi-nagar': {
      id: 'rajbansi-nagar',
      name: 'Rajbansi Nagar',
      lines: ['blue'],
      isInterchange: false,
      coordinates: { x: 760, y: 100 },
      facilities: [],
      zone: 3,
    },
    'malahi-pakri': {
      id: 'malahi-pakri',
      name: 'Malahi Pakri',
      lines: ['blue'],
      isInterchange: false,
      coordinates: { x: 850, y: 100 },
      facilities: ['parking'],
      zone: 4,
    },
    'new-isbt': {
      id: 'new-isbt',
      name: 'New ISBT',
      lines: ['blue', 'green'],
      isInterchange: true,
      coordinates: { x: 940, y: 100 },
      facilities: ['parking', 'accessibility', 'toilets', 'food-court'],
      zone: 4,
    },

    // YELLOW LINE - Diagonal from northwest to southeast via Gandhi Maidan
    'patliputra': {
      id: 'patliputra',
      name: 'Patliputra',
      lines: ['yellow'],
      isInterchange: false,
      coordinates: { x: 220, y: 80 },
      facilities: ['parking', 'accessibility'],
      zone: 1,
    },
    'boring-road': {
      id: 'boring-road',
      name: 'Boring Road',
      lines: ['yellow'],
      isInterchange: false,
      coordinates: { x: 280, y: 110 },
      facilities: ['parking'],
      zone: 2,
    },
    'sri-krishna-puri': {
      id: 'sri-krishna-puri',
      name: 'Sri Krishna Puri',
      lines: ['yellow'],
      isInterchange: false,
      coordinates: { x: 350, y: 140 },
      facilities: ['accessibility'],
      zone: 2,
    },
    // Gandhi Maidan is the interchange (defined above)
    'mithapur': {
      id: 'mithapur',
      name: 'Mithapur',
      lines: ['yellow'],
      isInterchange: false,
      coordinates: { x: 490, y: 200 },
      facilities: [],
      zone: 3,
    },
    'patna-city': {
      id: 'patna-city',
      name: 'Patna City',
      lines: ['yellow'],
      isInterchange: false,
      coordinates: { x: 560, y: 220 },
      facilities: ['parking', 'accessibility'],
      zone: 3,
    },
    'gulzarbagh': {
      id: 'gulzarbagh',
      name: 'Gulzarbagh',
      lines: ['yellow'],
      isInterchange: false,
      coordinates: { x: 630, y: 190 },
      facilities: ['parking'],
      zone: 4,
    },

    // GREEN LINE - Goes down from Bailey Road then curves up to meet Blue Line
    'kankarbagh': {
      id: 'kankarbagh',
      name: 'Kankarbagh',
      lines: ['green'],
      isInterchange: false,
      coordinates: { x: 380, y: 320 },
      facilities: ['parking', 'accessibility'],
      zone: 2,
    },
    'lohia-nagar': {
      id: 'lohia-nagar',
      name: 'Lohia Nagar',
      lines: ['green'],
      isInterchange: false,
      coordinates: { x: 450, y: 370 },
      facilities: ['accessibility'],
      zone: 2,
    },
    'rajendra-nagar': {
      id: 'rajendra-nagar',
      name: 'Rajendra Nagar',
      lines: ['green'],
      isInterchange: false,
      coordinates: { x: 540, y: 350 },
      facilities: ['parking'],
      zone: 3,
    },
    // Patna University is the interchange (defined above)
    'eco-park': {
      id: 'eco-park',
      name: 'Eco Park',
      lines: ['green'],
      isInterchange: false,
      coordinates: { x: 700, y: 150 },
      facilities: ['parking', 'accessibility'],
      zone: 4,
    },
    // New ISBT is the interchange (defined above)
  },
  connections: [
    // Red Line connections
    { from: 'danapur-cantonment', to: 'saguna-more', line: 'red', duration: 3, distance: 2.1 },
    { from: 'saguna-more', to: 'rps-more', line: 'red', duration: 2, distance: 1.5 },
    { from: 'rps-more', to: 'rukanpura', line: 'red', duration: 3, distance: 2.0 },
    { from: 'rukanpura', to: 'bailey-road', line: 'red', duration: 2, distance: 1.8 },
    { from: 'bailey-road', to: 'patna-junction', line: 'red', duration: 3, distance: 2.2 },
    { from: 'patna-junction', to: 'akashvani', line: 'red', duration: 2, distance: 1.6 },
    { from: 'akashvani', to: 'rajendra-nagar-terminal', line: 'red', duration: 3, distance: 2.0 },
    
    // Blue Line connections
    { from: 'patna-junction', to: 'gandhi-maidan', line: 'blue', duration: 2, distance: 1.4 },
    { from: 'gandhi-maidan', to: 'pmch', line: 'blue', duration: 2, distance: 1.5 },
    { from: 'pmch', to: 'patna-university', line: 'blue', duration: 3, distance: 2.0 },
    { from: 'patna-university', to: 'patna-secretariat', line: 'blue', duration: 2, distance: 1.8 },
    { from: 'patna-secretariat', to: 'rajbansi-nagar', line: 'blue', duration: 3, distance: 2.2 },
    { from: 'rajbansi-nagar', to: 'malahi-pakri', line: 'blue', duration: 2, distance: 1.6 },
    { from: 'malahi-pakri', to: 'new-isbt', line: 'blue', duration: 3, distance: 2.1 },
    
    // Yellow Line connections
    { from: 'patliputra', to: 'boring-road', line: 'yellow', duration: 3, distance: 2.0 },
    { from: 'boring-road', to: 'sri-krishna-puri', line: 'yellow', duration: 2, distance: 1.6 },
    { from: 'sri-krishna-puri', to: 'gandhi-maidan', line: 'yellow', duration: 3, distance: 2.1 },
    { from: 'gandhi-maidan', to: 'mithapur', line: 'yellow', duration: 2, distance: 1.4 },
    { from: 'mithapur', to: 'patna-city', line: 'yellow', duration: 3, distance: 1.9 },
    { from: 'patna-city', to: 'gulzarbagh', line: 'yellow', duration: 2, distance: 1.7 },
    
    // Green Line connections
    { from: 'bailey-road', to: 'kankarbagh', line: 'green', duration: 3, distance: 2.0 },
    { from: 'kankarbagh', to: 'lohia-nagar', line: 'green', duration: 2, distance: 1.5 },
    { from: 'lohia-nagar', to: 'rajendra-nagar', line: 'green', duration: 3, distance: 1.8 },
    { from: 'rajendra-nagar', to: 'patna-university', line: 'green', duration: 5, distance: 3.5 },
    { from: 'patna-university', to: 'eco-park', line: 'green', duration: 3, distance: 2.2 },
    { from: 'eco-park', to: 'new-isbt', line: 'green', duration: 4, distance: 2.8 },
  ],
  fareRules: {
    ranges: [
      { maxKm: 3, fare: 15 },
      { maxKm: 6, fare: 25 },
      { maxKm: 12, fare: 35 },
      { maxKm: Infinity, fare: 45 },
    ],
    interchangeSurcharge: 0,
  },
};

export const getStationById = (id) => patnaMetroNetwork.stations[id];

export const getLineById = (id) => patnaMetroNetwork.lines.find(l => l.id === id);

export const getStationsForLine = (lineId) => {
  const line = getLineById(lineId);
  if (!line) return [];
  return line.stations.map(stationId => patnaMetroNetwork.stations[stationId]);
};

export const calculateFare = (distanceKm) => {
  const rule = patnaMetroNetwork.fareRules.ranges.find(r => distanceKm <= r.maxKm);
  return rule ? rule.fare : patnaMetroNetwork.fareRules.ranges[patnaMetroNetwork.fareRules.ranges.length - 1].fare;
};
