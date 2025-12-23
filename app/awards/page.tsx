"use client";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Award, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { id: "best-film", name: "Best Film", icon: Trophy },
  { id: "best-actor", name: "Best Actor", icon: Star },
  { id: "best-actress", name: "Best Actress", icon: Star },
  { id: "best-director", name: "Best Director", icon: Award },
  { id: "best-music", name: "Best Music", icon: Award },
  { id: "best-debut", name: "Best Debut", icon: Star },
  { id: "best-screenplay", name: "Best Screenplay", icon: Award },
  { id: "lifetime-achievement", name: "Lifetime Achievement", icon: Trophy },
];

const hosts = [
  {
    name: "Puneeth Rajkumar",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
    role: "Host",
  },
  {
    name: "Rashmika Mandanna",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=400&fit=crop",
    role: "Co-Host",
  },
  {
    name: "Yash",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=400&fit=crop",
    role: "Special Guest",
  },
];

const galleryPhotos = [
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop",
];

const videos = [
  {
    title: "Awards 2024 - Highlights",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=340&fit=crop",
    url: "https://youtube.com",
  },
  {
    title: "Best Moments",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=340&fit=crop",
    url: "https://youtube.com",
  },
  {
    title: "Red Carpet Recap",
    thumbnail: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&h=340&fit=crop",
    url: "https://youtube.com",
  },
];

export default function Page() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);

  const visibleCategories = 5;
  const maxCategoryIndex = Math.max(0, categories.length - visibleCategories);

  return (
    <Layout>
      <div className="pt-20 pb-20 bg-background min-h-screen">
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&h=900&fit=crop"
            alt="Awards"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
                Astra Filmfare Awards
              </h1>
              <p className="text-xl text-muted-foreground">Celebrating Excellence in Tulu Cinema</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <section className="py-16">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">Award Categories</h2>

            <div className="relative">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => setCategoryIndex(Math.max(0, categoryIndex - 1))}
                  disabled={categoryIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex-1 overflow-hidden">
                  <div
                    className="flex gap-4 transition-transform duration-300"
                    style={{ transform: `translateX(-${categoryIndex * (100 / visibleCategories)}%)` }}
                  >
                    {categories.map((category) => (
                      <div key={category.id} className="flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/5">
                        <div className="bg-cinema-card rounded-2xl p-6 border border-border hover:border-primary/50 transition-all duration-300 text-center group cursor-pointer">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                            <category.icon className="w-8 h-8 text-primary" />
                          </div>
                          <h3 className="font-semibold text-foreground text-sm">{category.name}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full"
                  onClick={() => setCategoryIndex(Math.min(maxCategoryIndex, categoryIndex + 1))}
                  disabled={categoryIndex >= maxCategoryIndex}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </section>

          <section className="py-16">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">Hosts</h2>

            <div className="flex flex-wrap justify-center gap-8">
              {hosts.map((host) => (
                <div key={host.name} className="text-center group">
                  <div className="relative w-40 h-52 rounded-2xl overflow-hidden mb-4">
                    <img
                      src={host.image}
                      alt={host.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">{host.name}</h3>
                  <p className="text-sm text-muted-foreground">{host.role}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-16">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">Gallery</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(showAllPhotos ? galleryPhotos : galleryPhotos.slice(0, 6)).map((photo, index) => (
                <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer">
                  <img
                    src={photo}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>

            {galleryPhotos.length > 6 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="rounded-full" onClick={() => setShowAllPhotos(!showAllPhotos)}>
                  {showAllPhotos ? "Show Less" : "View All Photos"}
                </Button>
              </div>
            )}
          </section>

          <section className="py-16">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-8">Videos</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(showAllVideos ? videos : videos.slice(0, 3)).map((video, index) => (
                <a key={index} href={video.url} target="_blank" rel="noopener noreferrer" className="group">
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-semibold text-foreground">{video.title}</h3>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {videos.length > 3 && (
              <div className="text-center mt-8">
                <Button variant="outline" className="rounded-full" onClick={() => setShowAllVideos(!showAllVideos)}>
                  {showAllVideos ? "Show Less" : "View All Videos"}
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
}
