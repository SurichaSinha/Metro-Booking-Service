import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl text-white">
        <img src="/patna-metro-logo.svg" alt="Patna Metro" className="w-20 h-20 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-4">Welcome to Patna Metro</h1>
        <p className="text-xl opacity-90 mb-8">Fast, Safe, and Reliable Urban Transit</p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
          Book Your Journey
        </button>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-2">Quick Booking</h3>
          <p className="text-gray-600">Book your metro ticket in seconds.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-2">Interactive Map</h3>
          <p className="text-gray-600">Explore the entire metro network.</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="font-bold text-lg mb-2">QR Tickets</h3>
          <p className="text-gray-600">Get instant QR tickets on your phone.</p>
        </div>
      </section>
    </div>
  );
}
