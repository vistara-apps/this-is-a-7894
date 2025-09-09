import React, { useState } from 'react';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Plane, 
  Hotel, 
  Car, 
  UtensilsCrossed,
  Clock,
  Users
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const ItineraryManager = () => {
  const { user } = useUser();
  const { itineraries, bookings, createItinerary, addBookingToItinerary } = useBooking();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [newItinerary, setNewItinerary] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: ''
  });

  const handleCreateItinerary = () => {
    if (!newItinerary.name || !newItinerary.destination || !newItinerary.startDate || !newItinerary.endDate) {
      alert('Please fill in all fields');
      return;
    }

    const itinerary = createItinerary({
      ...newItinerary,
      userId: user?.userId
    });

    setNewItinerary({ name: '', destination: '', startDate: '', endDate: '' });
    setShowCreateModal(false);
    setSelectedItinerary(itinerary);
  };

  const getBookingsForItinerary = (itineraryId) => {
    return bookings.filter(booking => booking.itineraryId === itineraryId);
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'flight': return Plane;
      case 'hotel': return Hotel;
      case 'car': return Car;
      case 'restaurant': return UtensilsCrossed;
      default: return MapPin;
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Itineraries</h1>
          <p className="text-white/80">Organize and manage your travel plans</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 bg-accent hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          Create Itinerary
        </button>
      </div>

      {/* Itineraries Grid */}
      {itineraries.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
          <Calendar className="h-16 w-16 text-white/50 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No itineraries yet</h2>
          <p className="text-white/70 mb-6">Create your first itinerary to start organizing your trips</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-accent hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Create Your First Itinerary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Itineraries List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">All Itineraries</h2>
            {itineraries.map((itinerary) => {
              const itineraryBookings = getBookingsForItinerary(itinerary.itineraryId);
              const totalCost = itineraryBookings.reduce((sum, booking) => sum + (booking.cost || 0), 0);
              
              return (
                <div
                  key={itinerary.itineraryId}
                  className={`bg-white/10 backdrop-blur-md border rounded-xl p-6 cursor-pointer transition-all hover:bg-white/15 ${
                    selectedItinerary?.itineraryId === itinerary.itineraryId
                      ? 'border-accent bg-white/15'
                      : 'border-white/20'
                  }`}
                  onClick={() => setSelectedItinerary(itinerary)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{itinerary.name}</h3>
                      <div className="flex items-center text-white/70 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {itinerary.destination}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Edit className="h-4 w-4 text-white/70" />
                      </button>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Trash2 className="h-4 w-4 text-white/70" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-white/70 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                    </div>
                    <div className="flex items-center">
                      <span>{itineraryBookings.length} booking{itineraryBookings.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {totalCost > 0 && (
                    <div className="text-right">
                      <span className="text-xl font-bold text-white">${totalCost}</span>
                      <span className="text-white/70 text-sm ml-1">total</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Selected Itinerary Details */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Itinerary Details</h2>
            {selectedItinerary ? (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedItinerary.name}</h3>
                  <div className="flex items-center text-white/70 mb-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    {selectedItinerary.destination}
                  </div>
                  <div className="flex items-center text-white/70">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(selectedItinerary.startDate)} - {formatDate(selectedItinerary.endDate)}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Bookings</h4>
                  {getBookingsForItinerary(selectedItinerary.itineraryId).length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-white/50 mx-auto mb-4" />
                      <p className="text-white/70">No bookings added yet</p>
                      <p className="text-white/50 text-sm">Add bookings from the search page</p>
                    </div>
                  ) : (
                    getBookingsForItinerary(selectedItinerary.itineraryId).map((booking) => {
                      const IconComponent = getServiceIcon(booking.serviceType);
                      return (
                        <div key={booking.bookingId} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-white/20 p-2 rounded-lg">
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h5 className="font-medium text-white">{booking.provider}</h5>
                                <p className="text-white/70 text-sm capitalize">{booking.serviceType}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-white">${booking.cost}</p>
                              <p className="text-green-400 text-sm">{booking.status}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Unassigned Bookings */}
                {bookings.filter(b => !b.itineraryId).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <h4 className="text-lg font-semibold text-white mb-4">Add Bookings</h4>
                    <div className="space-y-2">
                      {bookings.filter(b => !b.itineraryId).map((booking) => {
                        const IconComponent = getServiceIcon(booking.serviceType);
                        return (
                          <div key={booking.bookingId} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <div className="bg-white/20 p-2 rounded-lg">
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <p className="font-medium text-white text-sm">{booking.provider}</p>
                                <p className="text-white/70 text-xs capitalize">{booking.serviceType}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => addBookingToItinerary(booking.bookingId, selectedItinerary.itineraryId)}
                              className="bg-accent hover:bg-green-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-12 text-center">
                <Calendar className="h-12 w-12 text-white/50 mx-auto mb-4" />
                <p className="text-white/70">Select an itinerary to view details</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Itinerary Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Create New Itinerary</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">Itinerary Name</label>
                <input
                  type="text"
                  placeholder="e.g., Summer Vacation 2024"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  value={newItinerary.name}
                  onChange={(e) => setNewItinerary(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-white/80 text-sm mb-2">Destination</label>
                <input
                  type="text"
                  placeholder="e.g., Paris, France"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                  value={newItinerary.destination}
                  onChange={(e) => setNewItinerary(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    value={newItinerary.startDate}
                    onChange={(e) => setNewItinerary(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    value={newItinerary.endDate}
                    onChange={(e) => setNewItinerary(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewItinerary({ name: '', destination: '', startDate: '', endDate: '' });
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateItinerary}
                className="flex-1 bg-accent hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryManager;