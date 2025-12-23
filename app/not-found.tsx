"use client";
import { Suspense } from "react";
import { Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

function NotFoundContent() {
  return (
    <Layout>
      <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-8xl font-display font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md">The page you're looking for doesn't exist or has been moved.</p>
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" className="rounded-full gap-2" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Link href="/">
              <Button variant="coral" className="rounded-full gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default function NotFoundPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-8xl font-display font-bold text-primary mb-4">404</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  );
}
