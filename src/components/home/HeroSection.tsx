"use client";
import { useState, useEffect } from "react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const heroSlides = [
  {
    id: 1,
    title: "ASTRA FILMFARE AWARDS 2025",
    subtitle: "A Night of Glory. A Celebration of Art.",
    date: "December 13",
    ctaText: "Get tickets",
    ctaLink: "/events/filmfare-awards",
    learnMoreLink: "/events/filmfare-awards",
    backgroundImage: "/herosection/astra.svg",
  },
  {
    id: 2,
    title: "NETTEREKERE - NOW SHOWING",
    subtitle: "Experience the untold story of courage and redemption.",
    date: "In Theaters",
    ctaText: "Book now",
    ctaLink: "/movies/netterekere",
    learnMoreLink: "/movies/netterekere",
    backgroundImage: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&h=900&fit=crop",
  },
  {
    id: 3,
  title: "BULLDOG - COMING SOON",
  subtitle: "A gripping tale that will keep you on the edge.",
  date: "January 2025",
  ctaText: "Watch trailer",  // Changed from "Learn more"
  ctaLink: "/movies/bulldog",
  learnMoreLink: "/movies/bulldog",
  backgroundImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&h=900&fit=crop",
  },
];

export const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsAnimating(false);
      }, 500);
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{
          backgroundImage: `url('${slide.backgroundImage}')`,
          opacity: isAnimating ? 0.3 : 1,
        }}
      />
      
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/50 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-24">
        <div className="max-w-3xl">

          {/* Date Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-4 py-2 mb-6 transition-all duration-500",
              isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}
          >
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{slide.date}</span>
          </div>

          {/* Title */}
          <h1
            className={cn(
              "text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-foreground leading-tight mb-6 transition-all duration-500",
              isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
            )}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p
            className={cn(
              "text-lg md:text-xl text-muted-foreground mb-10 max-w-xl transition-all duration-500 delay-100",
              isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
            )}
          >
            {slide.subtitle}
          </p>

          {/* CTA Buttons */}
          <div
            className={cn(
              "flex flex-wrap items-center gap-4 transition-all duration-500 delay-200",
              isAnimating ? "opacity-0 translate-y-8" : "opacity-100 translate-y-0"
            )}
          >
            <Link href={slide.learnMoreLink}>
              <Button variant="hero-outline" size="lg">
                Learn more
              </Button>
            </Link>
            <Link href={slide.ctaLink}>
              <Button variant="hero" size="lg">
                {slide.ctaText}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 border border-primary/30 hover:bg-primary hover:text-primary-foreground">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2 mt-16">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                currentSlide === index
                  ? "bg-primary w-12"
                  : "bg-muted-foreground/30 w-6 hover:bg-muted-foreground/50"
              )}
            />
          ))}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
