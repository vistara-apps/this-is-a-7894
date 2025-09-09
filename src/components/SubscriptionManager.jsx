/**
 * VoyageVerse Subscription Manager Component
 * Handles subscription plans, upgrades, and billing
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { subscriptionService, SUBSCRIPTION_PLANS } from '../services/subscriptionService';
import { stripeAPI } from '../services/api';
import Button from './ui/Button';
import { 
  Check, 
  Crown, 
  Building, 
  CreditCard, 
  Calendar,
  TrendingUp,
  AlertCircle,
  Star
} from 'lucide-react';

const SubscriptionManager = () => {
  const { user } = useUser();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingInterval, setBillingInterval] = useState('month');

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const [subscription, stats] = await Promise.all([
        subscriptionService.validateSubscription(user.userId),
        subscriptionService.getUsageStats(user.userId)
      ]);

      setCurrentSubscription(subscription);
      setUsageStats(stats);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    if (!user?.userId) return;

    try {
      setUpgrading(true);
      setSelectedPlan(planId);

      // For demo purposes, we'll simulate the upgrade process
      // In a real implementation, this would integrate with Stripe
      const result = await subscriptionService.createSubscription(
        user.userId,
        planId,
        'pm_demo_payment_method' // Demo payment method
      );

      if (result) {
        await loadSubscriptionData();
        setSelectedPlan(null);
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      alert('Upgrade failed. Please try again.');
    } finally {
      setUpgrading(false);
    }
  };

  const getPlanIcon = (planId) => {
    switch (planId) {
      case 'premium':
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 'business':
        return <Building className="h-6 w-6 text-blue-500" />;
      default:
        return <Star className="h-6 w-6 text-gray-400" />;
    }
  };

  const getUsagePercentage = (current, limit) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((current / limit) * 100, 100);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPlan = currentSubscription?.plan || 'free';
  const plans = Object.values(SUBSCRIPTION_PLANS);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Current Subscription Status */}
      <div className="bg-surface rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-text-primary">Current Plan</h2>
          {currentSubscription?.subscription && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-3">
            {getPlanIcon(currentPlan)}
            <div>
              <h3 className="font-medium text-text-primary">
                {SUBSCRIPTION_PLANS[currentPlan]?.name || 'Free'}
              </h3>
              <p className="text-sm text-text-secondary">
                ${SUBSCRIPTION_PLANS[currentPlan]?.price || 0}/month
              </p>
            </div>
          </div>

          {currentSubscription?.subscription && (
            <>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Next Billing</p>
                  <p className="text-sm text-text-secondary">
                    {new Date(currentSubscription.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-text-secondary" />
                <div>
                  <p className="text-sm font-medium text-text-primary">Payment Method</p>
                  <p className="text-sm text-text-secondary">•••• 4242</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      {usageStats && (
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Usage This Month</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary">Bookings</span>
                <span className="text-sm text-text-secondary">
                  {usageStats.bookings} / {SUBSCRIPTION_PLANS[currentPlan]?.limits.bookingsPerMonth === -1 ? '∞' : SUBSCRIPTION_PLANS[currentPlan]?.limits.bookingsPerMonth}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usageStats.bookings, SUBSCRIPTION_PLANS[currentPlan]?.limits.bookingsPerMonth))} bg-current`}
                  style={{ width: `${getUsagePercentage(usageStats.bookings, SUBSCRIPTION_PLANS[currentPlan]?.limits.bookingsPerMonth)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary">Itineraries</span>
                <span className="text-sm text-text-secondary">
                  {usageStats.itineraries} / {SUBSCRIPTION_PLANS[currentPlan]?.limits.itinerariesPerMonth === -1 ? '∞' : SUBSCRIPTION_PLANS[currentPlan]?.limits.itinerariesPerMonth}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usageStats.itineraries, SUBSCRIPTION_PLANS[currentPlan]?.limits.itinerariesPerMonth))} bg-current`}
                  style={{ width: `${getUsagePercentage(usageStats.itineraries, SUBSCRIPTION_PLANS[currentPlan]?.limits.itinerariesPerMonth)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary">API Calls</span>
                <span className="text-sm text-text-secondary">
                  {usageStats.apiCalls} / {SUBSCRIPTION_PLANS[currentPlan]?.limits.apiCallsPerDay === -1 ? '∞' : SUBSCRIPTION_PLANS[currentPlan]?.limits.apiCallsPerDay}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(usageStats.apiCalls, SUBSCRIPTION_PLANS[currentPlan]?.limits.apiCallsPerDay))} bg-current`}
                  style={{ width: `${getUsagePercentage(usageStats.apiCalls, SUBSCRIPTION_PLANS[currentPlan]?.limits.apiCallsPerDay)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <div className="bg-surface rounded-lg p-1 border border-border">
          <button
            onClick={() => setBillingInterval('month')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingInterval === 'month'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('year')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              billingInterval === 'year'
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs bg-green-100 text-green-800 px-1 rounded">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlan;
          const pricing = subscriptionService.calculatePricing(plan.id, billingInterval);
          
          return (
            <div
              key={plan.id}
              className={`relative bg-surface rounded-lg border p-6 ${
                isCurrentPlan 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-border hover:border-primary/50'
              } transition-all`}
            >
              {plan.id === 'premium' && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  {getPlanIcon(plan.id)}
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-text-primary">
                    ${pricing?.finalPrice || plan.price}
                  </span>
                  <span className="text-text-secondary">
                    /{billingInterval === 'year' ? 'year' : 'month'}
                  </span>
                </div>
                {billingInterval === 'year' && pricing?.savings && (
                  <p className="text-sm text-green-600 font-medium">
                    Save ${pricing.savings.toFixed(2)} per year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-text-primary">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={isCurrentPlan ? 'secondary' : 'primary'}
                className="w-full"
                disabled={isCurrentPlan || upgrading}
                loading={upgrading && selectedPlan === plan.id}
                onClick={() => !isCurrentPlan && handleUpgrade(plan.id)}
              >
                {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {usageStats && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Upgrade Recommendation</h4>
              <p className="text-sm text-blue-700">
                {currentPlan === 'free' && usageStats.bookings >= 2
                  ? "You're approaching your monthly booking limit. Consider upgrading to Premium for unlimited bookings and advanced features."
                  : currentPlan === 'premium' && usageStats.apiCalls >= 800
                  ? "High API usage detected. Business plan offers 10x more API calls and white-label features."
                  : "You're on the perfect plan for your current usage!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;
