"use client";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useRazorpay } from "@/hooks/useRazorpay";
import { ArrowLeft, Calendar, MapPin, Ticket as TicketIcon, CreditCard, Smartphone, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface TicketSelection {
  eventId: string;
  eventTitle: string;
  category: string;
  categoryId: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  eventDate: string;
  venue: string;
}

export default function Page() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const [ticketSelection, setTicketSelection] = useState<TicketSelection | null>(null);
  const [step, setStep] = useState<"details" | "payment" | "success">("details");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | null>(null);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Razorpay hook - prefill will be passed at payment time
  const { initiatePayment, isScriptLoaded } = useRazorpay({
    onSuccess: (result) => {
      setCreatedTicketId(result.ticket?.id || null);
      setStep("success");
      sessionStorage.removeItem("ticketSelection");
      sessionStorage.removeItem("checkoutRedirect");
      setIsProcessing(false);
      toast({
        title: "Payment Successful!",
        description: "Your tickets have been booked successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
    onDismiss: () => {
      setIsProcessing(false);
    },
  });

  // Phone validation function
  const validatePhone = (phoneNumber: string): boolean => {
    // Remove all non-digits except the leading +
    const cleaned = phoneNumber.replace(/\D/g, "");
    // Must be 10 digits (valid Indian phone) after country code
    return cleaned.length === 12 && cleaned.startsWith("91"); // +91 = 12 digits
  };

  const handlePhoneChange = (value: string) => {
    // Ensure +91 prefix is always present
    let formattedPhone = value;
    
    // If user pastes or types without +91
    if (!formattedPhone.startsWith("+91")) {
      // Remove any existing country code
      const cleanedValue = formattedPhone.replace(/^\+91\s*/, "").replace(/^0+/, "");
      formattedPhone = "+91 " + cleanedValue;
    }

    setPhone(formattedPhone);

    // Validate phone
    if (formattedPhone && !validatePhone(formattedPhone)) {
      setPhoneError("Please enter a valid 10-digit phone number");
    } else {
      setPhoneError("");
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("ticketSelection");
    if (stored) {
      setTicketSelection(JSON.parse(stored));
    } else {
      navigate("/events");
    }
    // run once on mount to avoid re-triggering navigation loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!authLoading && !user && ticketSelection) {
      sessionStorage.setItem("checkoutRedirect", "true");
      navigate(`/auth?redirect=/checkout`);
    }
  }, [user, authLoading, navigate, ticketSelection]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      // Pre-fill phone if user has it, otherwise start with +91 prefix
      if (user.phone && user.phone.trim() !== "") {
        setPhone(user.phone);
      } else {
        setPhone("+91 ");
      }
    }
  }, [user]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast({
        title: "Select Payment Method",
        description: "Please select a payment method to proceed.",
        variant: "destructive",
      });
      return;
    }
    if (!ticketSelection || !user) return;

    if (!isScriptLoaded) {
      toast({
        title: "Loading Payment Gateway",
        description: "Please wait while we load the payment gateway...",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await initiatePayment({
        eventId: ticketSelection.eventId,
        categoryId: ticketSelection.categoryId,
        quantity: ticketSelection.quantity,
        unitPrice: ticketSelection.unitPrice,
        totalPrice: ticketSelection.totalPrice,
        paymentMethod: paymentMethod,
        prefill: {
          name: fullName,
          email: email,
          contact: phone.replace(/\s/g, ""),
        },
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast({
        title: "Payment Failed",
        description: message,
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Show loading while redirecting to auth (prevents flash of content)
  if (!user) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!ticketSelection) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (step === "success") {
    return (
      <Layout>
        <div className="pt-24 pb-20 bg-background min-h-screen">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-lg mx-auto text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">Payment Successful!</h1>
              <p className="text-muted-foreground mb-8">
                Your tickets have been booked successfully. You can view and download them from your account.
              </p>

              <div className="bg-cinema-card rounded-2xl p-6 border border-border mb-8 text-left">
                <h3 className="font-semibold text-foreground mb-4">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Event</span>
                    <span className="text-foreground">{ticketSelection.eventTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="text-foreground">{ticketSelection.categoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="text-foreground">{ticketSelection.quantity} tickets</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 mt-2">
                    <span className="font-semibold text-foreground">Total Paid</span>
                    <span className="font-semibold text-primary">
                      ₹{ticketSelection.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Link href={createdTicketId ? `/tickets/${createdTicketId}` : "/tickets"}>
                  <Button variant="coral" size="lg" className="rounded-full gap-2">
                    <TicketIcon className="w-4 h-4" />
                    View Ticket
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" className="rounded-full">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <Link
            href={`/events/${ticketSelection.eventId}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Event
          </Link>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Checkout</h1>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className={cn("flex items-center gap-2", step === "details" ? "text-primary" : "text-muted-foreground")}>
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold",
                      step === "details" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    1
                  </div>
                  <span className="text-xs sm:text-sm font-medium">Details</span>
                </div>
                <div className="flex-1 h-0.5 bg-border hidden sm:block" />
                <div className={cn("flex items-center gap-2", step === "payment" ? "text-primary" : "text-muted-foreground") }>
                  <div
                    className={cn(
                      "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold",
                      step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted"
                    )}
                  >
                    2
                  </div>
                  <span className="text-xs sm:text-sm font-medium">Payment</span>
                </div>
              </div>

              {step === "details" && (
                <>
                  <div className="bg-cinema-card rounded-2xl p-6 border border-border">
                    <h2 className="text-xl font-display font-bold text-foreground mb-6">Contact Details</h2>
                    <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Full Name</label>
                        <Input
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-muted border-border"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-muted border-border"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-foreground">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          className={cn(
                            "bg-muted border-border",
                            phoneError && "border-red-500 focus:border-red-500"
                          )}
                          required
                        />
                        {phoneError && (
                          <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Required for both email and phone signup users</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="coral"
                    size="lg"
                    className="w-full rounded-full"
                    onClick={() => {
                      // Validate all fields
                      if (!fullName.trim()) {
                        toast({
                          title: "Full Name Required",
                          description: "Please enter your full name",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (!email.trim()) {
                        toast({
                          title: "Email Required",
                          description: "Please enter your email address",
                          variant: "destructive",
                        });
                        return;
                      }
                      if (!phone.trim() || !validatePhone(phone)) {
                        toast({
                          title: "Valid Phone Number Required",
                          description: "Please enter a valid 10-digit Indian phone number",
                          variant: "destructive",
                        });
                        return;
                      }
                      setStep("payment");
                    }}
                    disabled={!fullName || !email || !phone || phoneError !== ""}
                  >
                    Continue to Payment
                  </Button>
                </>
              )}

              {step === "payment" && (
                <>
                  <div className="bg-cinema-card rounded-2xl p-6 border border-border">
                    <h2 className="text-xl font-display font-bold text-foreground mb-6">Payment Method</h2>
                    <div className="space-y-2 sm:space-y-3">
                      {[
                        { id: "upi" as const, name: "UPI", desc: "Google Pay, PhonePe, Paytm", icon: Smartphone },
                        { id: "card" as const, name: "Credit/Debit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard },
                      ].map((method) => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id)}
                          className={cn(
                            "w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-left",
                            paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                          )}
                        >
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                            <method.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm sm:text-base font-semibold text-foreground">{method.name}</h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">{method.desc}</p>
                          </div>
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                              paymentMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground"
                            )}
                          >
                            {paymentMethod === method.id && <Check className="w-3 h-3 text-primary-foreground" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="lg" className="flex-1 rounded-full" onClick={() => setStep("details")}>
                      Back
                    </Button>
                    <Button
                      variant="coral"
                      size="lg"
                      className="flex-1 rounded-full"
                      onClick={handlePayment}
                      disabled={isProcessing || !paymentMethod}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        `Pay ₹${ticketSelection.totalPrice.toLocaleString()}`
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-cinema-card rounded-2xl p-4 sm:p-6 border border-border lg:sticky lg:top-24">
                <h3 className="text-base sm:text-lg font-display font-bold text-foreground mb-4 sm:mb-6">Order Summary</h3>
                <div className="border-b border-border pb-4 sm:pb-6 mb-4 sm:mb-6">
                  <h4 className="font-semibold text-sm sm:text-base text-foreground mb-3">{ticketSelection.eventTitle}</h4>
                  <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{ticketSelection.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                      <span className="truncate">{ticketSelection.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm mb-4 sm:mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category</span>
                    <span className="text-foreground text-right truncate">{ticketSelection.categoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="text-foreground">{ticketSelection.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price/ticket</span>
                    <span className="text-foreground">₹{ticketSelection.unitPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground text-sm">Total</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      ₹{ticketSelection.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
