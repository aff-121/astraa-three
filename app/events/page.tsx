"use client";
import { Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/useEvents";
import { Calendar, MapPin, Clock, Ticket } from "lucide-react";
import { EventCardSkeleton, SkeletonGrid } from "@/components/skeletons";

export default function Page() {
  const { data: events, isLoading } = useEvents();

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">Events</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join us for exclusive premieres, award ceremonies, and fan events.
            </p>
          </div>

          {isLoading ? (
            <SkeletonGrid count={4} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EventCardSkeleton />
            </SkeletonGrid>
          ) : events && events.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="group bg-cinema-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=500&fit=crop"}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {event.badge && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-gold text-secondary-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                          {event.badge}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent" />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.description}</p>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                        <span className="truncate">
                          {event.venue}, {event.location}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/events/${event.slug}`} className="flex-1">
                        <Button variant="coral" className="w-full rounded-full gap-2">
                          <Ticket className="w-4 h-4" />
                          Get Tickets
                        </Button>
                      </Link>
                      <Link href={`/events/${event.slug}`}>
                        <Button variant="outline" className="rounded-full">
                          Learn more
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No events available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
