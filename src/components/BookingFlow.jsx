import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useUser } from '../context/UserContext';
import { usePaymentContext } from '../hooks/usePaymentContext';
import { 
  ArrowLeft, 
  CreditCard, 
  Check, 
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  Plane,
  Hotel,
  Car,
  UtensilsCrossed
} from 'lucide-react';

const BookingFlow = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { currentBooking, addBooking, itineraries } = useBooking();
  const { createSession } = usePaymentContext();
  
  const [step, setStep] = useState(1);
  const [selectedItinerary, setSelectedItinerary] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  if (!currentBooking) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <AlertCircle className="h-16 w-16 text-white/50 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">No booking selected</h2>
        <p className="text-white/70 mb-8">Please select an item to book from the search page.</p>
        <button
          onClick={() => navigate('/search')}
          className="bg-accent hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Browse Options
        </button>
      </div>
    );
  }

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'flight': return Plane;
      case 'hotel': return Hotel;
      case 'car': return Car;
      case 'restaurant': return UtensilsCrossed;
      default: return MapPin;
    }
  };

  const handlePayment = async () => {
    if (!user) {
      alert('Please sign in to complete your booking');
      return;
    }

    setIsProcessing(true);
    
    try {
      if (paymentMethod === 'crypto') {
        await createSession();
      } else {
        // Simulate card payment
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Add booking to user's bookings
      const newBooking = addBooking({
        ...currentBooking,
        userId: user.userId,
        itineraryId: selectedItinerary || null
      });
      
      setBookingComplete(true);
      setStep(3);
    } catch (error) {
      alert('Payment failed. Please try again.');
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const ServiceIcon = getServiceIcon(currentBooking.serviceType);

  if (bookingComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-green-500 rounded-full p-4 w-fit mx-auto mb-6">
          <Check className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
        <p className="text-white/80 mb-8">
          Your {currentBooking.serviceType} booking has been confirmed. 
          You'll receive a confirmation email shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/itinerary')}
            className="bg-accent hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Itinerary
          </button>
          <button
            onClick={() => navigate('/search')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Book More
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          className="bg-white/10 hover:bg-white/20 p-2 rounded-lg mr-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white">Complete Your Booking</h1>
          <p className="text-white/80">Step {step} of 2</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex mb-8">
        <div className="flex-1 h-2 bg-white/20 rounded-l-full">
          <div className="h-full bg-accent rounded-l-full"></div>
        </div>
        <div className={`flex-1 h-2 rounded-r-full ${step >= 2 ? 'bg-accent' : 'bg-white/20'}`}>
          {step >= 2 && <div className="h-full bg-accent rounded-r-full"></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 sticky top-8">
            <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
            
            <div className="flex items-start space-x-4 mb-6">
              <div className="bg-white/20 p-3 rounded-lg">
                <ServiceIcon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-white">{currentBooking.provider}</h4>
                <p className="text-white/70 text-sm capitalize">{currentBooking.serviceType}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="space-y-3 mb-6">
              {currentBooking.bookingDetails.origin && (
                <div className="flex items-center text-white/70 text-sm">
                  <Plane className="h-4 w-4 mr-2" />
                  {currentBooking.bookingDetails.origin} → {currentBooking.bookingDetails.destination}
                </div>
              )}
              {currentBooking.bookingDetails.location && (
                <div className="flex items-center text-white/70 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  {currentBooking.bookingDetails.location}
                </div>
              )}
              {currentBooking.bookingDetails.departure && (
                <div className="flex items-center text-white/70 text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  {currentBooking.bookingDetails.departure} - {currentBooking.bookingDetails.arrival}
                </div>
              )}
            </div>

            <div className="border-t border-white/20 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-white">Total</span>
                <span className="text-2xl font-bold text-white">${currentBooking.cost}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Booking Details</h3>
              
              {/* Add to Itinerary */}
              <div className="mb-6">
                <label className="block text-white/80 text-sm mb-2">Add to Itinerary (Optional)</label>
                <select
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  value={selectedItinerary}
                  onChange={(e) => setSelectedItinerary(e.target.value)}
                >
                  <option value="" className="bg-gray-800">Don't add to itinerary</option>
                  {itineraries.map((itinerary) => (
                    <option key={itinerary.itineraryId} value={itinerary.itineraryId} className="bg-gray-800">
                      {itinerary.name} - {itinerary.destination}
                    </option>
                  ))}
                </select>
              </div>

              {/* Traveler Information */}
              <div className="space-y-4">
                <h4 className="font-medium text-white">Traveler Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">First Name</label>
                    <input
                      type="text"
                      defaultValue={user?.firstName || ''}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Last Name</label>
                    <input
                      type="text"
                      defaultValue={user?.lastName || ''}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white/80 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="bg-accent hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Payment Method</h3>
              
              {/* Payment Options */}
              <div className="space-y-4 mb-6">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-accent bg-accent/10' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      paymentMethod === 'card' ? 'border-accent bg-accent' : 'border-white/40'
                    }`}>
                      {paymentMethod === 'card' && (
                        <div className="w-full h-full rounded-full bg-white"></div>
                      )}
                    </div>
                    <CreditCard className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">Credit/Debit Card</span>
                  </div>
                </div>

                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    paymentMethod === 'crypto' 
                      ? 'border-accent bg-accent/10' 
                      : 'border-white/20 hover:border-white/40'
                  }`}
                  onClick={() => setPaymentMethod('crypto')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      paymentMethod === 'crypto' ? 'border-accent bg-accent' : 'border-white/40'
                    }`}>
                      {paymentMethod === 'crypto' && (
                        <div className="w-full h-full rounded-full bg-white"></div>
                      )}
                    </div>
                    <div className="w-5 h-5 bg-orange-500 rounded"></div>
                    <span className="text-white font-medium">Cryptocurrency</span>
                  </div>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => setStep(1)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 bg-accent hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processing...' : `Pay $${currentBooking.cost}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;