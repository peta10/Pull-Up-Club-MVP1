import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { createClient } from '@supabase/supabase-js';
import Lenis from '@studio-freight/lenis';
import { animate, inView } from 'motion';
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
import { Toaster } from '@/components/ui/toaster';

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

// ScrollToTop component to reset scroll position on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Initialize animations
const initAnimations = () => {
  inView('.animate-fade-in', (info) => {
    animate(
      info.target,
      { opacity: 1, y: 0 },
      { duration: 0.6, delay: 0.2 }
    );
  });

  inView('.animate-fade-in-up', (info) => {
    animate(
      info.target,
      { opacity: 1, y: 0 },
      { duration: 0.6, delay: 0.2 }
    );
  });

  inView('.animate-stagger', (info) => {
    animate(
      info.target.querySelectorAll('.stagger-item'),
      { opacity: 1, y: 0 },
      { delay: stagger(0.1) }
    );
  });
};

const stagger = (delay: number) => {
  return (i: number) => i * delay;
};

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Initialize animations
    initAnimations();

    // Clean up
    return () => {
      lenis.destroy();
    };
  }, []);

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
        <div className="bg-destructive border border-destructive/50 text-destructive-foreground px-4 py-3 rounded fixed top-0 left-0 right-0 z-50 flex justify-between items-center">
          <span>
            <strong>Connection Error:</strong> Unable to connect to the database. Some features may not work correctly.
          </span>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-destructive-foreground text-destructive px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      )}
      <Router>
        <ScrollToTop />
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
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;