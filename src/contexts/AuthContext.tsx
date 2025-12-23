import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { isValidE164 } from '@/lib/phoneValidation';
import { devLog } from '@/lib/logger';

/**
 * AuthContext - Simplified with Native Supabase Phone Auth
 * 
 * Uses Supabase's built-in signInWithOtp which triggers the send-sms-hook
 * edge function to send SMS via MSG91.
 * 
 * Flow:
 * 1. signInWithPhone(phone) → Supabase generates OTP → send-sms-hook → MSG91 → SMS sent
 * 2. verifyOtp(phone, otp) → Supabase verifies → Session created automatically
 */

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  // Email auth
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ data: { user: User | null }; error: AuthError | null }>;
  // Phone auth (native Supabase - uses send-sms-hook edge function)
  signInWithPhone: (phone: string) => Promise<{ error: AuthError | null }>;
  verifyOtp: (phone: string, token: string) => Promise<{ data: { user: User | null; session: Session | null } | null; error: AuthError | null }>;
  // Password management
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  // Session management
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ============================================
  // Email Authentication
  // ============================================

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    return { data: { user: data.user }, error };
  };

  // ============================================
  // Phone Authentication (Native Supabase)
  // ============================================

  /**
   * Send OTP to phone number
   * 
   * This triggers:
   * 1. Supabase generates 6-digit OTP
   * 2. Supabase calls send-sms-hook edge function
   * 3. Edge function sends SMS via MSG91
   * 4. User receives SMS
   * 
   * @param phone - Must be in E.164 format (e.g., +919961491824)
   */
  const signInWithPhone = async (phone: string) => {
    // Validate E.164 format before making API call
    if (!isValidE164(phone)) {
      devLog.error('📱 [AUTH] Invalid E.164 format:', phone);
      return { 
        error: { 
          message: 'Invalid phone number format. Expected E.164 format (e.g., +919961491824)',
          name: 'ValidationError',
          status: 400
        } as AuthError 
      };
    }
    
    devLog.log('📱 [AUTH] Sending OTP to:', phone);
    const { error } = await supabase.auth.signInWithOtp({ 
      phone,
      options: {
        channel: 'sms'
      }
    });
    
    if (error) {
      devLog.error('📱 [AUTH] Send OTP error:', error.message);
    } else {
      devLog.log('📱 [AUTH] OTP sent successfully');
    }
    
    return { error };
  };

  /**
   * Verify OTP entered by user
   * 
   * On success:
   * - Session is created automatically
   * - User is signed in
   * - If new user, profile is created by database trigger
   */
  const verifyOtp = async (phone: string, token: string) => {
    devLog.log('📱 [AUTH] Verifying OTP for:', phone);
    const { data, error } = await supabase.auth.verifyOtp({ 
      phone, 
      token, 
      type: 'sms' 
    });
    
    if (error) {
      devLog.error('📱 [AUTH] Verify OTP error:', error.message);
    } else {
      devLog.log('📱 [AUTH] OTP verified successfully, user:', data.user?.id);
    }
    
    return { data, error };
  };

  // ============================================
  // Password Management
  // ============================================

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/account?reset=true`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  // ============================================
  // Session Management
  // ============================================

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithPhone,
      verifyOtp,
      resetPassword,
      updatePassword,
      signOut,
    }}>
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
