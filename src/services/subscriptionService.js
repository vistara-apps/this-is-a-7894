// Subscription service for managing user plans and features

export const SUBSCRIPTION_PLANS = {
  FREE: 'free',
  PREMIUM: 'premium',
  BUSINESS: 'business'
};

export const PLAN_FEATURES = {
  [SUBSCRIPTION_PLANS.FREE]: {
    maxBookings: 3,
    maxItineraries: 2,
    whiteLabelApi: false,
    advancedSearch: false,
    aiPlanning: false,
    prioritySupport: false
  },
  [SUBSCRIPTION_PLANS.PREMIUM]: {
    maxBookings: -1, // unlimited
    maxItineraries: -1, // unlimited
    whiteLabelApi: false,
    advancedSearch: true,
    aiPlanning: true,
    prioritySupport: true
  },
  [SUBSCRIPTION_PLANS.BUSINESS]: {
    maxBookings: -1, // unlimited
    maxItineraries: -1, // unlimited
    whiteLabelApi: true,
    advancedSearch: true,
    aiPlanning: true,
    prioritySupport: true
  }
};

export const hasFeatureAccess = (subscription, feature) => {
  if (!subscription) return false;

  const planFeatures = PLAN_FEATURES[subscription.plan] || PLAN_FEATURES.FREE;
  return planFeatures[feature] || false;
};

export const getPlanLimits = (subscription) => {
  if (!subscription) return PLAN_FEATURES.FREE;

  return PLAN_FEATURES[subscription.plan] || PLAN_FEATURES.FREE;
};

export const canCreateBooking = (subscription, currentBookingsCount) => {
  const limits = getPlanLimits(subscription);
  if (limits.maxBookings === -1) return true; // unlimited
  return currentBookingsCount < limits.maxBookings;
};

export const canCreateItinerary = (subscription, currentItinerariesCount) => {
  const limits = getPlanLimits(subscription);
  if (limits.maxItineraries === -1) return true; // unlimited
  return currentItinerariesCount < limits.maxItineraries;
};

