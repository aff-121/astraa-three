"use client";
import { useState, useEffect, Suspense } from "react";
import { useNavigate, useSearchParams, Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOtpRateLimit, formatCountdown } from "@/hooks/useOtpRateLimit";
import { validatePhone, sanitizePhoneInput } from "@/lib/phoneValidation";
import { Loader2, ArrowLeft, Clock } from "lucide-react";

function PhoneAuthContent() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { user, signInWithPhone } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
  
  // Format phone with country code for rate limit checks
  const formattedPhone = phone.length === 10 ? `+91${phone}` : "";

  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);
  
  // Initialize countdown if returning to this page
  useEffect(() => {
    if (formattedPhone) {
      startCountdown(formattedPhone);
    }
  }, [formattedPhone, startCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number with E.164 format enforcement
    const validation = validatePhone(phone, 'IN');
    
    if (!validation.isValid || !validation.formatted) {
      toast({ 
        title: "Invalid Number", 
        description: validation.error || "Please enter a valid 10-digit mobile number.", 
        variant: "destructive" 
      });
      return;
    }
    
    // Use E.164 formatted phone number
    const phoneWithCode = validation.formatted;
    
    // Check rate limit
    if (!canSendOtp(phoneWithCode)) {
      const remaining = getRemainingRequests(phoneWithCode);
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
    
    setLoading(true);
    
    // Use native Supabase OTP (triggers send-sms-hook edge function)
    const { error } = await signInWithPhone(phoneWithCode);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Record successful OTP request for rate limiting
      recordOtpRequest(phoneWithCode);
      
      toast({
        title: "OTP Sent",
        description: "Please check your phone for the verification code.",
      });
      // Store phone for verification step
      sessionStorage.setItem("authPhone", phoneWithCode);
      navigate(`/auth/verify?redirect=${encodeURIComponent(redirectTo)}`);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto">
            <Link
              href={`/auth?redirect=${encodeURIComponent(redirectTo)}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>

            <div className="bg-cinema-card rounded-2xl p-8 border border-border">
              <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
                Continue with Phone
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                We'll send you a verification code to sign in or create an account
              </p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <div className="relative flex">
                    {/* Fixed +91 prefix box */}
                    <div className="flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-md text-muted-foreground text-sm">
                      +91
                    </div>
                    <Input
                      type="tel"
                      placeholder="9961491824"
                      value={phone}
                      onChange={(e) => {
                        // Sanitize input: only digits, max 10 characters
                        setPhone(sanitizePhoneInput(e.target.value, 10));
                      }}
                      required
                      maxLength={10}
                      className="bg-muted border-border rounded-l-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter your 10-digit mobile number</p>
                </div>

                <Button
                  type="submit"
                  variant="coral"
                  size="lg"
                  className="w-full rounded-full"
                  disabled={loading || (isInCooldown && formattedPhone !== "")}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending OTP...
                    </>
                  ) : isInCooldown && formattedPhone !== "" ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Resend in {formatCountdown(countdown)}
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
                
                {/* Rate limit info */}
                {formattedPhone && getRemainingRequests(formattedPhone) < 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {getRemainingRequests(formattedPhone)} OTP requests remaining
                  </p>
                )}
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Prefer email?{" "}
                  <Link href={`/auth?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline">
                    Sign in with Email
                  </Link>
                </p>
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
      <PhoneAuthContent />
    </Suspense>
  );
}
