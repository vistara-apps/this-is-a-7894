import React from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useBooking } from '../context/BookingContext';
import { 
  Search, 
  Calendar, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Plane,
  Hotel,
  Car,
  UtensilsCrossed
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAuthenticated } = useUser();
  const { bookings, itineraries } = useBooking();

  const stats = [
    {
      name: 'Total Bookings',
      value: bookings.length.toString(),
      icon: Calendar,
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Active Itineraries',
      value: itineraries.length.toString(),
      icon: MapPin,
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Total Spent',
      value: '$2,450',
      icon: DollarSign,
      change: '+23%',
      changeType: 'positive'
    },
    {
      name: 'Savings',
      value: '$420',
      icon: TrendingUp,
      change: '+15%',
      changeType: 'positive'
    }
  ];

  const quickActions = [
    {
      name: 'Search Flights',
      description: 'Find the best flight deals',
      icon: Plane,
      href: '/search?type=flights',
      color: 'bg-blue-500'
    },
    {
      name: 'Book Hotels',
      description: 'Discover amazing accommodations',
      icon: Hotel,
      href: '/search?type=hotels',
      color: 'bg-green-500'
    },
    {
      name: 'Rent a Car',
      description: 'Get around with ease',
      icon: Car,
      href: '/search?type=cars',
      color: 'bg-purple-500'
    },
    {
      name: 'Find Restaurants',
      description: 'Explore local dining',
      icon: UtensilsCrossed,
      href: '/search?type=restaurants',
      color: 'bg-orange-500'
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center py-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to VoyageVerse
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Your entire trip, perfectly organized. Search, book, and manage all your travel needs in one place.
          </p>
          <Link
            to="/search"
            className="inline-flex items-center px-8 py-4 bg-accent hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
          >
            <Search className="mr-2 h-5 w-5" />
            Start Planning Your Trip
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-200 group"
            >
              <div className={`${action.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{action.name}</h3>
              <p className="text-white/70">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-white/80">
          Here's an overview of your travel activity and upcoming trips.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">{stat.name}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
              <span className="text-white/70 text-sm ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Bookings</h2>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.bookingId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">{booking.serviceType}</h3>
                    <p className="text-white/70 text-sm">{booking.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">${booking.cost}</p>
                    <p className="text-green-400 text-sm">{booking.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">No bookings yet</p>
              <Link
                to="/search"
                className="inline-block mt-2 text-accent hover:text-green-400 text-sm font-medium"
              >
                Start booking →
              </Link>
            </div>
          )}
        </div>

        {/* Upcoming Itineraries */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Upcoming Itineraries</h2>
          {itineraries.length > 0 ? (
            <div className="space-y-4">
              {itineraries.slice(0, 3).map((itinerary) => (
                <div key={itinerary.itineraryId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <h3 className="font-medium text-white">{itinerary.name}</h3>
                    <p className="text-white/70 text-sm">{itinerary.destination}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white">{itinerary.startDate}</p>
                    <p className="text-white/70 text-sm">{itinerary.endDate}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-white/50 mx-auto mb-4" />
              <p className="text-white/70">No itineraries planned</p>
              <Link
                to="/itinerary"
                className="inline-block mt-2 text-accent hover:text-green-400 text-sm font-medium"
              >
                Create itinerary →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.href}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-200 group"
            >
              <div className={`${action.color} p-3 rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-medium text-white mb-1">{action.name}</h3>
              <p className="text-white/70 text-sm">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;