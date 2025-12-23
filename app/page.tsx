"use client";
import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { MoviesSection } from "@/components/home/MoviesSection";
import { EventsSection } from "@/components/home/EventsSection";
import { VisionSection } from "@/components/home/VisionSection";
import { TrailersSection } from "@/components/home/TrailersSection";
import { ContactSection } from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <MoviesSection />
      <EventsSection />
      <VisionSection />
      <TrailersSection />
      <ContactSection />
    </Layout>
  );
}
