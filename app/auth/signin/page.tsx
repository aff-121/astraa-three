"use client";
import { useState, useEffect, Suspense } from "react";
import { useNavigate, useSearchParams, Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Phone, ArrowLeft } from "lucide-react";

function SignInContent() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const { user, signInWithEmail, resetPassword } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const redirectTo = searchParams?.get("redirect") || "/";

  useEffect(() => {
    if (user) {
      navigate(redirectTo);
    }
  }, [user, navigate, redirectTo]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You have successfully signed in." });
      navigate(redirectTo);
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Request Submitted",
        description: "If an account exists with this email, you will receive a password reset link.",
      });
      setShowForgotPassword(false);
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
              {!showForgotPassword ? (
                <>
                  <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-muted-foreground text-center mb-8">
                    Sign in to access your account
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
                      <span className="bg-cinema-card px-2 text-muted-foreground">Or sign in with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-4">
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
                          className="bg-muted border-border pl-10"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </button>

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
                          Signing in...
                        </>
                      ) : (
                        "Sign In with Email"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-muted-foreground text-sm">
                      Don't have an account?{" "}
                      <Link href={`/auth/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-primary hover:underline">
                        Sign Up
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-display font-bold text-foreground text-center mb-2">
                    Reset Password
                  </h1>
                  <p className="text-muted-foreground text-center mb-8">
                    Enter your email to receive a reset link
                  </p>

                  <form onSubmit={handleForgotPassword} className="space-y-4">
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

                    <Button
                      type="submit"
                      variant="coral"
                      size="lg"
                      className="w-full rounded-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setShowForgotPassword(false)}
                      className="text-primary hover:underline text-sm"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function SignInPage() {
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
      <SignInContent />
    </Suspense>
  );
}
