"use client";
import { useEffect, Suspense } from "react";
import { useNavigate, useSearchParams } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";

function AuthRedirect() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/";

  useEffect(() => {
    // Redirect to signin page with the redirect parameter
    navigate(`/auth/signin?redirect=${encodeURIComponent(redirectTo)}`);
  }, [navigate, redirectTo]);

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    </Layout>
  );
}

export default function AuthPage() {
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
      <AuthRedirect />
    </Suspense>
  );
}
