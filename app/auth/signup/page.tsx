"use client";
import { useState, useEffect, Suspense } from "react";
import { useNavigate, useSearchParams, Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";

function SignUpContent() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { user, signUpWithEmail } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const redirectTo = searchParams?.get("redirect") || "/";

  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data, error } = await signUpWithEmail(email, password, fullName);
    
    if (error) {
      toast({ title: "Signup Failed", description: error.message, variant: "destructive" });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast({ 
        title: "Account Already Exists", 
        description: "An account with this email already exists. Please sign in instead.",
        variant: "destructive" 
      });
    } else {
      toast({ title: "Account Created!", description: "Please check your email to verify your account." });
      navigate(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-md mx-auto">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <div className="bg-cinema-card rounded-2xl p-8 border border-border">
              <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
                Create Account
              </h1>
              <p className="text-muted-foreground text-center mb-8">
                Join us to book tickets and more
              </p>

              {/* Continue with Phone - Primary Option */}
              <Link href={`/auth/phone?redirect=${encodeURIComponent(redirectTo)}`}>
                <Button variant="coral" size="lg" className="w-full rounded-full gap-2 mb-6">
                  <Phone className="w-4 h-4" />
                  Continue with Phone
                </Button>
              </Link>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-cinema-card px-2 text-muted-foreground">Or sign up with email</span>
                </div>
              </div>

              <form onSubmit={handleEmailSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-muted border-border pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-muted border-border pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-muted border-border pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-muted border-border pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Sign Up with Email"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{" "}
                  <Link href={`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline">
                    Sign In
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

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <Layout>
          <div className="pt-24 pb-20 bg-background min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </Layout>
      }
    >
      <SignUpContent />
    </Suspense>
  );
}
