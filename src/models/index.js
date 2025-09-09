/**
 * VoyageVerse Data Models
 * Defines the data structures according to the PRD specifications
 */

/**
 * User Entity
 * Represents a user in the VoyageVerse system
 */
export class User {
  constructor(data = {}) {
    this.userId = data.userId || null;
    this.email = data.email || '';
    this.passwordHash = data.passwordHash || '';
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.preferences = data.preferences || {
      currency: 'USD',
      language: 'en',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      travel: {
        preferredClass: 'economy',
        dietaryRestrictions: [],
        accessibility: []
      }
    };
    this.paymentMethods = data.paymentMethods || [];
    this.subscriptionStatus = data.subscriptionStatus || 'free';
    this.subscriptionPlan = data.subscriptionPlan || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation methods
  isValid() {
    return this.email && this.firstName && this.lastName;
  }

  isPremium() {
    return this.subscriptionStatus === 'active' && this.subscriptionPlan;
  }

  isBusiness() {
    return this.subscriptionPlan === 'business';
  }

  // Utility methods
  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  toJSON() {
    const { passwordHash, ...publicData } = this;
    return publicData;
  }
}

/**
 * Booking Entity
 * Represents a booking for any service type
 */
export class Booking {
  constructor(data = {}) {
    this.bookingId = data.bookingId || null;
    this.userId = data.userId || null;
    this.provider = data.provider || '';
    this.serviceType = data.serviceType || ''; // flight, hotel, car, experience, restaurant
    this.serviceId = data.serviceId || '';
    this.bookingDetails = data.bookingDetails || {};
    this.status = data.status || 'pending'; // pending, confirmed, cancelled, completed
    this.cost = data.cost || 0;
    this.currency = data.currency || 'USD';
    this.paymentStatus = data.paymentStatus || 'pending'; // pending, paid, failed, refunded
    this.paymentIntentId = data.paymentIntentId || null;
    this.confirmationCode = data.confirmationCode || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.scheduledDate = data.scheduledDate || null;
    this.metadata = data.metadata || {};
  }

  // Validation methods
  isValid() {
    return this.userId && this.provider && this.serviceType && this.cost >= 0;
  }

  isConfirmed() {
    return this.status === 'confirmed' && this.paymentStatus === 'paid';
  }

  isCancellable() {
    const now = new Date();
    const scheduledDate = new Date(this.scheduledDate);
    const hoursDiff = (scheduledDate - now) / (1000 * 60 * 60);
    
    return this.status === 'confirmed' && hoursDiff > 24; // 24 hours cancellation policy
  }

  // Utility methods
  getFormattedCost() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency
    }).format(this.cost);
  }

  getDuration() {
    if (this.bookingDetails.startDate && this.bookingDetails.endDate) {
      const start = new Date(this.bookingDetails.startDate);
      const end = new Date(this.bookingDetails.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return days;
    }
    return null;
  }
}

/**
 * Itinerary Entity
 * Represents a collection of bookings for a trip
 */
export class Itinerary {
  constructor(data = {}) {
    this.itineraryId = data.itineraryId || null;
    this.userId = data.userId || null;
    this.name = data.name || '';
    this.description = data.description || '';
    this.startDate = data.startDate || null;
    this.endDate = data.endDate || null;
    this.destination = data.destination || '';
    this.status = data.status || 'draft'; // draft, active, completed, cancelled
    this.isPublic = data.isPublic || false;
    this.shareCode = data.shareCode || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.metadata = data.metadata || {};
  }

  // Validation methods
  isValid() {
    return this.userId && this.name && this.startDate && this.endDate;
  }

  isActive() {
    const now = new Date();
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return now >= start && now <= end && this.status === 'active';
  }

  // Utility methods
  getDuration() {
    if (this.startDate && this.endDate) {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  generateShareCode() {
    this.shareCode = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
    return this.shareCode;
  }
}

/**
 * TripSegment Entity
 * Represents a segment within an itinerary
 */
export class TripSegment {
  constructor(data = {}) {
    this.segmentId = data.segmentId || null;
    this.itineraryId = data.itineraryId || null;
    this.bookingId = data.bookingId || null;
    this.type = data.type || ''; // transport, accommodation, activity, dining
    this.title = data.title || '';
    this.description = data.description || '';
    this.startTime = data.startTime || null;
    this.endTime = data.endTime || null;
    this.location = data.location || {
      name: '',
      address: '',
      coordinates: { lat: null, lng: null }
    };
    this.details = data.details || {};
    this.order = data.order || 0;
    this.status = data.status || 'scheduled'; // scheduled, in-progress, completed, cancelled
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation methods
  isValid() {
    return this.itineraryId && this.type && this.title && this.startTime;
  }

  // Utility methods
  getDuration() {
    if (this.startTime && this.endTime) {
      const start = new Date(this.startTime);
      const end = new Date(this.endTime);
      return Math.ceil((end - start) / (1000 * 60 * 60)); // Duration in hours
    }
    return null;
  }

  isCurrentlyActive() {
    const now = new Date();
    const start = new Date(this.startTime);
    const end = new Date(this.endTime);
    return now >= start && now <= end && this.status === 'in-progress';
  }
}

/**
 * Subscription Entity
 * Represents user subscription information
 */
export class Subscription {
  constructor(data = {}) {
    this.subscriptionId = data.subscriptionId || null;
    this.userId = data.userId || null;
    this.planId = data.planId || null;
    this.planName = data.planName || '';
    this.status = data.status || 'inactive'; // inactive, active, cancelled, past_due
    this.currentPeriodStart = data.currentPeriodStart || null;
    this.currentPeriodEnd = data.currentPeriodEnd || null;
    this.cancelAtPeriodEnd = data.cancelAtPeriodEnd || false;
    this.stripeSubscriptionId = data.stripeSubscriptionId || null;
    this.stripeCustomerId = data.stripeCustomerId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation methods
  isValid() {
    return this.userId && this.planId && this.planName;
  }

  isActive() {
    const now = new Date();
    const end = new Date(this.currentPeriodEnd);
    return this.status === 'active' && now <= end;
  }

  // Utility methods
  getDaysRemaining() {
    if (this.currentPeriodEnd) {
      const now = new Date();
      const end = new Date(this.currentPeriodEnd);
      const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      return Math.max(0, days);
    }
    return 0;
  }
}

/**
 * PaymentMethod Entity
 * Represents a user's payment method
 */
export class PaymentMethod {
  constructor(data = {}) {
    this.paymentMethodId = data.paymentMethodId || null;
    this.userId = data.userId || null;
    this.type = data.type || 'card'; // card, bank_account, digital_wallet
    this.provider = data.provider || 'stripe';
    this.stripePaymentMethodId = data.stripePaymentMethodId || null;
    this.last4 = data.last4 || '';
    this.brand = data.brand || '';
    this.expiryMonth = data.expiryMonth || null;
    this.expiryYear = data.expiryYear || null;
    this.isDefault = data.isDefault || false;
    this.billingAddress = data.billingAddress || {};
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation methods
  isValid() {
    return this.userId && this.type && this.last4;
  }

  isExpired() {
    if (this.expiryMonth && this.expiryYear) {
      const now = new Date();
      const expiry = new Date(this.expiryYear, this.expiryMonth - 1);
      return now > expiry;
    }
    return false;
  }

  // Utility methods
  getDisplayName() {
    return `${this.brand.toUpperCase()} •••• ${this.last4}`;
  }
}

/**
 * SearchResult Entity
 * Represents a search result from any provider
 */
export class SearchResult {
  constructor(data = {}) {
    this.id = data.id || null;
    this.provider = data.provider || '';
    this.serviceType = data.serviceType || '';
    this.title = data.title || '';
    this.description = data.description || '';
    this.price = data.price || 0;
    this.currency = data.currency || 'USD';
    this.rating = data.rating || null;
    this.reviewCount = data.reviewCount || 0;
    this.images = data.images || [];
    this.location = data.location || {};
    this.availability = data.availability || {};
    this.amenities = data.amenities || [];
    this.policies = data.policies || {};
    this.metadata = data.metadata || {};
    this.searchedAt = data.searchedAt || new Date().toISOString();
  }

  // Utility methods
  getFormattedPrice() {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency
    }).format(this.price);
  }

  getStarRating() {
    return this.rating ? Math.round(this.rating * 2) / 2 : null;
  }
}

// Export all models
export {
  User,
  Booking,
  Itinerary,
  TripSegment,
  Subscription,
  PaymentMethod,
  SearchResult
};

// Model factory functions
export const createUser = (data) => new User(data);
export const createBooking = (data) => new Booking(data);
export const createItinerary = (data) => new Itinerary(data);
export const createTripSegment = (data) => new TripSegment(data);
export const createSubscription = (data) => new Subscription(data);
export const createPaymentMethod = (data) => new PaymentMethod(data);
export const createSearchResult = (data) => new SearchResult(data);

// Validation utilities
export const validateModels = {
  user: (data) => new User(data).isValid(),
  booking: (data) => new Booking(data).isValid(),
  itinerary: (data) => new Itinerary(data).isValid(),
  tripSegment: (data) => new TripSegment(data).isValid(),
  subscription: (data) => new Subscription(data).isValid(),
  paymentMethod: (data) => new PaymentMethod(data).isValid()
};
