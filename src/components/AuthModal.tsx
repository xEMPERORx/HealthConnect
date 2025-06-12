import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userType, setUserType] = useState<'user' | 'doctor'>('user');
  const { signIn, signUp, resetPassword } = useAuth();

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isResetPassword) {
      try {
        await resetPassword(email);
        toast.success('Password reset instructions have been sent to your email');
        setIsResetPassword(false);
      } catch (error: any) {
        toast.error('Failed to send reset instructions. Please check your email address.');
      }
      return;
    }

    // Validate password length
    if (isSignUp && password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          return;
        }
        await signUp(email, password, userType, fullName);
        toast.success('Account created successfully!');
        if (userType === 'doctor') {
          toast.success('Your doctor account will be reviewed by an admin before activation.');
        }
      } else {
        await signIn(email, password);
        toast.success('Welcome back!');
      }
      onClose();
    } catch (error: any) {
      if (error.message?.includes('User already registered')) {
        toast.error('This email is already registered. Please sign in instead.');
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again or reset your password.');
      } else {
        toast.error(error.message || 'An error occurred');
      }
    }
  }

  function resetForm() {
    setEmail('');
    setPassword('');
    setFullName('');
    setUserType('user');
    setIsResetPassword(false);
    setIsSignUp(false);
  }

  if (isResetPassword) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
          
          <h2 className="text-2xl font-bold mb-6">Reset Password</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition-colors"
            >
              Send Reset Instructions
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsResetPassword(false)}
              className="text-sm text-rose-600 hover:text-rose-700"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6">
          {isSignUp ? 'Create Account' : 'Sign In'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="user"
                      checked={userType === 'user'}
                      onChange={(e) => setUserType(e.target.value as 'user' | 'doctor')}
                      className="mr-2"
                    />
                    Patient
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="doctor"
                      checked={userType === 'doctor'}
                      onChange={(e) => setUserType(e.target.value as 'user' | 'doctor')}
                      className="mr-2"
                    />
                    Doctor
                  </label>
                </div>
              </div>
            </>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500"
              required
              minLength={6}
            />
            {isSignUp && (
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 6 characters long
              </p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-rose-600 text-white py-2 px-4 rounded-md hover:bg-rose-700 transition-colors"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center space-y-2">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFullName('');
              setUserType('user');
            }}
            className="text-sm text-rose-600 hover:text-rose-700"
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
          
          {!isSignUp && (
            <div>
              <button
                onClick={() => setIsResetPassword(true)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Forgot your password?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}