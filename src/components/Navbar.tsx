import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Calendar, Stethoscope, MessageCircle, User, Info } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-rose-600" />
            <span className="text-xl font-bold text-gray-800">HealthConnect</span>
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/cancer-info" className="flex items-center space-x-1 text-gray-600 hover:text-rose-600">
              <Info className="h-5 w-5" />
              <span>Cancer Info</span>
            </Link>
            <Link to="/stories" className="flex items-center space-x-1 text-gray-600 hover:text-rose-600">
              <MessageCircle className="h-5 w-5" />
              <span>Stories</span>
            </Link>
            <Link to="/events" className="flex items-center space-x-1 text-gray-600 hover:text-rose-600">
              <Calendar className="h-5 w-5" />
              <span>Events</span>
            </Link>
            <Link to="/consultations" className="flex items-center space-x-1 text-gray-600 hover:text-rose-600">
              <Stethoscope className="h-5 w-5" />
              <span>Consultations</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
                >
                  <User className="h-6 w-6" />
                  <span>{profile?.full_name || 'Profile'}</span>
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    {profile?.role === 'doctor' ? (
                      <Link
                        to="/doctor/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Doctor Dashboard
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        My Consultations
                      </Link>
                    )}
                    {profile?.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}

export default Navbar;