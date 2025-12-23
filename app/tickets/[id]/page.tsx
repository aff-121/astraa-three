"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTicket } from "@/hooks/useTickets";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Share2, Loader2 } from "lucide-react";
import EventTicket from "@/components/EventTicket";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TicketDetailSkeleton } from "@/components/skeletons";
import { devLog } from "@/lib/logger";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: ticket, isLoading, error } = useTicket(id || "");
  const { toast } = useToast();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?redirect=/tickets");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Ticket not found or you don't have access to it.",
        variant: "destructive",
      });
      navigate("/tickets");
    }
  }, [error, navigate, toast]);

  const handleDownload = async () => {
    if (isDownloading || !ticket || !ticketRef.current) return;

    setIsDownloading(true);
    toast({
      title: "Preparing Download",
      description: "Generating your ticket PDF...",
    });

    try {
      // Capture the EventTicket component as canvas
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Add ticket image to PDF
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate dimensions to fit on page
      const ratio = canvas.width / canvas.height;
      let width = pdfWidth - 10;
      let height = width / ratio;

      if (height > pdfHeight - 10) {
        height = pdfHeight - 10;
        width = height * ratio;
      }

      const x = (pdfWidth - width) / 2;
      const y = (pdfHeight - height) / 2;

      pdf.addImage(imgData, "PNG", x, y, width, height);

      // Add ticket info at bottom
      pdf.setFontSize(10);
      pdf.text(
        `Ticket: ${ticket.ticket_number}`,
        10,
        pdfHeight - 10
      );

      // Download
      pdf.save(`ASTRA-${ticket.ticket_number}.pdf`);

      toast({
        title: "Download Complete",
        description: "Your ticket PDF has been downloaded successfully!",
      });
    } catch (err) {
      devLog.error("Download error:", err);
      toast({
        title: "Download Failed",
        description: "Could not download the ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ticket for ${ticket?.event?.title}`,
          text: `Check out my ticket for ${ticket?.event?.title}!`,
          url: window.location.href,
        });
      } catch (err) {
        /* user cancelled */
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Ticket link has been copied to clipboard.",
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Extract year from date
  const getYear = (dateString: string) => {
    return new Date(dateString).getFullYear().toString();
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-20 bg-background min-h-screen">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground mb-8">
              <ArrowLeft className="w-4 h-4" />
              Back to Tickets
            </div>
            <TicketDetailSkeleton />
          </div>
        </div>
      </Layout>
    );
  }

  if (!ticket) {
    return null;
  }

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </Link>

          <div className="max-w-md mx-auto">
            {/* Premium Ticket Design */}
            <div ref={ticketRef}>
              <EventTicket
                ticketType={ticket.category?.name || "General Access"}
                ticketId={ticket.ticket_number}
                venue={`${ticket.event?.venue || ""}, ${ticket.event?.location || ""}`}
                date={ticket.event?.date ? formatDate(ticket.event.date) : "TBD"}
                time={ticket.event?.time || "6:00 PM"}
                year={ticket.event?.date ? getYear(ticket.event.date) : "2025"}
                qrCodeUrl="/reg_scanner.png"
              />
            </div>

            {/* Ticket Status Badge */}
            <div className="text-center mt-6">
              <span
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                  ticket.status === "confirmed" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-current" />
                {ticket.status === "confirmed" ? "Confirmed" : ticket.status}
              </span>
            </div>

            {/* Additional Info Card */}
            <div className="mt-6 bg-cinema-card rounded-xl border border-border p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Category</p>
                  <p className="text-sm font-bold text-primary">{ticket.category?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Quantity</p>
                  <p className="text-sm font-bold text-foreground">{ticket.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-sm font-bold text-foreground">₹{ticket.total_price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 mt-6">
              <Button 
                variant="coral" 
                size="lg" 
                className="flex-1 rounded-full gap-2" 
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isDownloading ? "Downloading..." : "Download Ticket"}
              </Button>
              <Button variant="outline" size="lg" className="flex-1 rounded-full gap-2" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            </div>

            {/* Purchase Info */}
            <div className="mt-8 p-4 bg-muted rounded-xl">
              <p className="text-xs text-muted-foreground text-center">
                Purchased on {new Date(ticket.purchase_time).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
