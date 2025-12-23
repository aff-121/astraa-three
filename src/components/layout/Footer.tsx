import { Link } from "@/lib/navigation";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/our-story" },
  { name: "Services", path: "/events" },
  { name: "Gallery", path: "/awards" },
];

const policies = [
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms Of Service", path: "/terms" },
  { name: "Cookie Policy", path: "/cookies" },
];

export const Footer = () => {
  return (
    <footer className="bg-cinema-card border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & Description */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo.svg"
                alt="Astra logo"
                className="object-contain group-hover:scale-110 transition-transform duration-300"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Elevating Coastalwood by exploring untold stories & unseen genres in Tulu cinema.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">
              Policies
            </h4>
            <ul className="space-y-3">
              {policies.map((link) => (
                <li key={link.path}>
                  <Link
                    href={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-display font-semibold text-foreground mb-6">
              Contact Us
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-muted-foreground text-sm leading-relaxed">
                  C/o Siraj Ahamad, Jaland, Oernet,<br />
                  Navbharath Circle, Kodiyalbail,<br />
                  Mangalore, Karnataka, 575003
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a
                  href="tel:+919876543210"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  +91 9876543210
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a
                  href="mailto:astraproduction@gmail.com"
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  astraproduction@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary/30">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              © Astra Groups 2025 - All rights reserved
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
