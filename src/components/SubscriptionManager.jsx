import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { SUBSCRIPTION_PLANS, PLAN_FEATURES, hasFeatureAccess } from '../services/subscriptionService';
import Button from './ui/Button';
import { Check, Star, Zap, Crown } from 'lucide-react';

const SubscriptionManager = () => {
  const { user, updateUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(user?.subscription?.plan || SUBSCRIPTION_PLANS.FREE);

  const plans = [
    {
      id: SUBSCRIPTION_PLANS.FREE,
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      icon: Star,
      features: [
        '3 bookings per month',
        '2 itineraries per month',
        'Basic search functionality',
        'Email support'
      ]
    },
    {
      id: SUBSCRIPTION_PLANS.PREMIUM,
      name: 'Premium',
      price: 5,
      description: 'For frequent travelers',
      icon: Zap,
      features: [
        'Unlimited bookings',
        'Unlimited itineraries',
        'Advanced price alerts',
        'AI itinerary planning',
        'Priority support',
        'Calendar synchronization'
      ],
      popular: true
    },
    {
      id: SUBSCRIPTION_PLANS.BUSINESS,
      name: 'Business',
      price: 10,
      description: 'For teams and businesses',
      icon: Crown,
      features: [
        'All Premium features',
        'White-label API access',
        'Partner dashboard',
        'Revenue analytics',
        'Custom branding',
        'Dedicated support',
        '10,000 API calls/day'
      ]
    }
  ];

  const handleUpgrade = async (planId) => {
    setLoading(true);
    try {
      // In a real app, this would call a payment service
      const updatedUser = {
        ...user,
        subscription: {
          plan: planId,
          status: 'active',
          startDate: new Date().toISOString(),
          features: PLAN_FEATURES[planId]
        }
      };

      updateUser(updatedUser);
      setSelectedPlan(planId);
    } catch (error) {
      console.error('Failed to upgrade subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = user?.subscription?.plan || SUBSCRIPTION_PLANS.FREE;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-text-primary mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-text-secondary">
          Unlock the full potential of VoyageVerse with our flexible pricing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          const isSelected = selectedPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative bg-surface rounded-xl border-2 p-8 transition-all ${
                plan.popular
                  ? 'border-primary shadow-lg scale-105'
                  : isSelected
                  ? 'border-primary'
                  : 'border-border hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <Icon className={`h-12 w-12 mx-auto mb-4 ${
                  plan.popular ? 'text-primary' : 'text-gray-400'
                }`} />
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  {plan.name}
                </h3>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-text-primary">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-text-secondary">/month</span>
                  )}
                </div>
                <p className="text-text-secondary">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="text-center">
                {isCurrentPlan ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                    loading={loading && isSelected}
                  >
                    {plan.price === 0 ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Usage */}
      {user?.subscription && (
        <div className="bg-surface rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Current Usage
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">Bookings</span>
                <span className="text-sm font-medium text-text-primary">
                  {user.bookingsCount || 0} / {PLAN_FEATURES[currentPlan].maxBookings === -1 ? '∞' : PLAN_FEATURES[currentPlan].maxBookings}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: PLAN_FEATURES[currentPlan].maxBookings === -1
                      ? '100%'
                      : `${Math.min((user.bookingsCount || 0) / PLAN_FEATURES[currentPlan].maxBookings * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">Itineraries</span>
                <span className="text-sm font-medium text-text-primary">
                  {user.itinerariesCount || 0} / {PLAN_FEATURES[currentPlan].maxItineraries === -1 ? '∞' : PLAN_FEATURES[currentPlan].maxItineraries}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: PLAN_FEATURES[currentPlan].maxItineraries === -1
                      ? '100%'
                      : `${Math.min((user.itinerariesCount || 0) / PLAN_FEATURES[currentPlan].maxItineraries * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-text-secondary">API Calls</span>
                <span className="text-sm font-medium text-text-primary">
                  {user.apiCallsCount || 0} / {hasFeatureAccess(user.subscription, 'whiteLabelApi') ? '10,000' : '0'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: hasFeatureAccess(user.subscription, 'whiteLabelApi')
                      ? `${Math.min((user.apiCallsCount || 0) / 10000 * 100, 100)}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;

