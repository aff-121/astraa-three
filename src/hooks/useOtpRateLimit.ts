import { useState, useEffect, useCallback } from 'react';

/**
 * OTP Rate Limiting Hook
 * 
 * Implements client-side rate limiting for OTP requests to:
 * 1. Prevent accidental spam (user clicking multiple times)
 * 2. Reduce SMS costs
 * 3. Comply with SMS provider limits
 * 4. Provide good UX with countdown timer
 * 
 * Rate Limit Strategy:
 * - First request: Immediate
 * - Subsequent requests: 60 second cooldown
 * - Max 5 requests per phone per 15 minutes
 * - Persists across page refreshes via localStorage
 * 
 * Note: This is frontend protection. Supabase also enforces
 * server-side rate limits on auth.signInWithOtp.
 */

const COOLDOWN_SECONDS = 60; // 1 minute between OTP requests
const MAX_REQUESTS = 5; // Max OTPs per window
const WINDOW_MINUTES = 15; // Rate limit window
const STORAGE_KEY = 'otp_rate_limit';

interface RateLimitData {
  phone: string;
  requests: number[];
  lastRequest: number;
}

interface UseOtpRateLimitReturn {
  /**
   * Check if OTP can be sent to this phone number
   */
  canSendOtp: (phone: string) => boolean;
  
  /**
   * Record an OTP request (call after successful send)
   */
  recordOtpRequest: (phone: string) => void;
  
  /**
   * Get remaining cooldown seconds (0 if can send)
   */
  getCooldownSeconds: (phone: string) => number;
  
  /**
   * Get remaining OTP requests in current window
   */
  getRemainingRequests: (phone: string) => number;
  
  /**
   * Current cooldown countdown (updates every second)
   */
  countdown: number;
  
  /**
   * Start countdown for a specific phone
   */
  startCountdown: (phone: string) => void;
  
  /**
   * Whether currently in cooldown
   */
  isInCooldown: boolean;
  
  /**
   * Clear rate limit data (for testing/reset)
   */
  clearRateLimit: (phone: string) => void;
}

function getRateLimitData(phone: string): RateLimitData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const allData: Record<string, RateLimitData> = JSON.parse(stored);
    return allData[phone] || null;
  } catch {
    return null;
  }
}

function setRateLimitData(phone: string, data: RateLimitData): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allData: Record<string, RateLimitData> = stored ? JSON.parse(stored) : {};
    allData[phone] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch {
    // Ignore storage errors
  }
}

function clearRateLimitData(phone: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const allData: Record<string, RateLimitData> = JSON.parse(stored);
    delete allData[phone];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allData));
  } catch {
    // Ignore storage errors
  }
}

export function useOtpRateLimit(): UseOtpRateLimitReturn {
  const [countdown, setCountdown] = useState(0);
  const [currentPhone, setCurrentPhone] = useState<string | null>(null);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown]);

  // Initialize countdown from stored data on mount
  useEffect(() => {
    if (!currentPhone) return;
    
    const data = getRateLimitData(currentPhone);
    if (data) {
      const elapsed = Math.floor((Date.now() - data.lastRequest) / 1000);
      const remaining = Math.max(0, COOLDOWN_SECONDS - elapsed);
      if (remaining > 0) {
        setCountdown(remaining);
      }
    }
  }, [currentPhone]);

  const getCooldownSeconds = useCallback((phone: string): number => {
    const data = getRateLimitData(phone);
    if (!data) return 0;
    
    const elapsed = Math.floor((Date.now() - data.lastRequest) / 1000);
    return Math.max(0, COOLDOWN_SECONDS - elapsed);
  }, []);

  const getRemainingRequests = useCallback((phone: string): number => {
    const data = getRateLimitData(phone);
    if (!data) return MAX_REQUESTS;
    
    const windowStart = Date.now() - (WINDOW_MINUTES * 60 * 1000);
    const recentRequests = data.requests.filter(t => t > windowStart);
    
    return Math.max(0, MAX_REQUESTS - recentRequests.length);
  }, []);

  const canSendOtp = useCallback((phone: string): boolean => {
    // Check cooldown
    if (getCooldownSeconds(phone) > 0) {
      return false;
    }
    
    // Check max requests
    if (getRemainingRequests(phone) <= 0) {
      return false;
    }
    
    return true;
  }, [getCooldownSeconds, getRemainingRequests]);

  const recordOtpRequest = useCallback((phone: string): void => {
    const now = Date.now();
    const data = getRateLimitData(phone);
    
    const windowStart = now - (WINDOW_MINUTES * 60 * 1000);
    const recentRequests = data?.requests.filter(t => t > windowStart) || [];
    
    setRateLimitData(phone, {
      phone,
      requests: [...recentRequests, now],
      lastRequest: now,
    });
    
    setCurrentPhone(phone);
    setCountdown(COOLDOWN_SECONDS);
  }, []);

  const startCountdown = useCallback((phone: string): void => {
    setCurrentPhone(phone);
    const remaining = getCooldownSeconds(phone);
    if (remaining > 0) {
      setCountdown(remaining);
    }
  }, [getCooldownSeconds]);

  const clearRateLimit = useCallback((phone: string): void => {
    clearRateLimitData(phone);
    setCountdown(0);
  }, []);

  return {
    canSendOtp,
    recordOtpRequest,
    getCooldownSeconds,
    getRemainingRequests,
    countdown,
    startCountdown,
    isInCooldown: countdown > 0,
    clearRateLimit,
  };
}

/**
 * Format countdown seconds to MM:SS display
 */
export function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
