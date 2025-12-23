"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTicket } from "@/hooks/useTickets";
import { useRequestRefund } from "@/hooks/useRazorpay";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Download, Share2, Loader2, RotateCcw } from "lucide-react";
import EventTicket from "@/components/EventTicket";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TicketDetailSkeleton } from "@/components/skeletons";
import { devLog } from "@/lib/logger";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: ticket, isLoading, error, refetch } = useTicket(id || "");
  const { toast } = useToast();
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundReason, setRefundReason] = useState<string>("");
  const [refundNotes, setRefundNotes] = useState("");
  const { requestRefund, isLoading: isRefundLoading } = useRequestRefund();

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

            {/* Refund Button - Only show for paid tickets */}
            {ticket.payment_status === "captured" && ticket.status === "confirmed" && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setRefundDialogOpen(true)}
                >
                  <RotateCcw className="w-4 h-4" />
                  Request Refund
                </Button>
              </div>
            )}

            {/* Refund Status */}
            {ticket.payment_status === "refunded" && (
              <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-sm text-yellow-500 text-center font-medium">
                  This ticket has been refunded
                </p>
              </div>
            )}

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

      {/* Refund Dialog */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Refund</DialogTitle>
            <DialogDescription>
              Please select a reason for requesting a refund. Refunds are typically processed within 2-3 business days.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for refund</label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_request">I changed my mind</SelectItem>
                  <SelectItem value="event_cancelled">Event was cancelled</SelectItem>
                  <SelectItem value="duplicate_payment">Duplicate payment</SelectItem>
                  <SelectItem value="other">Other reason</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional notes (optional)</label>
              <Textarea
                placeholder="Any additional details..."
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Refund amount:</strong> ₹{ticket.total_price.toLocaleString()}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setRefundDialogOpen(false)}
              disabled={isRefundLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!refundReason || !ticket.order_id) {
                  toast({
                    title: "Select a reason",
                    description: "Please select a reason for the refund",
                    variant: "destructive",
                  });
                  return;
                }
                try {
                  await requestRefund(
                    ticket.order_id,
                    refundReason as 'customer_request' | 'event_cancelled' | 'duplicate_payment' | 'other',
                    refundNotes
                  );
                  toast({
                    title: "Refund Requested",
                    description: "Your refund request has been submitted. Processing typically takes 2-3 business days.",
                  });
                  setRefundDialogOpen(false);
                  refetch();
                } catch (err) {
                  const message = err instanceof Error ? err.message : "Failed to request refund";
                  toast({
                    title: "Refund Failed",
                    description: message,
                    variant: "destructive",
                  });
                }
              }}
              disabled={isRefundLoading || !refundReason}
            >
              {isRefundLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Request Refund"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
