import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Development mode check
const isDevelopment = import.meta.env.MODE === 'development';

interface User {
  id: string;
  email: string;
}

interface Profile {
  isProfileCompleted: boolean;
  socialMedia: string | null;
  streetAddress: string | null;
  apartment: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isFirstLogin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  isFirstLogin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No profile found
          setIsFirstLogin(true);
          // Create empty profile
          await supabase
            .from('user_profiles')
            .insert([{ user_id: userId }]);
          return;
        }
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile({
        isProfileCompleted: data.is_profile_completed,
        socialMedia: data.social_media,
        streetAddress: data.street_address,
        apartment: data.apartment,
        city: data.city,
        state: data.state,
        zipCode: data.zip_code,
        country: data.country,
      });
      setIsFirstLogin(!data.is_profile_completed);
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Check for existing session on load
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
          });
          await fetchProfile(session.user.id);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state changed:', event, newSession?.user?.email);
          
          if (newSession?.user) {
            setUser({
              id: newSession.user.id,
              email: newSession.user.email!,
            });
            await fetchProfile(newSession.user.id);
          } else {
            setUser(null);
            setProfile(null);
            setIsFirstLogin(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Development bypass
    if (isDevelopment && email === 'dev@example.com' && password === 'dev123') {
      setUser({
        id: 'dev-user-id',
        email: 'dev@example.com'
      });
      setProfile({
        isProfileCompleted: false,
        socialMedia: null,
        streetAddress: null,
        apartment: null,
        city: null,
        state: null,
        zipCode: null,
        country: null
      });
      setIsFirstLogin(true);
      return;
    }

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email!,
      });
      await fetchProfile(session.user.id);
    }
  };

  const signUp = async (email: string, password: string) => {
    // Development bypass
    if (isDevelopment && email === 'dev@example.com' && password === 'dev123') {
      setUser({
        id: 'dev-user-id',
        email: 'dev@example.com'
      });
      setProfile({
        isProfileCompleted: false,
        socialMedia: null,
        streetAddress: null,
        apartment: null,
        city: null,
        state: null,
        zipCode: null,
        country: null
      });
      setIsFirstLogin(true);
      return;
    }

    // For Supabase, use signUp with email confirmation set to true
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        // Important: Set email_confirmed to true to bypass email confirmation
        data: {
          email_confirmed: true
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // When using signUp, we also need to sign in immediately to create a session
      await signIn(email, password);
      setIsFirstLogin(true);
    }
  };

  const signOut = async () => {
    if (!isDevelopment) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setIsFirstLogin(false);
  };

  if (loading) {
    // You could return a loading component here if needed
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#9b9b6f]"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={{ user, profile, signIn, signUp, signOut, isFirstLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};