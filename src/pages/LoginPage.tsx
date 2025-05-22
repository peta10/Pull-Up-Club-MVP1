import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

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
      // Regular user authentication
      if (isSignUp) {
        if (!isPasswordValid) {
          throw new Error('Please ensure your password meets all requirements');
        }
        await signUp(email, password);
        navigate('/profile');
      } else {
        await signIn(email, password);
        navigate('/profile');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      if (errorMessage.includes('invalid_credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (errorMessage.includes('email_not_confirmed')) {
        setError('Your email has not been confirmed. Please check your inbox for a confirmation link or contact support.');
      } else if (errorMessage.includes('email')) {
        setError('Please enter a valid email address.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center space-x-2 text-sm">
      <CheckCircle2 
        size={16} 
        className={met ? 'text-green-500' : 'text-gray-500'} 
      />
      <span className={met ? 'text-green-500' : 'text-gray-500'}>{text}</span>
    </div>
  );

  return (
    <Layout>
      <div className="bg-black min-h-screen py-16">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-gray-900 rounded-lg p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            
            {!isSignUp && (
              <p className="text-[#9b9b6f] text-center mb-6">
                Don't have an account? Click "Sign up" below. Already have one? Just log in
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full bg-gray-950 border border-gray-800 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#9b9b6f] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
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

              {isSignUp && (
                <div className="space-y-2 bg-gray-950 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-300 mb-2">
                    Password Requirements:
                  </p>
                  <PasswordRequirement 
                    met={hasMinLength} 
                    text="At least 6 characters" 
                  />
                  <PasswordRequirement 
                    met={hasUpperCase} 
                    text="One uppercase letter" 
                  />
                  <PasswordRequirement 
                    met={hasLowerCase} 
                    text="One lowercase letter" 
                  />
                  <PasswordRequirement 
                    met={hasNumber} 
                    text="One number" 
                  />
                </div>
              )}

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
                disabled={isSignUp && !isPasswordValid}
              >
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setPassword('');
                  }}
                  className="text-[#9b9b6f] hover:text-[#7a7a58] text-sm"
                >
                  {isSignUp
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;