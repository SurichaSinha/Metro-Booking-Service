import { BookingProvider } from './BookingContext';
import { MetroProvider } from './MetroContext';
import { AdminProvider } from './AdminContext';

export function AppProvider({ children }) {
  return (
    <MetroProvider>
      <BookingProvider>
        <AdminProvider>
          {children}
        </AdminProvider>
      </BookingProvider>
    </MetroProvider>
  );
}
