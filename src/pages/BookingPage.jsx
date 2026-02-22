import StationSearch from '../components/booking/StationSearch';
import RouteResults from '../components/booking/RouteResults';
import BookingConfirmation from '../components/booking/BookingConfirmation';
import { useBooking } from '../context/BookingContext';

export default function BookingPage() {
  const { source, destination, selectedRoute, booking, status, searchPerformed, searchRoutes } = useBooking();

  const handleSearch = () => {
    if (source && destination) {
      searchRoutes();
    }
  };

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-white to-[#CAF0F8] rounded-xl shadow-lg border border-[#90E0EF]/30 p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#0077B6] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Processing your booking...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success' && booking) {
    return <BookingConfirmation />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-[#90E0EF] to-[#0077B6] rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur">
            <svg className="w-8 h-8 text-[#03045E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#03045E]">Book Your Journey</h1>
            <p className="text-[#03045E]/70">Find the best route for your travel</p>
          </div>
        </div>
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
        <StationSearch onSearch={handleSearch} />
      </div>

      {/* Results */}
      {(searchPerformed || selectedRoute) && source && destination && (
        <RouteResults />
      )}
    </div>
  );
}
