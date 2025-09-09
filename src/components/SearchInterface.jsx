import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Plane, 
  Hotel, 
  Car, 
  UtensilsCrossed, 
  Calendar,
  MapPin,
  Users,
  Filter
} from 'lucide-react';
import { useBooking } from '../context/BookingContext';

const SearchInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentBooking } = useBooking();
  
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('type') || 'flights';
  });
  
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1
  });

  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'flights', name: 'Flights', icon: Plane },
    { id: 'hotels', name: 'Hotels', icon: Hotel },
    { id: 'cars', name: 'Car Rental', icon: Car },
    { id: 'restaurants', name: 'Restaurants', icon: UtensilsCrossed }
  ];

  const mockResults = {
    flights: [
      {
        id: 'fl1',
        airline: 'Delta Airlines',
        origin: 'NYC',
        destination: 'LAX',
        departure: '08:30 AM',
        arrival: '11:45 AM',
        duration: '6h 15m',
        price: 299,
        stops: 'Non-stop'
      },
      {
        id: 'fl2',
        airline: 'American Airlines',
        origin: 'NYC',
        destination: 'LAX',
        departure: '02:15 PM',
        arrival: '5:30 PM',
        duration: '6h 15m',
        price: 275,
        stops: 'Non-stop'
      }
    ],
    hotels: [
      {
        id: 'ht1',
        name: 'The Beverly Hills Hotel',
        location: 'Beverly Hills, CA',
        rating: 4.8,
        price: 450,
        amenities: ['Pool', 'Spa', 'WiFi', 'Parking'],
        image: '/api/placeholder/300/200'
      },
      {
        id: 'ht2',
        name: 'Hollywood Roosevelt',
        location: 'Hollywood, CA',
        rating: 4.5,
        price: 320,
        amenities: ['Pool', 'WiFi', 'Gym', 'Restaurant'],
        image: '/api/placeholder/300/200'
      }
    ],
    cars: [
      {
        id: 'cr1',
        model: 'Toyota Camry',
        type: 'Economy',
        company: 'Enterprise',
        price: 65,
        features: ['4 seats', 'Automatic', 'AC', 'Bluetooth']
      },
      {
        id: 'cr2',
        model: 'BMW X3',
        type: 'Premium SUV',
        company: 'Hertz',
        price: 120,
        features: ['5 seats', 'Automatic', 'AC', 'GPS', 'Leather']
      }
    ],
    restaurants: [
      {
        id: 'rs1',
        name: 'Mastros Steakhouse',
        cuisine: 'Steakhouse',
        location: 'Beverly Hills',
        rating: 4.7,
        priceRange: '$$$',
        availability: '7:30 PM'
      },
      {
        id: 'rs2',
        name: 'Guelaguetza',
        cuisine: 'Mexican',
        location: 'Koreatown',
        rating: 4.5,
        priceRange: '$$',
        availability: '8:00 PM'
      }
    ]
  };

  const handleSearch = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSearchResults(mockResults[activeTab] || []);
    setIsLoading(false);
  };

  const handleBook = (item) => {
    const booking = {
      serviceType: activeTab.slice(0, -1), // Remove 's' from the end
      provider: item.airline || item.name || item.company,
      serviceId: item.id,
      bookingDetails: item,
      cost: item.price
    };
    
    setCurrentBooking(booking);
    navigate('/booking');
  };

  const renderSearchForm = () => {
    switch (activeTab) {
      case 'flights':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">From</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Origin city"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.origin}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">To</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Destination city"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Departure</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Passengers</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                >
                  {[1,2,3,4,5,6].map(num => (
                    <option key={num} value={num} className="bg-gray-800">{num} passenger{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      
      case 'hotels':
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="City or hotel name"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.checkOut}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, checkOut: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Guests & Rooms</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={`${searchParams.guests}-${searchParams.rooms}`}
                  onChange={(e) => {
                    const [guests, rooms] = e.target.value.split('-').map(Number);
                    setSearchParams(prev => ({ ...prev, guests, rooms }));
                  }}
                >
                  <option value="1-1" className="bg-gray-800">1 guest, 1 room</option>
                  <option value="2-1" className="bg-gray-800">2 guests, 1 room</option>
                  <option value="4-2" className="bg-gray-800">4 guests, 2 rooms</option>
                </select>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="text"
                  placeholder="City or area"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.checkIn}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, checkIn: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2">Party Size</label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                <select
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={searchParams.guests}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
                >
                  {[1,2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num} className="bg-gray-800">{num} {num === 1 ? 'person' : 'people'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white/80 mt-4">Searching for the best options...</p>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-white/50 mx-auto mb-4" />
          <p className="text-white/80">Click search to find {activeTab}</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'flights':
        return (
          <div className="space-y-4">
            {searchResults.map((flight) => (
              <div key={flight.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">{flight.airline}</h3>
                      <span className="text-white/70 text-sm">{flight.stops}</span>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{flight.departure}</p>
                        <p className="text-white/70 text-sm">{flight.origin}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-white/70 text-sm">{flight.duration}</p>
                        <div className="h-px bg-white/30 my-2"></div>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-white">{flight.arrival}</p>
                        <p className="text-white/70 text-sm">{flight.destination}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-8 text-right">
                    <p className="text-2xl font-bold text-white">${flight.price}</p>
                    <button
                      onClick={() => handleBook(flight)}
                      className="mt-2 bg-accent hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'hotels':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {searchResults.map((hotel) => (
              <div key={hotel.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-purple-500 to-blue-500"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{hotel.name}</h3>
                      <p className="text-white/70">{hotel.location}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-white">{hotel.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.amenities.map((amenity) => (
                      <span key={amenity} className="px-2 py-1 bg-white/20 rounded text-white/80 text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-white">${hotel.price}</span>
                      <span className="text-white/70 text-sm">/night</span>
                    </div>
                    <button
                      onClick={() => handleBook(hotel)}
                      className="bg-accent hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            {searchResults.map((item) => (
              <div key={item.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.name || `${item.model} (${item.type})`}
                    </h3>
                    <p className="text-white/70 mb-2">
                      {item.location || item.company} 
                      {item.cuisine && ` • ${item.cuisine}`}
                      {item.priceRange && ` • ${item.priceRange}`}
                    </p>
                    {item.features && (
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feature) => (
                          <span key={feature} className="px-2 py-1 bg-white/20 rounded text-white/80 text-sm">
                            {feature}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.rating && (
                      <div className="flex items-center mt-2">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-white">{item.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 lg:mt-0 lg:ml-8 text-right">
                    <p className="text-xl font-bold text-white">
                      ${item.price}
                      {activeTab === 'cars' && '/day'}
                      {item.availability && (
                        <span className="block text-sm text-white/70">{item.availability}</span>
                      )}
                    </p>
                    <button
                      onClick={() => handleBook(item)}
                      className="mt-2 bg-accent hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      {activeTab === 'restaurants' ? 'Reserve' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Search & Book</h1>
        <p className="text-white/80">Find the best deals for your travel needs</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchResults([]);
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-purple-600'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Search Form */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 mb-8">
        {renderSearchForm()}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSearch}
            className="flex-1 bg-accent hover:bg-green-600 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            <Search className="mr-2 h-5 w-5" />
            {isLoading ? 'Searching...' : 'Search'}
          </button>
          <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-4 rounded-lg font-medium transition-colors flex items-center justify-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          {searchResults.length > 0 ? `${searchResults.length} results found` : 'Search Results'}
        </h2>
        {renderResults()}
      </div>
    </div>
  );
};

export default SearchInterface;