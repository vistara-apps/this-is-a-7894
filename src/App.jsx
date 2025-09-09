import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SearchInterface from './components/SearchInterface';
import ItineraryManager from './components/ItineraryManager';
import BookingFlow from './components/BookingFlow';
import SubscriptionManager from './components/SubscriptionManager';
import PartnerDashboard from './components/PartnerDashboard';
import AuthModal from './components/AuthModal';
import SubscriptionManager from './components/SubscriptionManager';
import PartnerDashboard from './components/PartnerDashboard';
import { UserProvider } from './context/UserContext';
import { BookingProvider } from './context/BookingContext';

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <UserProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
            <Header onAuthClick={() => setShowAuthModal(true)} />
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/search" element={<SearchInterface />} />
                <Route path="/itinerary" element={<ItineraryManager />} />
                <Route path="/booking" element={<BookingFlow />} />
                <Route path="/subscription" element={<SubscriptionManager />} />
                <Route path="/partner" element={<PartnerDashboard />} />
              </Routes>
            </main>

            {showAuthModal && (
              <AuthModal onClose={() => setShowAuthModal(false)} />
            )}
          </div>
        </Router>
      </BookingProvider>
    </UserProvider>
  );
}

export default App;
