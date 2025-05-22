import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle } from 'lucide-react';

const CreateAccountPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to profile
    if (user) {
      navigate('/profile');
      return;
    }
    
    // Get email from localStorage
    const storedEmail = localStorage.getItem('checkoutEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/submit');
    }
  }, [navigate, user]);

  // Password validation
  const hasMinLength = password.length >= 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email) {
        throw new Error('Email is required');
      }

      if (!isPasswordValid) {
        throw new Error('Please ensure your password meets all requirements');
      }

      await signUp(email, password);
      
      // Clean up localStorage after successful signup
      localStorage.removeItem('checkoutEmail');
      
      // Navigate to video submission or profile
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="bg-black min-h-screen py-16">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-gray-900 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Create Your Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                
                <input
                  type="email"
                  value={email}
                  disabled
                  className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Create Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full bg-gray-950 border border-gray-800 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2 bg-gray-950 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-300 mb-2">
                  Password Requirements:
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className={hasMinLength ? 'text-green-500' : 'text-gray-500'}>
                      At least 6 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${hasUpperCase ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className={hasUpperCase ? 'text-green-500' : 'text-gray-500'}>
                      One uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${hasLowerCase ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className={hasLowerCase ? 'text-green-500' : 'text-gray-500'}>
                      One lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-gray-500'}`} />
                    <span className={hasNumber ? 'text-green-500' : 'text-gray-500'}>
                      One number
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-900 border border-red-700 text-white p-3 rounded-lg flex items-center">
                  <AlertTriangle size={18} className="mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={!isPasswordValid}
              >
                Create Account
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateAccountPage;