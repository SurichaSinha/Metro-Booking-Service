import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingProvider, useBooking } from './BookingContext';

function TestComponent() {
  const {
    source,
    destination,
    status,
    setSource,
    setDestination,
    swapStations,
    startBooking,
    reset,
  } = useBooking();

  return (
    <div>
      <span data-testid="source">{source?.name || 'none'}</span>
      <span data-testid="destination">{destination?.name || 'none'}</span>
      <span data-testid="status">{status}</span>
      
      <button onClick={() => setSource({ id: 'test-source', name: 'Test Source' })}>
        Set Source
      </button>
      <button onClick={() => setDestination({ id: 'test-dest', name: 'Test Dest' })}>
        Set Destination
      </button>
      <button onClick={swapStations}>Swap</button>
      <button onClick={startBooking}>Start Booking</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

describe('BookingContext', () => {
  it('provides initial state', () => {
    render(
      <BookingProvider>
        <TestComponent />
      </BookingProvider>
    );

    expect(screen.getByTestId('source')).toHaveTextContent('none');
    expect(screen.getByTestId('destination')).toHaveTextContent('none');
    expect(screen.getByTestId('status')).toHaveTextContent('idle');
  });

  it('sets source station', () => {
    render(
      <BookingProvider>
        <TestComponent />
      </BookingProvider>
    );

    fireEvent.click(screen.getByText('Set Source'));
    expect(screen.getByTestId('source')).toHaveTextContent('Test Source');
  });

  it('sets destination station', () => {
    render(
      <BookingProvider>
        <TestComponent />
      </BookingProvider>
    );

    fireEvent.click(screen.getByText('Set Destination'));
    expect(screen.getByTestId('destination')).toHaveTextContent('Test Dest');
  });

  it('swaps source and destination', () => {
    render(
      <BookingProvider>
        <TestComponent />
      </BookingProvider>
    );

    fireEvent.click(screen.getByText('Set Source'));
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByText('Swap'));

    expect(screen.getByTestId('source')).toHaveTextContent('Test Dest');
    expect(screen.getByTestId('destination')).toHaveTextContent('Test Source');
  });

  it('starts booking and changes status to loading', () => {
    render(
      <BookingProvider>
        <TestComponent />
      </BookingProvider>
    );

    fireEvent.click(screen.getByText('Start Booking'));
    expect(screen.getByTestId('status')).toHaveTextContent('loading');
  });

  it('resets to initial state', () => {
    render(
      <BookingProvider>
        <TestComponent />
      </BookingProvider>
    );

    fireEvent.click(screen.getByText('Set Source'));
    fireEvent.click(screen.getByText('Set Destination'));
    fireEvent.click(screen.getByText('Reset'));

    expect(screen.getByTestId('source')).toHaveTextContent('none');
    expect(screen.getByTestId('destination')).toHaveTextContent('none');
  });
});
