/**
 * VoyageVerse Partner Dashboard Component
 * B2B dashboard for white-label partners and API users
 */

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { whiteLabelService } from '../services/whiteLabelService';
import { hasFeatureAccess } from '../services/subscriptionService';
import Button from './ui/Button';
import Input from './ui/Input';
import { 
  Key, 
  Globe, 
  BarChart3, 
  DollarSign, 
  Users, 
  Code, 
  Settings,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ExternalLink,
  TrendingUp,
  Calendar
} from 'lucide-react';

const PartnerDashboard = () => {
  const { user } = useUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState({});
  const [newAppModal, setNewAppModal] = useState(false);
  const [newApiKeyModal, setNewApiKeyModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const data = await whiteLabelService.getPartnerDashboard(user.userId);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load partner dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (appName, description) => {
    try {
      const result = await whiteLabelService.generateApiKey(user.userId, appName, description);
      await loadDashboardData();
      setNewApiKeyModal(false);
      return result;
    } catch (error) {
      console.error('Failed to create API key:', error);
      throw error;
    }
  };

  const handleRevokeApiKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await whiteLabelService.revokeApiKey(keyId);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const toggleApiKeyVisibility = (keyId) => {
    setShowApiKey(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasFeatureAccess(user?.subscription, 'white_label_api')) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-text-primary mb-2">
            Business Subscription Required
          </h2>
          <p className="text-text-secondary mb-6">
            Upgrade to a Business plan to access white-label features and API management.
          </p>
          <Button onClick={() => window.location.href = '/subscription'}>
            Upgrade to Business
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'applications', label: 'Applications', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'revenue', label: 'Revenue', icon: DollarSign }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Partner Dashboard</h1>
        <p className="text-text-secondary">
          Manage your white-label applications and API integrations
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total Apps</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {dashboardData.quickStats.totalApps}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Active API Keys</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {dashboardData.quickStats.activeApiKeys}
                  </p>
                </div>
                <Key className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">Total Bookings</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {dashboardData.quickStats.totalBookings}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">This Month Revenue</p>
                  <p className="text-2xl font-bold text-text-primary">
                    ${dashboardData.revenue.thisMonth.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-surface rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4">API Usage (Last 7 Days)</h3>
            <div className="space-y-4">
              {dashboardData.analytics.requestsByDay.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{day.date}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-text-primary">
                      {day.requests} requests
                    </span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(day.requests / Math.max(...dashboardData.analytics.requestsByDay.map(d => d.requests))) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api-keys' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-text-primary">API Keys</h2>
            <Button onClick={() => setNewApiKeyModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          </div>

          <div className="space-y-4">
            {dashboardData?.apiKeys?.map((apiKey) => (
              <div key={apiKey.keyId} className="bg-surface rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-text-primary">{apiKey.appName}</h3>
                    <p className="text-sm text-text-secondary">{apiKey.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apiKey.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {apiKey.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeApiKey(apiKey.keyId)}
                      disabled={apiKey.status !== 'active'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-1">
                      API Key
                    </label>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                        {showApiKey[apiKey.keyId] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleApiKeyVisibility(apiKey.keyId)}
                      >
                        {showApiKey[apiKey.keyId] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.key)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-text-secondary">Rate Limit:</span>
                      <span className="ml-2 text-text-primary">
                        {apiKey.rateLimit.requestsPerMinute}/min
                      </span>
                    </div>
                    <div>
                      <span className="text-text-secondary">Created:</span>
                      <span className="ml-2 text-text-primary">
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-text-primary">White-Label Applications</h2>
            <Button onClick={() => setNewAppModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Application
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData?.applications?.map((app) => (
              <div key={app.appId} className="bg-surface rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-primary">{app.appName}</h3>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-text-secondary">Domain:</span>
                    <span className="ml-2 text-sm text-text-primary">{app.domain}</span>
                  </div>
                  
                  <div>
                    <span className="text-sm text-text-secondary">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      app.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && dashboardData?.analytics && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Analytics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface rounded-lg p-6 border border-border">
              <h3 className="font-medium text-text-primary mb-4">API Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Total Requests</span>
                  <span className="text-sm font-medium text-text-primary">
                    {dashboardData.analytics.totalRequests.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Success Rate</span>
                  <span className="text-sm font-medium text-text-primary">
                    {((1 - dashboardData.analytics.errorRate) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-text-secondary">Avg Response Time</span>
                  <span className="text-sm font-medium text-text-primary">
                    {dashboardData.analytics.averageResponseTime}ms
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <h3 className="font-medium text-text-primary mb-4">Top Endpoints</h3>
              <div className="space-y-3">
                {dashboardData.analytics.topEndpoints.slice(0, 5).map((endpoint, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-text-secondary">{endpoint.path}</span>
                    <span className="text-sm font-medium text-text-primary">
                      {endpoint.requests}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && dashboardData?.revenue && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-text-primary">Revenue & Payouts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-text-primary">This Month</h3>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-text-primary">
                ${dashboardData.revenue.thisMonth.toFixed(2)}
              </p>
              <p className="text-sm text-text-secondary">
                From {dashboardData.quickStats.totalBookings} bookings
              </p>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-text-primary">Next Payout</h3>
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-text-primary">
                ${dashboardData.revenue.nextPayout.amount.toFixed(2)}
              </p>
              <p className="text-sm text-text-secondary">
                {new Date(dashboardData.revenue.nextPayout.date).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-surface rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-text-primary">Avg Booking Value</h3>
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-text-primary">
                ${dashboardData.quickStats.averageBookingValue.toFixed(2)}
              </p>
              <p className="text-sm text-text-secondary">
                Per transaction
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals would go here - simplified for brevity */}
      {newApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Create API Key</h3>
            <div className="space-y-4">
              <Input label="Application Name" placeholder="My Travel App" />
              <Input label="Description" placeholder="API key for production use" />
              <div className="flex space-x-3">
                <Button onClick={() => setNewApiKeyModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button className="flex-1">Create Key</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerDashboard;
