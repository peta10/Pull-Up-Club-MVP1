import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import Home from './pages/Home';
import SubmissionPage from './pages/SubmissionPage';
import VideoSubmissionPage from './pages/VideoSubmissionPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RulesPage from './pages/RulesPage';
import FAQPage from './pages/FAQPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiesPolicyPage from './pages/CookiesPolicyPage';
import CreateAccountPage from './pages/CreateAccountPage';

// Create Supabase client with error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    async function testConnection() {
      if (!supabaseUrl || !supabaseKey) {
        setConnectionStatus('error');
        return;
      }

      try {
        // Simple health check that doesn't require data access
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase connection error:', error.message);
          setConnectionStatus('error');
        } else {
          console.log('Supabase connection successful!');
          setConnectionStatus('connected');
          
          // Only try to access data if the connection is successful
          try {
            const { data, error: dataError } = await supabase
              .from('stripe_customers')
              .select('count')
              .single();
              
            if (dataError) {
              console.warn('Could connect to Supabase but had an error accessing data:', dataError.message);
            } else {
              console.log('Data access successful:', data);
            }
          } catch (dataErr) {
            console.warn('Data access error:', dataErr);
          }
        }
      } catch (err) {
        console.error('Error testing Supabase connection:', err);
        setConnectionStatus('error');
      }
    }

    testConnection();
  }, []);

  return (
    <AuthProvider>
      {connectionStatus === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
          <span>
            <strong>Connection Error:</strong> Unable to connect to the database. Some features may not work correctly.
          </span>
          <button onClick={() => window.location.reload()} className="bg-red-700 text-white px-4 py-2 rounded">
            Retry
          </button>
        </div>
      )}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/submit" element={<SubmissionPage />} />
          <Route path="/submit/video" element={<VideoSubmissionPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiesPolicyPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;