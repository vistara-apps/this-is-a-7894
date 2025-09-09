/**
 * VoyageVerse API Services
 * Centralized API integration layer for all external services
 */

import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('voyageverse_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('voyageverse_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Amadeus API Integration - Flights, Hotels, Cars
 */
export const amadeusAPI = {
  // Flight search
  searchFlights: async (params) => {
    try {
      const response = await apiClient.post('/amadeus/flights/search', {
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults || 1,
        children: params.children || 0,
        infants: params.infants || 0,
        travelClass: params.travelClass || 'ECONOMY',
        nonStop: params.nonStop || false,
        maxPrice: params.maxPrice,
        currency: params.currency || 'USD'
      });
      return response.data;
    } catch (error) {
      console.error('Flight search error:', error);
      throw new Error('Failed to search flights');
    }
  },

  // Hotel search
  searchHotels: async (params) => {
    try {
      const response = await apiClient.post('/amadeus/hotels/search', {
        cityCode: params.cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults || 1,
        roomQuantity: params.roomQuantity || 1,
        priceRange: params.priceRange,
        amenities: params.amenities || [],
        ratings: params.ratings || [],
        currency: params.currency || 'USD'
      });
      return response.data;
    } catch (error) {
      console.error('Hotel search error:', error);
      throw new Error('Failed to search hotels');
    }
  },

  // Car rental search
  searchCars: async (params) => {
    try {
      const response = await apiClient.post('/amadeus/cars/search', {
        pickUpLocationCode: params.pickUpLocationCode,
        dropOffLocationCode: params.dropOffLocationCode,
        pickUpDate: params.pickUpDate,
        dropOffDate: params.dropOffDate,
        pickUpTime: params.pickUpTime || '10:00',
        dropOffTime: params.dropOffTime || '10:00',
        driverAge: params.driverAge || 25,
        currency: params.currency || 'USD'
      });
      return response.data;
    } catch (error) {
      console.error('Car search error:', error);
      throw new Error('Failed to search car rentals');
    }
  }
};

/**
 * Expedia API Integration - Experiences
 */
export const expediaAPI = {
  searchExperiences: async (params) => {
    try {
      const response = await apiClient.post('/expedia/experiences/search', {
        destination: params.destination,
        startDate: params.startDate,
        endDate: params.endDate,
        adults: params.adults || 1,
        children: params.children || 0,
        categories: params.categories || [],
        priceRange: params.priceRange,
        duration: params.duration,
        language: params.language || 'en',
        currency: params.currency || 'USD'
      });
      return response.data;
    } catch (error) {
      console.error('Experience search error:', error);
      throw new Error('Failed to search experiences');
    }
  }
};

/**
 * OpenTable API Integration - Restaurants
 */
export const openTableAPI = {
  searchRestaurants: async (params) => {
    try {
      const response = await apiClient.post('/opentable/restaurants/search', {
        location: params.location,
        date: params.date,
        time: params.time,
        partySize: params.partySize || 2,
        cuisine: params.cuisine,
        priceRange: params.priceRange,
        radius: params.radius || 5,
        sortBy: params.sortBy || 'relevance'
      });
      return response.data;
    } catch (error) {
      console.error('Restaurant search error:', error);
      throw new Error('Failed to search restaurants');
    }
  },

  makeReservation: async (params) => {
    try {
      const response = await apiClient.post('/opentable/reservations', {
        restaurantId: params.restaurantId,
        date: params.date,
        time: params.time,
        partySize: params.partySize,
        customerInfo: params.customerInfo,
        specialRequests: params.specialRequests
      });
      return response.data;
    } catch (error) {
      console.error('Reservation error:', error);
      throw new Error('Failed to make reservation');
    }
  }
};

/**
 * Google Maps API Integration - Places, Geocoding
 */
export const googleMapsAPI = {
  searchPlaces: async (params) => {
    try {
      const response = await apiClient.post('/google/places/search', {
        query: params.query,
        location: params.location,
        radius: params.radius || 5000,
        type: params.type,
        language: params.language || 'en',
        minprice: params.minprice,
        maxprice: params.maxprice,
        opennow: params.opennow
      });
      return response.data;
    } catch (error) {
      console.error('Places search error:', error);
      throw new Error('Failed to search places');
    }
  },

  geocodeAddress: async (address) => {
    try {
      const response = await apiClient.post('/google/geocode', {
        address: address
      });
      return response.data;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  },

  reverseGeocode: async (lat, lng) => {
    try {
      const response = await apiClient.post('/google/reverse-geocode', {
        lat: lat,
        lng: lng
      });
      return response.data;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }
};

/**
 * Stripe API Integration - Payments
 */
export const stripeAPI = {
  createPaymentIntent: async (params) => {
    try {
      const response = await apiClient.post('/stripe/payment-intent', {
        amount: params.amount,
        currency: params.currency || 'usd',
        paymentMethodTypes: params.paymentMethodTypes || ['card'],
        metadata: params.metadata || {}
      });
      return response.data;
    } catch (error) {
      console.error('Payment intent creation error:', error);
      throw new Error('Failed to create payment intent');
    }
  },

  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    try {
      const response = await apiClient.post('/stripe/confirm-payment', {
        paymentIntentId: paymentIntentId,
        paymentMethodId: paymentMethodId
      });
      return response.data;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      throw new Error('Failed to confirm payment');
    }
  },

  createSubscription: async (params) => {
    try {
      const response = await apiClient.post('/stripe/subscriptions', {
        customerId: params.customerId,
        priceId: params.priceId,
        paymentMethodId: params.paymentMethodId,
        metadata: params.metadata || {}
      });
      return response.data;
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw new Error('Failed to create subscription');
    }
  }
};

/**
 * VoyageVerse Internal API - User Management, Bookings, Itineraries
 */
export const voyageVerseAPI = {
  // User management
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Failed to register user');
    }
  },

  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('voyageverse_token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Failed to login');
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('voyageverse_token');
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  // Booking management
  createBooking: async (bookingData) => {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Booking creation error:', error);
      throw new Error('Failed to create booking');
    }
  },

  getBookings: async (userId) => {
    try {
      const response = await apiClient.get(`/bookings/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get bookings error:', error);
      throw new Error('Failed to fetch bookings');
    }
  },

  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Booking update error:', error);
      throw new Error('Failed to update booking');
    }
  },

  cancelBooking: async (bookingId) => {
    try {
      const response = await apiClient.delete(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Booking cancellation error:', error);
      throw new Error('Failed to cancel booking');
    }
  },

  // Itinerary management
  createItinerary: async (itineraryData) => {
    try {
      const response = await apiClient.post('/itineraries', itineraryData);
      return response.data;
    } catch (error) {
      console.error('Itinerary creation error:', error);
      throw new Error('Failed to create itinerary');
    }
  },

  getItineraries: async (userId) => {
    try {
      const response = await apiClient.get(`/itineraries/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get itineraries error:', error);
      throw new Error('Failed to fetch itineraries');
    }
  },

  updateItinerary: async (itineraryId, updateData) => {
    try {
      const response = await apiClient.put(`/itineraries/${itineraryId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Itinerary update error:', error);
      throw new Error('Failed to update itinerary');
    }
  },

  deleteItinerary: async (itineraryId) => {
    try {
      const response = await apiClient.delete(`/itineraries/${itineraryId}`);
      return response.data;
    } catch (error) {
      console.error('Itinerary deletion error:', error);
      throw new Error('Failed to delete itinerary');
    }
  }
};

export default apiClient;
