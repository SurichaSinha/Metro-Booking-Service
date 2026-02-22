# Patna Metro Booking Service

A full-featured Metro Booking application for the Patna Metro network, featuring a passenger booking flow with route visualization, an interactive metro network map, and an admin panel for network management.

![Patna Metro](https://img.shields.io/badge/Patna-Metro-E53935?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwindcss)

## Features

### Passenger Booking Flow
- **Station Search**: Autocomplete with keyboard navigation and accessibility support
- **Smart Route Recommendations**: Finds multiple routes and recommends the fastest one
- **Route Visualization**: Timeline component showing line segments, interchanges, and duration
- **Journey Highlight on Map**: View your selected route highlighted on the network map
- **QR Ticket Generation**: Instant QR codes for booked tickets with download support
- **Recent Searches**: Last 5 journeys saved locally

### Interactive Metro Map
- **SVG Network Diagram**: Visual representation of all 4 Patna Metro lines
- **Zoom/Pan Controls**: Navigate the map with mouse wheel or touch gestures
- **Journey Highlighting**: Animated route path drawing with interchange indicators
- **Station Details**: Click any station for quick booking actions
- **Non-crossing Layout**: Lines are arranged to avoid visual overlapping

### Admin Panel
- **Line Management**: Drag-and-drop station reordering with persistence
- **Station Management**: Add/remove stations from lines
- **Bulk Import**: CSV/JSON file upload with validation
- **Reset to Default**: One-click restoration of original network configuration
- **Persistent Changes**: Admin modifications saved to localStorage

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS 4
- **State Management**: React Context + useReducer
- **Routing**: React Router v7
- **Data Fetching**: TanStack Query (React Query)
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- **Backend**: Node.js + Express

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd patna-metro-booking
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
npm run server:install
```

4. Install Playwright browsers (for E2E testing):
```bash
npx playwright install
```

### Development

Start the frontend development server:
```bash
npm run dev
```

Start the backend API server (in a separate terminal):
```bash
npm run server:dev
```

The frontend will be available at `http://localhost:5173`
The API will be available at `http://localhost:3001`

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
# Run unit tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

## Project Structure

```
patna-metro-booking/
├── src/
│   ├── components/
│   │   ├── ui/          # Atomic UI components (Button, Card, Badge, etc.)
│   │   ├── booking/     # Booking flow components
│   │   ├── map/         # Metro map components
│   │   └── admin/       # Admin panel components
│   ├── context/         # React Context providers
│   │   ├── BookingContext.jsx  # Booking state management
│   │   ├── MetroContext.jsx    # Network data + map highlighting
│   │   └── AdminContext.jsx    # Admin panel state
│   ├── hooks/           # Custom hooks
│   ├── services/        # API layer
│   ├── utils/           # Helper functions (route calculator)
│   ├── data/            # Static metro network data
│   └── pages/           # Route pages (Home, Book, Map, Admin)
├── server/              # Node.js backend
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   └── data/            # Metro network JSON
└── tests/
    └── e2e/             # Playwright E2E tests
```

## Patna Metro Network

### Lines

| Line | Color | Route | Stations |
|------|-------|-------|----------|
| **Red Line** | 🔴 | Danapur Cantonment → Rajendra Nagar Terminal | 8 |
| **Blue Line** | 🔵 | Patna Junction → New ISBT | 8 |
| **Yellow Line** | 🟡 | Patliputra → Gulzarbagh | 7 |
| **Green Line** | 🟢 | Bailey Road → New ISBT | 7 |

### Interchange Stations
- **Patna Junction** (Red + Blue Line)
- **Gandhi Maidan** (Blue + Yellow Line)
- **Bailey Road** (Red + Green Line)
- **Patna University** (Blue + Green Line)
- **New ISBT** (Blue + Green Line)

### Network Map Layout
```
         Patliputra                            New ISBT (🔵🟢)
              \                                  /   \
         Boring Road                    Eco Park    Malahi Pakri
                \                        /              |
           Sri Krishna Puri      Patna Univ (🔵🟢)  Rajbansi Nagar
                     \          /       |             |
                  Gandhi Maidan (🔵🟡)  |     Patna Secretariat
                        |       \       |
                       PMCH    Mithapur---Patna City---Gulzarbagh
                        |
[Red Line - Horizontal] |
Danapur--Saguna--RPS--Rukanpura--Bailey Road--Patna Jn--Akashvani--Raj Nagar Term
                           (🔴🟢)      (🔴🔵)
                              \
                         Kankarbagh
                              |
                         Lohia Nagar
                              |
                        Rajendra Nagar
                              |
                         (to Patna Univ)
```

### Fare Structure
| Distance | Fare |
|----------|------|
| 0-3 km | ₹15 |
| 3-6 km | ₹25 |
| 6-12 km | ₹35 |
| 12+ km | ₹45 |

## Key Features Explained

### Multiple Route Options
The route calculator uses a modified Dijkstra's algorithm to find up to 3 distinct routes:
1. **Shortest path** (by travel time) - marked as "Recommended"
2. **Alternative via different interchange stations**
3. **Alternative by excluding edges from primary path**

Routes are filtered to avoid showing highly similar paths (>80% overlap).

### Journey Highlighting on Map
When a route is selected:
- All non-journey lines are dimmed to 12% opacity
- The journey path is drawn with progressive animation
- Interchange stations show a subtle pulsing indicator
- Route endpoints display with a highlight ring

### Admin Persistence
Admin changes (station reordering, deletion, addition) are saved to localStorage:
- Changes persist across page refreshes
- "Reset" button restores the original network configuration
- Note: Route calculations use the static network data for consistency

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stations` | Get all stations |
| GET | `/api/stations/:id` | Get station by ID |
| GET | `/api/routes?from=X&to=Y` | Find route between stations |
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings/:reference` | Get booking by reference |
| GET | `/api/network` | Get full network data |

## Architecture Decisions

### Route Calculation
- Uses **Dijkstra's algorithm** for finding the shortest path
- Weights edges by travel duration
- Finds multiple routes via edge exclusion and interchange variations
- Sorts routes by duration; shortest is recommended

### State Management
- **BookingContext**: Manages booking flow state (source, destination, selected route, booking status)
- **MetroContext**: Manages network data, map highlighting, and admin persistence
- **AdminContext**: Manages admin panel UI state

### Component Design
- Follows **atomic design principles**
- Separates presentational components from logic
- Uses composition for complex components
- Lazy loading for admin panel

### Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation for autocomplete and station selection
- Focus indicators visible
- Color contrast meets WCAG 2.1 AA standards

## Performance Optimizations

- **Code Splitting**: Admin panel lazy-loaded
- **Memoization**: Route calculations and segment derivations memoized
- **Debouncing**: Station search input debounced at 300ms
- **SVG Optimization**: Efficient path rendering with minimal DOM updates

## License

MIT

## Author

Built for the Metro Booking Service evaluation project.
