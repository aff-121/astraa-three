import { Skeleton } from "@/components/ui/skeleton";

/**
 * Movie Card Skeleton - for movies list/grid
 */
export function MovieCardSkeleton() {
  return (
    <div className="bg-cinema-card rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-square w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="space-y-2 pt-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-10 w-full rounded-full mt-4" />
      </div>
    </div>
  );
}

/**
 * Event Card Skeleton - for events list/grid
 */
export function EventCardSkeleton() {
  return (
    <div className="bg-cinema-card rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full col-span-2" />
        </div>
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-10 flex-1 rounded-full" />
          <Skeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Ticket Card Skeleton - for tickets list
 */
export function TicketCardSkeleton() {
  return (
    <div className="bg-cinema-card rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between items-center pt-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

/**
 * News Card Skeleton - for news list
 */
export function NewsCardSkeleton() {
  return (
    <div className="bg-cinema-card rounded-2xl overflow-hidden border border-border">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-6 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-24 pt-2" />
      </div>
    </div>
  );
}

/**
 * Event Detail Skeleton - for single event page
 */
export function EventDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Image */}
      <Skeleton className="aspect-[21/9] w-full rounded-2xl" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-2/3" />
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Movie Detail Skeleton - for single movie page
 */
export function MovieDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative">
        <Skeleton className="aspect-[21/9] w-full" />
        <div className="absolute bottom-0 left-0 right-0 p-8 space-y-4">
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 space-y-8">
        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        
        {/* Synopsis */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        
        {/* Cast */}
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Ticket Detail Skeleton - for single ticket page
 */
export function TicketDetailSkeleton() {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
      <div className="flex justify-center">
        <Skeleton className="h-8 w-28 rounded-full" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 rounded-full" />
        <Skeleton className="h-12 flex-1 rounded-full" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
    </div>
  );
}

/**
 * Awards Card Skeleton
 */
export function AwardsCardSkeleton() {
  return (
    <div className="bg-cinema-card rounded-2xl overflow-hidden border border-border p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/**
 * Generic Grid Skeleton - wraps multiple skeletons in a grid
 */
export function SkeletonGrid({ 
  count = 6, 
  children,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
}: { 
  count?: number; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx}>{children}</div>
      ))}
    </div>
  );
}
