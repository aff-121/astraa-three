"use client";
import { useState, useEffect, Suspense } from "react";
import { useNavigate, useSearchParams, Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOtpRateLimit, formatCountdown } from "@/hooks/useOtpRateLimit";
import { Loader2, ArrowLeft, RefreshCw, Clock } from "lucide-react";

/**
 * Simplified OTP Verification Page
 * 
 * Uses native Supabase auth:
 * 1. User enters OTP
 * 2. verifyOtp() validates with Supabase
 * 3. Session is created automatically on success
 * 4. AuthContext picks up the session via onAuthStateChange
 * 5. User is redirected
 * 
 * No more pseudo-email, no more temp passwords, no more profile forms.
 * Profile is created automatically by database trigger on user creation.
 */
function VerifyAuthContent() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { user, verifyOtp, signInWithPhone } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  
  // Rate limiting hook
  const { 
    canSendOtp, 
    recordOtpRequest, 
    countdown, 
    isInCooldown,
    startCountdown,
    getRemainingRequests 
  } = useOtpRateLimit();

  const redirectTo = searchParams?.get("redirect") || "/";

  // Get phone from session storage
  useEffect(() => {
    const storedPhone = sessionStorage.getItem("authPhone");
    
    if (!storedPhone) {
      navigate(`/auth/phone?redirect=${encodeURIComponent(redirectTo)}`);
      return;
    }
    setPhone(storedPhone);
    // Initialize countdown for this phone
    startCountdown(storedPhone);
  }, [navigate, redirectTo, startCountdown]);

  // Redirect when user is authenticated
  useEffect(() => {
    if (user) {
      // Clear session storage
      sessionStorage.removeItem("authPhone");
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Native Supabase OTP verification - creates session automatically
    const { data, error } = await verifyOtp(phone, otp);
    
    if (error) {
      toast({ 
        title: "Verification Failed", 
        description: error.message, 
        variant: "destructive" 
      });
      setLoading(false);
      return;
    }
    
    if (data?.session) {
      // Success! Session is now active
      toast({ title: "Welcome!", description: "You're now signed in." });
      
      // Clear session storage
      sessionStorage.removeItem("authPhone");
      
      // AuthContext will pick up the session automatically
      // and trigger the redirect via the useEffect above
    } else {
      toast({ 
        title: "Error", 
        description: "Verification succeeded but no session was created. Please try again.", 
        variant: "destructive" 
      });
    }
    
    setLoading(false);
  };

  const handleResendOtp = async () => {
    // Check rate limit before resending
    if (!canSendOtp(phone)) {
      const remaining = getRemainingRequests(phone);
      if (remaining <= 0) {
        toast({ 
          title: "Too Many Requests", 
          description: "You've exceeded the maximum OTP requests. Please try again in 15 minutes.", 
          variant: "destructive" 
        });
      } else {
        toast({ 
          title: "Please Wait", 
          description: `You can request a new OTP in ${formatCountdown(countdown)}.`, 
          variant: "destructive" 
        });
      }
      return;
    }
    
    setResending(true);
    
    // Native Supabase OTP - triggers send-sms-hook
    const { error } = await signInWithPhone(phone);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Record successful OTP request for rate limiting
      recordOtpRequest(phone);
      toast({ title: "OTP Resent", description: "A new verification code has been sent to your phone." });
    }
    
    setResending(false);
  };

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto">
            <Link
              href={`/auth/phone?redirect=${encodeURIComponent(redirectTo)}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Phone Number
            </Link>

            <div className="bg-cinema-card rounded-2xl p-8 border border-border">
              {/* OTP Verification Form */}
              <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
                Verify OTP
              </h1>
              <p className="text-muted-foreground text-center mb-2">Enter the verification code sent to</p>
              <p className="text-primary text-center font-medium mb-8">{phone}</p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Verification Code</label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    className="bg-muted border-border text-center text-2xl tracking-widest"
                  />
                </div>

                <Button
                  type="submit"
                  variant="coral"
                  size="lg"
                  className="w-full rounded-full"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm mb-2">Didn't receive the code?</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleResendOtp} 
                  disabled={resending || isInCooldown} 
                  className="gap-2"
                >
                  {resending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resending...
                    </>
                  ) : isInCooldown ? (
                    <>
                      <Clock className="w-4 h-4" />
                      Resend in {formatCountdown(countdown)}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Resend OTP
                    </>
                  )}
                </Button>
                
                {/* Rate limit info */}
                {phone && getRemainingRequests(phone) < 5 && getRemainingRequests(phone) > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {getRemainingRequests(phone)} OTP requests remaining
                  </p>
                )}
                {phone && getRemainingRequests(phone) <= 0 && (
                  <p className="text-xs text-destructive mt-2">
                    Maximum requests reached. Try again in 15 minutes.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyAuthContent />
    </Suspense>
  );
}
