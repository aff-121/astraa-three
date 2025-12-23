"use client";
import { useState } from "react";
import { useParams, Link, useNavigate } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useEvent, useTicketCategories, useEventGallery } from "@/hooks/useEvents";
import { ArrowLeft, Calendar, Clock, MapPin, Users, Ticket, Plus, Minus, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading: eventLoading } = useEvent(id || "");
  const { data: ticketCategories, isLoading: categoriesLoading } = useTicketCategories(event?.id || "");
  const { data: gallery } = useEventGallery(event?.id || "");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [ticketCount, setTicketCount] = useState(1);

  const selectedTicket = ticketCategories?.find((t) => t.id === selectedCategory);
  const totalPrice = selectedTicket ? selectedTicket.price * ticketCount : 0;

  const handleProceedToCheckout = () => {
    if (selectedCategory && ticketCount > 0 && event && selectedTicket) {
      sessionStorage.setItem(
        "ticketSelection",
        JSON.stringify({
          eventId: event.id,
          eventTitle: event.title,
          category: selectedCategory,
          categoryId: selectedTicket.id,
          categoryName: selectedTicket.name,
          quantity: ticketCount,
          unitPrice: selectedTicket.price,
          totalPrice,
          eventDate: event.date,
          venue: event.venue,
        })
      );
      navigate("/checkout");
    }
  };

  if (eventLoading || categoriesLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">Event Not Found</h1>
            <Link href="/events">
              <Button variant="coral" className="rounded-full">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-20 pb-20 bg-background min-h-screen">
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src={event.image_url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=800&fit=crop"}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute top-8 left-8">
            <Link href="/events">
              <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 -mt-32 relative z-10">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">{event.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{event.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{ icon: Calendar, label: "Date", value: event.date }, { icon: Clock, label: "Time", value: event.time }, { icon: Users, label: "Duration", value: event.duration || "TBA" }, { icon: MapPin, label: "Venue", value: event.venue }].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-cinema-card rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-muted-foreground leading-relaxed">{event.full_description}</p>
            {event.parking && <p className="text-sm text-primary mt-4">🅿️ {event.parking}</p>}
          </div>

          {ticketCategories && ticketCategories.length > 0 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8 mb-12">
              <div className="lg:col-span-2">
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                  <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  Select Tickets
                </h2>

                <div className="space-y-3 sm:space-y-4">
                  {ticketCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      disabled={category.available_seats === 0}
                      className={cn(
                        "w-full text-left bg-cinema-card rounded-xl p-4 sm:p-6 border-2 transition-all duration-300",
                        selectedCategory === category.id ? "border-primary shadow-lg shadow-primary/20" : "border-border hover:border-primary/50",
                        category.available_seats === 0 && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-semibold text-foreground truncate">{category.name}</h3>
                            <span
                              className={cn(
                                "text-xs px-2 py-1 rounded-full flex-shrink-0",
                                category.available_seats > 0 ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                              )}
                            >
                              {category.available_seats > 0 ? `${category.available_seats} left` : "Sold Out"}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground">{category.description}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg sm:text-2xl font-bold text-primary">₹{category.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">per person</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-cinema-card rounded-2xl p-4 sm:p-6 border border-border lg:sticky lg:top-24">
                  <h3 className="text-base sm:text-lg font-display font-bold text-foreground mb-4 sm:mb-6">Order Summary</h3>

                  {selectedCategory ? (
                    <>
                      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-semibold text-foreground text-right truncate">{selectedTicket?.name}</span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="text-muted-foreground text-xs sm:text-sm">Quantity</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
                            >
                              <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <span className="font-semibold text-foreground w-6 text-center text-sm sm:text-base">{ticketCount}</span>
                            <button
                              onClick={() => setTicketCount(Math.min(selectedTicket?.available_seats || 10, ticketCount + 1))}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors flex-shrink-0"
                            >
                              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Price per ticket</span>
                          <span className="text-foreground">₹{selectedTicket?.price.toLocaleString()}</span>
                        </div>

                        <div className="border-t border-border pt-3 sm:pt-4 flex items-center justify-between">
                          <span className="font-semibold text-foreground text-sm">Total</span>
                          <span className="text-lg sm:text-2xl font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
                        </div>
                      </div>

                      <Button variant="coral" size="lg" className="w-full rounded-full gap-2 text-sm sm:text-base" onClick={handleProceedToCheckout}>
                        Proceed to Checkout
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm">Select a ticket category to proceed</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {gallery && gallery.length > 0 && (
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((img) => (
                  <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden group">
                    <img
                      src={img.image_url}
                      alt="Gallery"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
