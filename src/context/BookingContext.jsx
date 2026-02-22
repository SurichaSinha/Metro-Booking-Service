import { createContext, useContext, useReducer, useCallback } from 'react';

const BookingContext = createContext(null);

const initialState = {
  source: null,
  destination: null,
  selectedRoute: null,
  booking: null,
  status: 'idle',
  error: null,
  searchPerformed: false,
};

function generateBookingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PM';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_SOURCE':
      return { ...state, source: action.payload, selectedRoute: null, searchPerformed: false };
    case 'SET_DESTINATION':
      return { ...state, destination: action.payload, selectedRoute: null, searchPerformed: false };
    case 'SWAP_STATIONS':
      return { 
        ...state, 
        source: state.destination, 
        destination: state.source, 
        selectedRoute: null,
        searchPerformed: false,
      };
    case 'SET_ROUTE':
      return { ...state, selectedRoute: action.payload };
    case 'SEARCH_ROUTES':
      return { ...state, searchPerformed: true };
    case 'BOOKING_START':
      return { ...state, status: 'loading', error: null };
    case 'BOOKING_SUCCESS':
      return { ...state, booking: action.payload, status: 'success' };
    case 'BOOKING_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const setSource = (station) => dispatch({ type: 'SET_SOURCE', payload: station });
  const setDestination = (station) => dispatch({ type: 'SET_DESTINATION', payload: station });
  const swapStations = () => dispatch({ type: 'SWAP_STATIONS' });
  const setRoute = (route) => dispatch({ type: 'SET_ROUTE', payload: route });
  const searchRoutes = () => dispatch({ type: 'SEARCH_ROUTES' });
  
  const startBooking = useCallback(() => {
    if (!state.selectedRoute || !state.source || !state.destination) return;
    
    dispatch({ type: 'BOOKING_START' });
    
    setTimeout(() => {
      const booking = {
        reference: generateBookingReference(),
        source: state.source,
        destination: state.destination,
        route: state.selectedRoute,
        fare: state.selectedRoute.fare,
        timestamp: new Date().toISOString(),
        validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
      };
      dispatch({ type: 'BOOKING_SUCCESS', payload: booking });
    }, 1000);
  }, [state.selectedRoute, state.source, state.destination]);
  
  const bookingSuccess = (booking) => dispatch({ type: 'BOOKING_SUCCESS', payload: booking });
  const bookingError = (error) => dispatch({ type: 'BOOKING_ERROR', payload: error });
  const reset = () => dispatch({ type: 'RESET' });

  const value = {
    ...state,
    setSource,
    setDestination,
    swapStations,
    setRoute,
    searchRoutes,
    startBooking,
    bookingSuccess,
    bookingError,
    reset,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
