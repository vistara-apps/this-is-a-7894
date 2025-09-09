import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useUser } from '../context/UserContext';
import { Plane, User, Menu } from 'lucide-react';

const Header = ({ onAuthClick }) => {
  const { user, isAuthenticated, logout } = useUser();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', current: location.pathname === '/' },
    { name: 'Search', href: '/search', current: location.pathname === '/search' },
    { name: 'Itinerary', href: '/itinerary', current: location.pathname === '/itinerary' },
  ];

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VoyageVerse</h1>
              <p className="text-xs text-white/80 hidden sm:block">Your entire trip, perfectly organized</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.current
                    ? 'text-white border-b-2 border-accent pb-1'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth & Wallet */}
          <div className="flex items-center space-x-4">
            <ConnectButton />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-white text-sm hidden sm:block">
                  {user?.firstName}
                </span>
                <button
                  onClick={logout}
                  className="text-white/80 hover:text-white text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;