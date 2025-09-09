import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [currentBooking, setCurrentBooking] = useState(null);

  const addBooking = (booking) => {
    const newBooking = {
      bookingId: Date.now().toString(),
      status: 'confirmed',
      paymentStatus: 'paid',
      ...booking
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const createItinerary = (itinerary) => {
    const newItinerary = {
      itineraryId: Date.now().toString(),
      ...itinerary
    };
    setItineraries(prev => [...prev, newItinerary]);
    return newItinerary;
  };

  const addBookingToItinerary = (bookingId, itineraryId) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.bookingId === bookingId 
          ? { ...booking, itineraryId }
          : booking
      )
    );
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      itineraries,
      currentBooking,
      setCurrentBooking,
      addBooking,
      createItinerary,
      addBookingToItinerary
    }}>
      {children}
    </BookingContext.Provider>
  );
};