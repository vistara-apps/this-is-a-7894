/**
 * VoyageVerse Subscription Service
 * Handles subscription management, pricing, and business logic
 */

import { stripeAPI, voyageVerseAPI } from './api.js';
import { createSubscription } from '../models/index.js';

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Basic search functionality',
      'Up to 3 bookings per month',
      'Standard customer support',
      'Basic itinerary management'
    ],
    limits: {
      bookingsPerMonth: 3,
      itinerariesPerMonth: 5,
      apiCallsPerDay: 100
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 5,
    currency: 'USD',
    interval: 'month',
    stripeProductId: 'prod_premium_voyageverse',
    stripePriceId: 'price_premium_monthly',
    features: [
      'Advanced search with filters',
      'Unlimited bookings',
      'AI itinerary planning',
      'Advanced price alerts',
      'Priority customer support',
      'Calendar synchronization',
      'Offline access'
    ],
    limits: {
      bookingsPerMonth: -1, // unlimited
      itinerariesPerMonth: -1,
      apiCallsPerDay: 1000
    }
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 10,
    currency: 'USD',
    interval: 'month',
    stripeProductId: 'prod_business_voyageverse',
    stripePriceId: 'price_business_monthly',
    features: [
      'All Premium features',
      'White-label API access',
      'Enhanced analytics dashboard',
      'Team management',
      'Custom branding',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced reporting'
    ],
    limits: {
      bookingsPerMonth: -1,
      itinerariesPerMonth: -1,
      apiCallsPerDay: 10000,
      teamMembers: 10,
      whitelabelApps: 3
    }
  }
};

/**
 * Subscription Service Class
 */
export class SubscriptionService {
  constructor() {
    this.plans = SUBSCRIPTION_PLANS;
  }

  /**
   * Get all available subscription plans
   */
  getPlans() {
    return Object.values(this.plans);
  }

  /**
   * Get a specific plan by ID
   */
  getPlan(planId) {
    return this.plans[planId] || null;
  }

  /**
   * Check if user has access to a feature
   */
  hasFeatureAccess(userSubscription, feature) {
    const plan = this.getPlan(userSubscription?.planId || 'free');
    if (!plan) return false;

    const featureMap = {
      'advanced_search': ['premium', 'business'],
      'unlimited_bookings': ['premium', 'business'],
      'ai_planning': ['premium', 'business'],
      'price_alerts': ['premium', 'business'],
      'priority_support': ['premium', 'business'],
      'calendar_sync': ['premium', 'business'],
      'offline_access': ['premium', 'business'],
      'white_label_api': ['business'],
      'analytics': ['business'],
      'team_management': ['business'],
      'custom_branding': ['business']
    };

    return featureMap[feature]?.includes(plan.id) || false;
  }

  /**
   * Check usage limits
   */
  checkUsageLimit(userSubscription, limitType, currentUsage) {
    const plan = this.getPlan(userSubscription?.planId || 'free');
    if (!plan) return false;

    const limit = plan.limits[limitType];
    if (limit === -1) return true; // unlimited
    
    return currentUsage < limit;
  }

  /**
   * Create a new subscription
   */
  async createSubscription(userId, planId, paymentMethodId) {
    try {
      const plan = this.getPlan(planId);
      if (!plan) {
        throw new Error('Invalid subscription plan');
      }

      if (plan.id === 'free') {
        // Free plan doesn't require Stripe
        const subscriptionData = {
          userId: userId,
          planId: plan.id,
          planName: plan.name,
          status: 'active',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };

        return await voyageVerseAPI.createSubscription(subscriptionData);
      }

      // Create Stripe subscription for paid plans
      const stripeSubscription = await stripeAPI.createSubscription({
        customerId: userId, // This should be the Stripe customer ID
        priceId: plan.stripePriceId,
        paymentMethodId: paymentMethodId,
        metadata: {
          userId: userId,
          planId: plan.id
        }
      });

      // Create internal subscription record
      const subscriptionData = {
        userId: userId,
        planId: plan.id,
        planName: plan.name,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        stripeSubscriptionId: stripeSubscription.id,
        stripeCustomerId: stripeSubscription.customer
      };

      return await voyageVerseAPI.createSubscription(subscriptionData);
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscription(subscriptionId, newPlanId) {
    try {
      const newPlan = this.getPlan(newPlanId);
      if (!newPlan) {
        throw new Error('Invalid subscription plan');
      }

      // Get current subscription
      const currentSubscription = await voyageVerseAPI.getSubscription(subscriptionId);
      if (!currentSubscription) {
        throw new Error('Subscription not found');
      }

      // Update Stripe subscription if it's a paid plan
      if (newPlan.id !== 'free' && currentSubscription.stripeSubscriptionId) {
        await stripeAPI.updateSubscription(currentSubscription.stripeSubscriptionId, {
          priceId: newPlan.stripePriceId
        });
      }

      // Update internal subscription record
      const updateData = {
        planId: newPlan.id,
        planName: newPlan.name,
        updatedAt: new Date().toISOString()
      };

      return await voyageVerseAPI.updateSubscription(subscriptionId, updateData);
    } catch (error) {
      console.error('Subscription update error:', error);
      throw new Error('Failed to update subscription');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await voyageVerseAPI.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel Stripe subscription if it exists
      if (subscription.stripeSubscriptionId) {
        await stripeAPI.cancelSubscription(subscription.stripeSubscriptionId, {
          at_period_end: cancelAtPeriodEnd
        });
      }

      // Update internal subscription record
      const updateData = {
        status: cancelAtPeriodEnd ? 'active' : 'cancelled',
        cancelAtPeriodEnd: cancelAtPeriodEnd,
        updatedAt: new Date().toISOString()
      };

      return await voyageVerseAPI.updateSubscription(subscriptionId, updateData);
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get subscription usage statistics
   */
  async getUsageStats(userId, period = 'current_month') {
    try {
      const stats = await voyageVerseAPI.getUsageStats(userId, period);
      return {
        bookings: stats.bookings || 0,
        itineraries: stats.itineraries || 0,
        apiCalls: stats.apiCalls || 0,
        searchQueries: stats.searchQueries || 0,
        period: period
      };
    } catch (error) {
      console.error('Usage stats error:', error);
      return {
        bookings: 0,
        itineraries: 0,
        apiCalls: 0,
        searchQueries: 0,
        period: period
      };
    }
  }

  /**
   * Calculate subscription pricing with discounts
   */
  calculatePricing(planId, interval = 'month', discountCode = null) {
    const plan = this.getPlan(planId);
    if (!plan) return null;

    let price = plan.price;
    let discount = 0;

    // Apply annual discount
    if (interval === 'year') {
      discount = price * 12 * 0.2; // 20% annual discount
      price = price * 12 - discount;
    }

    // Apply discount codes
    if (discountCode) {
      const discountAmount = this.applyDiscountCode(discountCode, price);
      discount += discountAmount;
      price -= discountAmount;
    }

    return {
      planId: plan.id,
      planName: plan.name,
      basePrice: plan.price,
      finalPrice: Math.max(0, price),
      discount: discount,
      interval: interval,
      currency: plan.currency,
      savings: discount > 0 ? discount : null
    };
  }

  /**
   * Apply discount code
   */
  applyDiscountCode(discountCode, price) {
    const discountCodes = {
      'WELCOME10': { type: 'percentage', value: 0.1 }, // 10% off
      'SAVE20': { type: 'percentage', value: 0.2 }, // 20% off
      'FIRST5': { type: 'fixed', value: 5 }, // $5 off
      'STUDENT': { type: 'percentage', value: 0.5 } // 50% off for students
    };

    const discount = discountCodes[discountCode.toUpperCase()];
    if (!discount) return 0;

    if (discount.type === 'percentage') {
      return price * discount.value;
    } else if (discount.type === 'fixed') {
      return Math.min(discount.value, price);
    }

    return 0;
  }

  /**
   * Get subscription recommendations based on usage
   */
  getRecommendations(currentPlan, usageStats) {
    const recommendations = [];

    if (currentPlan === 'free') {
      if (usageStats.bookings >= 3 || usageStats.itineraries >= 5) {
        recommendations.push({
          type: 'upgrade',
          plan: 'premium',
          reason: 'You\'re approaching your monthly limits. Upgrade to Premium for unlimited bookings.',
          savings: 'Save time with advanced features and AI planning.'
        });
      }
    }

    if (currentPlan === 'premium') {
      if (usageStats.apiCalls >= 800) {
        recommendations.push({
          type: 'upgrade',
          plan: 'business',
          reason: 'High API usage detected. Business plan offers 10x more API calls.',
          savings: 'Get white-label access and team management features.'
        });
      }
    }

    return recommendations;
  }

  /**
   * Validate subscription status
   */
  async validateSubscription(userId) {
    try {
      const subscription = await voyageVerseAPI.getUserSubscription(userId);
      if (!subscription) {
        return { valid: false, plan: 'free' };
      }

      const now = new Date();
      const endDate = new Date(subscription.currentPeriodEnd);

      if (subscription.status === 'active' && now <= endDate) {
        return { 
          valid: true, 
          plan: subscription.planId,
          subscription: subscription
        };
      }

      // Subscription expired or cancelled
      return { 
        valid: false, 
        plan: 'free',
        expired: true,
        subscription: subscription
      };
    } catch (error) {
      console.error('Subscription validation error:', error);
      return { valid: false, plan: 'free' };
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();

// Export utility functions
export const hasFeatureAccess = (userSubscription, feature) => 
  subscriptionService.hasFeatureAccess(userSubscription, feature);

export const checkUsageLimit = (userSubscription, limitType, currentUsage) => 
  subscriptionService.checkUsageLimit(userSubscription, limitType, currentUsage);

export const getPlanFeatures = (planId) => {
  const plan = subscriptionService.getPlan(planId);
  return plan ? plan.features : [];
};

export const getPlanLimits = (planId) => {
  const plan = subscriptionService.getPlan(planId);
  return plan ? plan.limits : {};
};

export default subscriptionService;
