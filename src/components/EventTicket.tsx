"use client";
import { MapPin } from "lucide-react";

interface EventTicketProps {
  ticketType?: string;
  ticketId?: string;
  venue?: string;
  date?: string;
  time?: string;
  year?: string;
  qrCodeUrl?: string;
}

const EventTicket = ({
  ticketType = "VIP Access",
  ticketId = "AFA25VP13",
  venue = "Jio World Convention Centre, Bengaluru",
  date = "13 December 2025",
  time = "6:00 PM",
  year = "2025",
  qrCodeUrl = "/reg_scanner.png",
}: EventTicketProps) => {
  return (
    <div className="relative w-full max-w-[380px] mx-auto">
      {/* Scalloped top edge - torn perforation look */}
      <div className="flex justify-center">
        {Array.from({ length: 19 }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-2.5 bg-[hsl(0_0%_6%)]"
            style={{
              borderRadius: '0 0 50% 50%',
            }}
          />
        ))}
      </div>
      
      {/* Main ticket container */}
      <div className="relative bg-[hsl(0_0%_6%)] overflow-hidden -mt-px shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        {/* Content wrapper */}
        <div className="relative pt-4 pb-6 px-6">
          {/* Red gradient overlay at bottom */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(180deg, transparent 35%, hsl(0 60% 8% / 0.5) 65%, hsl(0 45% 18% / 0.6) 100%)'
            }}
          />
          
          {/* Header section with logo and award */}
          <div className="relative flex justify-between items-start mb-6">
            {/* Text Logo */}
            <img 
              src="/text_logo.svg" 
              alt="Astra Filmfare Awards" 
              className="h-16 w-auto"
            />
            
            {/* Year badge and award logo */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-bold text-[hsl(43_74%_49%)] bg-[hsl(43_74%_49%_/_0.2)] px-2 py-0.5 rounded mb-1">
                {year}
              </div>
              <img 
                src="/award_logo.svg" 
                alt="Award" 
                className="w-14 h-auto animate-float"
              />
            </div>
          </div>
          
          {/* VIP Access section */}
          <div className="relative text-center mb-5">
            <h2 className="font-display text-[22px] font-medium text-[hsl(45_90%_65%)] mb-0.5">
              {ticketType}
            </h2>
            <p className="font-display text-base text-[hsl(43_74%_49%_/_0.8)]">
              Astra Filmfare Awards
            </p>
          </div>
          
          {/* Ticket ID */}
          <div className="relative flex items-center justify-center gap-3 mb-5">
            <span className="text-lg font-semibold tracking-widest text-[hsl(45_90%_65%)]">
              {ticketId}
            </span>
          </div>
          
          {/* Venue */}
          <div className="relative flex items-start gap-2 mb-4 px-2">
            <MapPin className="w-4 h-4 text-[hsl(43_74%_49%)] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[hsl(45_90%_65%_/_0.85)] leading-relaxed">
              {venue}
            </p>
          </div>
          
          {/* Divider with side notches - tear line */}
          <div className="relative flex items-center my-4">
            <div className="absolute -left-6 w-5 h-5 bg-background rounded-full" />
            <div className="flex-1 border-t-2 border-dashed border-[hsl(43_74%_49%_/_0.25)]" />
            <div className="absolute -right-6 w-5 h-5 bg-background rounded-full" />
          </div>
          
          {/* Bottom section with QR and details */}
          <div className="relative flex items-end justify-between mt-4">
            {/* QR Code */}
            <div className="bg-white p-1.5 rounded">
              <img 
                src={qrCodeUrl} 
                alt="Ticket QR Code" 
                className="w-[84px] h-[84px] object-contain"
                onError={(e) => {
                  // Fallback to local scanner if external QR fails
                  e.currentTarget.src = "/reg_scanner.png";
                }}
              />
            </div>
            
            {/* Date and Time */}
            <div className="text-right">
              <div className="mb-4">
                <span className="text-xs text-muted-foreground block mb-1">Date:</span>
                <span className="text-[hsl(45_90%_65%)] font-medium text-[15px]">{date}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block mb-1">Time:</span>
                <span className="text-[hsl(45_90%_65%)] font-medium text-[15px]">{time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scalloped bottom edge - torn perforation look */}
      <div className="flex justify-center -mt-px">
        {Array.from({ length: 19 }).map((_, i) => (
          <div
            key={i}
            className="w-5 h-2.5 bg-[hsl(0_0%_6%)]"
            style={{
              borderRadius: '50% 50% 0 0',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default EventTicket;
