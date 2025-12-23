"use client";
import { useEffect } from "react";
import { Link, useNavigate } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTickets } from "@/hooks/useTickets";
import { Ticket, Calendar, MapPin, Clock, ChevronRight } from "lucide-react";
import { TicketCardSkeleton, SkeletonGrid } from "@/components/skeletons";

export default function Page() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: tickets, isLoading } = useUserTickets();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/tickets");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-20 bg-background min-h-screen">
          <div className="container mx-auto px-4 lg:px-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">My Tickets</h1>
            <SkeletonGrid count={3}>
              <TicketCardSkeleton />
            </SkeletonGrid>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">My Tickets</h1>

          {tickets && tickets.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/tickets/${ticket.id}`}
                  className="group bg-cinema-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
                >
                  {ticket.event?.image_url && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={ticket.event.image_url}
                        alt={ticket.event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                          {ticket.status === "confirmed" ? "Confirmed" : ticket.status}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <h3 className="text-lg font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {ticket.event?.title}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{ticket.event?.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>{ticket.event?.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="truncate">{ticket.event?.venue}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Category</p>
                        <p className="text-sm font-semibold text-primary">{ticket.category?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Qty</p>
                        <p className="text-sm font-semibold text-foreground">{ticket.quantity}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-muted-foreground">#{ticket.ticket_number}</p>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Ticket className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">No Tickets Yet</h2>
              <p className="text-muted-foreground mb-6">You haven't purchased any tickets yet. Browse our events to get started!</p>
              <Link href="/events">
                <Button variant="coral" className="rounded-full">
                  Browse Events
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
