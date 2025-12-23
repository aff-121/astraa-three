"use client";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({ title: "Message sent!", description: "We'll get back to you as soon as possible." });
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
              Connect With Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question, collaboration idea, or just want to say hello? We'd love to hear from you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="bg-cinema-card rounded-2xl p-8 border border-border">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">First Name</label>
                    <Input type="text" placeholder="John" required className="bg-muted border-border focus:border-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Last Name</label>
                    <Input type="text" placeholder="Doe" required className="bg-muted border-border focus:border-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input type="email" placeholder="john@example.com" required className="bg-muted border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone (Optional)</label>
                  <Input type="tel" placeholder="+91 9876543210" className="bg-muted border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <Input type="text" placeholder="How can we help?" required className="bg-muted border-border focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Message</label>
                  <Textarea
                    placeholder="Tell us more..."
                    rows={5}
                    required
                    className="bg-muted border-border focus:border-primary resize-none"
                  />
                </div>
                <Button type="submit" variant="coral" size="lg" className="w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-cinema-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Address</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        C/o Siraj Ahamad, Jaland, Oernet,<br />
                        Navbharath Circle, Kodiyalbail,<br />
                        Mangalore, Karnataka, 575003
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-cinema-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                      <a
                        href="tel:+919876543210"
                        className="text-muted-foreground text-sm hover:text-primary transition-colors"
                      >
                        +91 9876543210
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-cinema-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email</h3>
                      <a
                        href="mailto:astraproduction@gmail.com"
                        className="text-muted-foreground text-sm hover:text-primary transition-colors"
                      >
                        astraproduction@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-cinema-card rounded-2xl p-6 border border-border">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Office Hours</h3>
                      <p className="text-muted-foreground text-sm">
                        Monday - Saturday: 10:00 AM - 7:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-cinema-card rounded-2xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex items-center gap-3">
                  {[{ Icon: Facebook }, { Icon: Twitter }, { Icon: Instagram }, { Icon: Youtube }].map(({ Icon }) => (
                    <a
                      key={Icon.displayName || Icon.name}
                      href="#"
                      className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-cinema-card rounded-2xl overflow-hidden border border-border h-64">
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Map View</p>
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
