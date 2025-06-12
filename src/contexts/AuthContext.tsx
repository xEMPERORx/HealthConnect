import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'user' | 'doctor' | 'admin' | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: 'user' | 'doctor', fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to refresh session
  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      // Clear state on error
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial session check
    refreshSession();

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Set up periodic session refresh
    const refreshInterval = setInterval(refreshSession, 10 * 60 * 1000); // Refresh every 10 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (!existingProfile) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('No user found');

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              full_name: userData.user.user_metadata.full_name || null,
              role: userData.user.user_metadata.user_type || 'user',
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        if (newProfile) {
          setProfile({
            id: newProfile.id,
            full_name: newProfile.full_name,
            avatar_url: newProfile.avatar_url,
            role: newProfile.role as 'user' | 'doctor' | 'admin' | null,
          });
        }
      } else {
        setProfile({
          id: existingProfile.id,
          full_name: existingProfile.full_name,
          avatar_url: existingProfile.avatar_url,
          role: existingProfile.role as 'user' | 'doctor' | 'admin' | null,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load user profile');
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  async function signUp(email: string, password: string, userType: 'user' | 'doctor', fullName: string) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_type: userType,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from sign up');

      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            full_name: fullName,
            role: userType,
          },
        ]);

      if (profileError) throw profileError;

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (userType === 'doctor') {
        const { error: doctorError } = await supabase
          .from('doctors')
          .insert([
            {
              profile_id: authData.user.id,
              is_verified: false,
              specialization: '',
              license_number: '',
              years_of_experience: 0,
            },
          ]);

        if (doctorError) throw doctorError;
      }

      toast.success('Account created successfully!');
      if (userType === 'doctor') {
        toast.success('Please complete your doctor profile to get verified.');
      }
    } catch (error: any) {
      console.error('Error signing up:', error);
      if (error.message?.includes('User already registered')) {
        throw new Error('Email already registered');
      }
      throw error;
    }
  }

  async function signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}