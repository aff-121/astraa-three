"use client";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import { useEvents } from "@/hooks/useEvents";
import { Skeleton } from "@/components/ui/skeleton";

const EventCardSkeleton = () => (
  <div className="bg-cinema-card rounded-2xl overflow-hidden border border-border">
    <Skeleton className="aspect-[3/2]" />
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

// Helper to format date
const formatEventDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const EventsSection = () => {
  const { data: events, isLoading, error } = useEvents();

  // Take only first 3 events for homepage
  const displayEvents = events?.slice(0, 3) || [];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-cinema-card/50 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-primary/50" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Events
          </h2>
          <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-primary/50" />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load events. Please try again later.</p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && !error && displayEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayEvents.map((event) => (
              <div
                key={event.id}
                className="group relative bg-cinema-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img
                    src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop"}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Badge */}
                  {event.badge && (
                    <div className="absolute top-4 right-4">
                      <span className="bg-gold text-secondary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        {event.badge}
                      </span>
                    </div>
                  )}

                  {/* Play Button for trailer/video type events */}
                  {(event.type === "trailer" || event.type === "announcement") && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-primary">
                        <Play className="w-6 h-6 ml-1" />
                      </button>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h3 className="text-lg font-display font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                      {event.title}
                    </h3>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatEventDate(event.date)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {event.has_tickets ? (
                      <>
                        <Link href={`/events/${event.slug}`} className="flex-1">
                          <Button variant="coral" className="w-full rounded-full">
                            Get tickets
                          </Button>
                        </Link>
                        <Link href={`/events/${event.slug}`}>
                          <Button variant="outline" className="rounded-full">
                            Learn more
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href={`/events/${event.slug}`} className="flex-1">
                          <Button variant="coral" className="w-full rounded-full">
                            {event.type === "trailer" || event.type === "announcement" ? "Watch Now" : "Learn more"}
                          </Button>
                        </Link>
                        <Link href={`/events/${event.slug}`}>
                          <Button variant="outline" className="rounded-full">
                            Details
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming events at the moment.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-12">
          <Link href="/events">
            <Button
              variant="outline"
              className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground gap-2"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
