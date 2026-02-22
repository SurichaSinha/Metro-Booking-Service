import { Link } from 'react-router-dom';
import { useMetro } from '../context/MetroContext';

const lineColors = {
  red: 'bg-red-50 border-red-200',
  blue: 'bg-line-blue border-metro-blue/20',
  yellow: 'bg-line-yellow border-metro-yellow/20',
  green: 'bg-line-green border-metro-green/20',
};

export default function HomePage() {
  const { network } = useMetro();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative text-center py-16 bg-gradient-to-r from-[#CAF0F8] via-[#90E0EF] to-[#0077B6] rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="relative">
          <img src="/patna-metro-logo.svg" alt="Patna Metro" className="w-20 h-20 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#03045E]">Welcome to Patna Metro</h1>
          <p className="text-xl text-[#0077B6] font-medium mb-8 max-w-2xl mx-auto">Fast, Safe, and Reliable Urban Transit for the Heart of Bihar</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              to="/book"
              className="inline-flex items-center gap-2 bg-[#03045E] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#023E8A] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Book Your Journey
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 bg-white/30 text-[#03045E] px-8 py-3 rounded-lg font-semibold hover:bg-white/50 transition-all backdrop-blur"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              View Metro Map
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-[#CAF0F8] p-6 rounded-xl shadow-md border border-[#90E0EF]/30 card-hover">
          <div className="w-14 h-14 bg-[#90E0EF]/20 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[#0077B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900">Quick Booking</h3>
          <p className="text-gray-600">Book your metro ticket in seconds with our easy-to-use interface.</p>
        </div>

        <div className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md border border-blue-100 card-hover">
          <div className="w-14 h-14 bg-metro-blue/10 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-metro-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900">Interactive Map</h3>
          <p className="text-gray-600">Explore the entire metro network with our interactive map.</p>
        </div>

        <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-md border border-green-100 card-hover">
          <div className="w-14 h-14 bg-metro-green/10 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-metro-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900">QR Tickets</h3>
          <p className="text-gray-600">Get instant QR tickets on your phone - no physical tickets needed.</p>
        </div>
      </section>

      {/* Metro Lines */}
      <section className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-[#0077B6] rounded-full"></span>
          Our Metro Lines
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {network.lines.map(line => (
            <div
              key={line.id}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${lineColors[line.id] || 'bg-gray-50 border-gray-200'}`}
            >
              <div
                className="w-3 h-14 rounded-full shadow-sm"
                style={{ backgroundColor: line.color }}
              />
              <div>
                <h3 className="font-bold text-gray-900">{line.name}</h3>
                <p className="text-gray-600 text-sm">{line.stations.length} stations</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fare Information */}
      <section className="bg-gradient-to-br from-white to-blue-50 p-6 rounded-xl shadow-md border border-blue-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-metro-blue rounded-full"></span>
          Fare Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {network.fareRules.ranges.map((rule, index) => (
            <div key={index} className="text-center p-5 bg-white rounded-xl shadow-sm border border-blue-100">
              <p className="text-3xl font-bold text-metro-blue">₹{rule.fare}</p>
              <p className="text-gray-600 text-sm mt-1">
                {index === 0 ? `0 - ${rule.maxKm} km` : 
                 rule.maxKm === Infinity ? `Above ${network.fareRules.ranges[index-1].maxKm} km` :
                 `${network.fareRules.ranges[index-1].maxKm} - ${rule.maxKm} km`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-[#90E0EF] to-[#0077B6] p-5 rounded-xl text-white text-center">
          <p className="text-3xl font-bold">4</p>
          <p className="text-white/80 text-sm">Metro Lines</p>
        </div>
        <div className="bg-gradient-to-br from-metro-blue to-blue-600 p-5 rounded-xl text-white text-center">
          <p className="text-3xl font-bold">30</p>
          <p className="text-white/80 text-sm">Stations</p>
        </div>
        <div className="bg-gradient-to-br from-metro-green to-green-600 p-5 rounded-xl text-white text-center">
          <p className="text-3xl font-bold">5</p>
          <p className="text-white/80 text-sm">Interchanges</p>
        </div>
        <div className="bg-gradient-to-br from-metro-yellow to-yellow-500 p-5 rounded-xl text-gray-900 text-center">
          <p className="text-3xl font-bold">50+</p>
          <p className="text-gray-700 text-sm">Daily Trips</p>
        </div>
      </section>
    </div>
  );
}
