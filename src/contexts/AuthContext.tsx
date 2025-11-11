import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isFacilitator: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isFacilitator, setIsFacilitator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener - MUST BE SYNCHRONOUS
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer Supabase calls with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            checkFacilitatorRole(session.user.id).then((isFacilitatorRole) => {
              if (mounted) {
                setIsFacilitator(isFacilitatorRole);
              }
            });
          }, 0);
        } else {
          setIsFacilitator(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const isFacilitatorRole = await checkFacilitatorRole(session.user.id);
        if (mounted) {
          setIsFacilitator(isFacilitatorRole);
        }
      }
      
      setLoading(false);
    };
    
    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const checkFacilitatorRole = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'facilitator')
        .maybeSingle();

      if (error) {
        console.error('Error checking facilitator role:', error);
        return false;
      }

      return data?.role === 'facilitator';
    } catch (error) {
      console.error('Error checking facilitator role:', error);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsFacilitator(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isFacilitator, loading, signIn, signOut }}>
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
