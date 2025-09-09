/**
 * VoyageVerse White-Label Service
 * Handles B2B white-label and API functionality for business partners
 */

import { voyageVerseAPI } from './api.js';
import { hasFeatureAccess } from './subscriptionService.js';

/**
 * White-Label Service Class
 * Provides B2B functionality for travel agencies and corporate partners
 */
export class WhiteLabelService {
  constructor() {
    this.apiVersions = ['v1', 'v2'];
    this.supportedEndpoints = [
      'search/flights',
      'search/hotels',
      'search/cars',
      'search/experiences',
      'search/restaurants',
      'bookings',
      'itineraries',
      'users'
    ];
  }

  /**
   * Generate API key for a business partner
   */
  async generateApiKey(userId, appName, description = '') {
    try {
      // Check if user has business subscription
      const subscription = await voyageVerseAPI.getUserSubscription(userId);
      if (!hasFeatureAccess(subscription, 'white_label_api')) {
        throw new Error('Business subscription required for API access');
      }

      const apiKeyData = {
        userId: userId,
        appName: appName,
        description: description,
        keyType: 'production',
        permissions: this.getDefaultPermissions(),
        rateLimit: this.getRateLimit(subscription.planId),
        status: 'active',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
      };

      const response = await voyageVerseAPI.createApiKey(apiKeyData);
      return {
        apiKey: response.apiKey,
        keyId: response.keyId,
        permissions: response.permissions,
        rateLimit: response.rateLimit,
        documentation: this.getApiDocumentation()
      };
    } catch (error) {
      console.error('API key generation error:', error);
      throw new Error('Failed to generate API key');
    }
  }

  /**
   * Get default API permissions based on subscription
   */
  getDefaultPermissions() {
    return {
      search: {
        flights: true,
        hotels: true,
        cars: true,
        experiences: true,
        restaurants: true
      },
      bookings: {
        create: true,
        read: true,
        update: true,
        cancel: true
      },
      itineraries: {
        create: true,
        read: true,
        update: true,
        delete: true
      },
      users: {
        create: true,
        read: true,
        update: true
      },
      analytics: {
        basic: true,
        advanced: false
      }
    };
  }

  /**
   * Get rate limits based on subscription plan
   */
  getRateLimit(planId) {
    const rateLimits = {
      free: { requestsPerMinute: 10, requestsPerDay: 100 },
      premium: { requestsPerMinute: 100, requestsPerDay: 1000 },
      business: { requestsPerMinute: 1000, requestsPerDay: 10000 }
    };

    return rateLimits[planId] || rateLimits.free;
  }

  /**
   * Create white-label application configuration
   */
  async createWhiteLabelApp(userId, config) {
    try {
      const subscription = await voyageVerseAPI.getUserSubscription(userId);
      if (!hasFeatureAccess(subscription, 'white_label_api')) {
        throw new Error('Business subscription required for white-label apps');
      }

      const appConfig = {
        userId: userId,
        appName: config.appName,
        domain: config.domain,
        branding: {
          logo: config.branding?.logo || '',
          primaryColor: config.branding?.primaryColor || '#3B82F6',
          secondaryColor: config.branding?.secondaryColor || '#1E40AF',
          fontFamily: config.branding?.fontFamily || 'Inter',
          customCss: config.branding?.customCss || ''
        },
        features: {
          searchEnabled: config.features?.searchEnabled !== false,
          bookingEnabled: config.features?.bookingEnabled !== false,
          itineraryEnabled: config.features?.itineraryEnabled !== false,
          paymentEnabled: config.features?.paymentEnabled !== false,
          userManagement: config.features?.userManagement !== false
        },
        integrations: {
          googleAnalytics: config.integrations?.googleAnalytics || '',
          facebookPixel: config.integrations?.facebookPixel || '',
          customScripts: config.integrations?.customScripts || []
        },
        settings: {
          defaultCurrency: config.settings?.defaultCurrency || 'USD',
          defaultLanguage: config.settings?.defaultLanguage || 'en',
          timezone: config.settings?.timezone || 'UTC',
          commissionRate: config.settings?.commissionRate || 0.05 // 5% default
        },
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const response = await voyageVerseAPI.createWhiteLabelApp(appConfig);
      return {
        appId: response.appId,
        embedCode: this.generateEmbedCode(response.appId),
        apiEndpoint: `${process.env.VITE_API_BASE_URL}/whitelabel/${response.appId}`,
        documentation: this.getWhiteLabelDocumentation()
      };
    } catch (error) {
      console.error('White-label app creation error:', error);
      throw new Error('Failed to create white-label application');
    }
  }

  /**
   * Generate embed code for white-label app
   */
  generateEmbedCode(appId) {
    return `
<!-- VoyageVerse White-Label Travel Widget -->
<div id="voyageverse-widget-${appId}"></div>
<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.VITE_API_BASE_URL}/widget/${appId}/embed.js';
    script.async = true;
    document.head.appendChild(script);
    
    window.VoyageVerseConfig = {
      appId: '${appId}',
      container: 'voyageverse-widget-${appId}',
      theme: 'auto',
      language: 'auto'
    };
  })();
</script>
    `.trim();
  }

  /**
   * Get API usage analytics for a partner
   */
  async getApiAnalytics(userId, period = '30d') {
    try {
      const analytics = await voyageVerseAPI.getApiAnalytics(userId, period);
      
      return {
        period: period,
        totalRequests: analytics.totalRequests || 0,
        successfulRequests: analytics.successfulRequests || 0,
        errorRate: analytics.errorRate || 0,
        averageResponseTime: analytics.averageResponseTime || 0,
        topEndpoints: analytics.topEndpoints || [],
        requestsByDay: analytics.requestsByDay || [],
        errorsByType: analytics.errorsByType || {},
        geographicDistribution: analytics.geographicDistribution || {},
        revenue: {
          totalCommissions: analytics.revenue?.totalCommissions || 0,
          bookingCount: analytics.revenue?.bookingCount || 0,
          averageBookingValue: analytics.revenue?.averageBookingValue || 0
        }
      };
    } catch (error) {
      console.error('API analytics error:', error);
      throw new Error('Failed to fetch API analytics');
    }
  }

  /**
   * Manage API key permissions
   */
  async updateApiKeyPermissions(keyId, permissions) {
    try {
      const updateData = {
        permissions: permissions,
        updatedAt: new Date().toISOString()
      };

      return await voyageVerseAPI.updateApiKey(keyId, updateData);
    } catch (error) {
      console.error('API key update error:', error);
      throw new Error('Failed to update API key permissions');
    }
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId) {
    try {
      const updateData = {
        status: 'revoked',
        revokedAt: new Date().toISOString()
      };

      return await voyageVerseAPI.updateApiKey(keyId, updateData);
    } catch (error) {
      console.error('API key revocation error:', error);
      throw new Error('Failed to revoke API key');
    }
  }

  /**
   * Get API documentation
   */
  getApiDocumentation() {
    return {
      baseUrl: `${process.env.VITE_API_BASE_URL}/api/v1`,
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer YOUR_API_KEY',
        example: 'Authorization: Bearer vv_live_1234567890abcdef'
      },
      endpoints: {
        search: {
          flights: {
            method: 'POST',
            path: '/search/flights',
            description: 'Search for flights',
            parameters: {
              origin: { type: 'string', required: true, description: 'Origin airport code' },
              destination: { type: 'string', required: true, description: 'Destination airport code' },
              departureDate: { type: 'string', required: true, description: 'Departure date (YYYY-MM-DD)' },
              returnDate: { type: 'string', required: false, description: 'Return date (YYYY-MM-DD)' },
              adults: { type: 'integer', required: false, default: 1, description: 'Number of adults' },
              children: { type: 'integer', required: false, default: 0, description: 'Number of children' },
              travelClass: { type: 'string', required: false, default: 'ECONOMY', description: 'Travel class' }
            }
          },
          hotels: {
            method: 'POST',
            path: '/search/hotels',
            description: 'Search for hotels',
            parameters: {
              cityCode: { type: 'string', required: true, description: 'City code' },
              checkInDate: { type: 'string', required: true, description: 'Check-in date (YYYY-MM-DD)' },
              checkOutDate: { type: 'string', required: true, description: 'Check-out date (YYYY-MM-DD)' },
              adults: { type: 'integer', required: false, default: 1, description: 'Number of adults' },
              roomQuantity: { type: 'integer', required: false, default: 1, description: 'Number of rooms' }
            }
          }
        },
        bookings: {
          create: {
            method: 'POST',
            path: '/bookings',
            description: 'Create a new booking',
            parameters: {
              serviceType: { type: 'string', required: true, description: 'Type of service (flight, hotel, car, etc.)' },
              serviceId: { type: 'string', required: true, description: 'Service identifier from search results' },
              customerInfo: { type: 'object', required: true, description: 'Customer information' },
              paymentMethodId: { type: 'string', required: true, description: 'Payment method identifier' }
            }
          },
          get: {
            method: 'GET',
            path: '/bookings/{bookingId}',
            description: 'Get booking details',
            parameters: {
              bookingId: { type: 'string', required: true, description: 'Booking identifier' }
            }
          }
        }
      },
      examples: {
        flightSearch: {
          request: {
            method: 'POST',
            url: '/api/v1/search/flights',
            headers: {
              'Authorization': 'Bearer YOUR_API_KEY',
              'Content-Type': 'application/json'
            },
            body: {
              origin: 'NYC',
              destination: 'LAX',
              departureDate: '2024-12-01',
              returnDate: '2024-12-08',
              adults: 2,
              travelClass: 'ECONOMY'
            }
          },
          response: {
            status: 200,
            data: {
              flights: [
                {
                  id: 'flight_123',
                  airline: 'American Airlines',
                  flightNumber: 'AA123',
                  departure: {
                    airport: 'JFK',
                    time: '2024-12-01T08:00:00Z'
                  },
                  arrival: {
                    airport: 'LAX',
                    time: '2024-12-01T11:30:00Z'
                  },
                  price: 299.99,
                  currency: 'USD'
                }
              ]
            }
          }
        }
      },
      rateLimits: {
        description: 'API requests are rate limited based on your subscription plan',
        limits: {
          free: '10 requests/minute, 100 requests/day',
          premium: '100 requests/minute, 1,000 requests/day',
          business: '1,000 requests/minute, 10,000 requests/day'
        }
      },
      errorCodes: {
        400: 'Bad Request - Invalid parameters',
        401: 'Unauthorized - Invalid API key',
        403: 'Forbidden - Insufficient permissions',
        429: 'Too Many Requests - Rate limit exceeded',
        500: 'Internal Server Error - Server error'
      }
    };
  }

  /**
   * Get white-label documentation
   */
  getWhiteLabelDocumentation() {
    return {
      overview: 'VoyageVerse White-Label solution allows you to embed our travel booking functionality into your website or application with your own branding.',
      integration: {
        embed: {
          description: 'Embed the widget directly into your website',
          steps: [
            'Copy the provided embed code',
            'Paste it into your HTML where you want the widget to appear',
            'Customize the appearance using CSS or configuration options'
          ]
        },
        api: {
          description: 'Use our REST API to build a custom integration',
          steps: [
            'Obtain your API key from the dashboard',
            'Make requests to our API endpoints',
            'Handle responses and display results in your application'
          ]
        }
      },
      customization: {
        branding: {
          logo: 'Upload your company logo',
          colors: 'Customize primary and secondary colors',
          fonts: 'Choose from available font families',
          css: 'Add custom CSS for advanced styling'
        },
        features: {
          search: 'Enable/disable search functionality',
          booking: 'Enable/disable booking capabilities',
          itinerary: 'Enable/disable itinerary management',
          payment: 'Configure payment processing'
        }
      },
      revenue: {
        commissions: 'Earn commissions on bookings made through your integration',
        rates: 'Commission rates vary by service type and volume',
        payouts: 'Monthly payouts via bank transfer or PayPal'
      }
    };
  }

  /**
   * Calculate commission for a booking
   */
  calculateCommission(bookingAmount, serviceType, partnerTier = 'standard') {
    const commissionRates = {
      standard: {
        flight: 0.02,    // 2%
        hotel: 0.05,     // 5%
        car: 0.03,       // 3%
        experience: 0.08, // 8%
        restaurant: 0.10  // 10%
      },
      premium: {
        flight: 0.025,   // 2.5%
        hotel: 0.06,     // 6%
        car: 0.035,      // 3.5%
        experience: 0.10, // 10%
        restaurant: 0.12  // 12%
      }
    };

    const rate = commissionRates[partnerTier]?.[serviceType] || 0.02;
    return Math.round(bookingAmount * rate * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get partner dashboard data
   */
  async getPartnerDashboard(userId) {
    try {
      const [analytics, apps, apiKeys] = await Promise.all([
        this.getApiAnalytics(userId, '30d'),
        voyageVerseAPI.getWhiteLabelApps(userId),
        voyageVerseAPI.getApiKeys(userId)
      ]);

      return {
        analytics: analytics,
        applications: apps,
        apiKeys: apiKeys,
        revenue: {
          thisMonth: analytics.revenue.totalCommissions,
          lastMonth: 0, // Would need historical data
          growth: 0,
          nextPayout: this.calculateNextPayout(analytics.revenue.totalCommissions)
        },
        quickStats: {
          totalApps: apps.length,
          activeApiKeys: apiKeys.filter(key => key.status === 'active').length,
          totalBookings: analytics.revenue.bookingCount,
          averageBookingValue: analytics.revenue.averageBookingValue
        }
      };
    } catch (error) {
      console.error('Partner dashboard error:', error);
      throw new Error('Failed to load partner dashboard');
    }
  }

  /**
   * Calculate next payout date and amount
   */
  calculateNextPayout(currentCommissions) {
    const minimumPayout = 50; // $50 minimum
    const nextPayoutDate = new Date();
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
    nextPayoutDate.setDate(1); // First of next month

    return {
      amount: currentCommissions >= minimumPayout ? currentCommissions : 0,
      date: nextPayoutDate.toISOString(),
      eligible: currentCommissions >= minimumPayout,
      minimumRequired: minimumPayout
    };
  }
}

// Export singleton instance
export const whiteLabelService = new WhiteLabelService();

export default whiteLabelService;
