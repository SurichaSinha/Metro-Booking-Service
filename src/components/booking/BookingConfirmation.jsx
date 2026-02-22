import { QRCodeSVG } from 'qrcode.react';
import { useBooking } from '../../context/BookingContext';
import { useMetro } from '../../context/MetroContext';
import { useToast } from '../ui/Toast';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function BookingConfirmation() {
  const { booking, reset } = useBooking();
  const { setHighlightedRoute } = useMetro();
  const toast = useToast();

  const handleDownload = () => {
    const svg = document.getElementById('booking-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = `patna-metro-ticket-${booking?.reference}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    toast.success('Ticket downloaded!');
  };

  const handleNewBooking = () => {
    setHighlightedRoute(null);
    reset();
  };

  if (!booking) {
    return (
      <Card className="max-w-lg mx-auto text-center">
        <div className="py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Failed</h2>
          <p className="text-gray-500 mb-6">Something went wrong. Please try again.</p>
          <Button variant="primary" onClick={handleNewBooking}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  const qrData = JSON.stringify({
    ref: booking.reference,
    from: booking.source.id,
    to: booking.destination.id,
    fare: booking.fare,
    valid: booking.validUntil,
  });

  return (
    <Card className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
        <p className="text-gray-500 mt-1">Your metro ticket is ready</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <QRCodeSVG
              id="booking-qr-code"
              value={qrData}
              size={180}
              level="H"
              includeMargin={true}
              data-testid="qr-code"
            />
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Booking Reference</p>
          <p className="text-2xl font-mono font-bold text-metro-blue">{booking.reference}</p>
        </div>

        <div className="border-t border-dashed border-gray-300 pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500">From</span>
            <span className="font-medium">{booking.source.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">To</span>
            <span className="font-medium">{booking.destination.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium">{booking.route.totalDuration} min</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Stops</span>
            <span className="font-medium">{booking.route.totalStops} stops</span>
          </div>
          {booking.route.interchanges > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Interchanges</span>
              <span className="font-medium">{booking.route.interchanges}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-500">Fare</span>
            <span className="text-2xl font-bold text-metro-blue">₹{booking.fare}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg mb-6">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>
          Valid until {new Date(booking.validUntil).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleDownload}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </Button>
        <Button variant="primary" onClick={handleNewBooking}>
          New Booking
        </Button>
      </div>
    </Card>
  );
}
