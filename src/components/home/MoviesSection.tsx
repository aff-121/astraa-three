"use client";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useMovies } from "@/hooks/useMovies";
import { Skeleton } from "@/components/ui/skeleton";

const MovieCardSkeleton = () => (
  <div className="group relative">
    <Skeleton className="aspect-[2/3] rounded-2xl" />
    <div className="mt-4 flex items-center gap-2">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="flex-1 h-9 rounded-full" />
    </div>
  </div>
);

export const MoviesSection = () => {
  const { data: movies, isLoading, error } = useMovies();

  // Take only first 5 movies for homepage
  const displayMovies = movies?.slice(0, 5) || [];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Section Header */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-primary/50" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Movies
          </h2>
          <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-primary/50" />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {[...Array(5)].map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load movies. Please try again later.</p>
          </div>
        )}

        {/* Movies Grid */}
        {!isLoading && !error && displayMovies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
            {displayMovies.map((movie) => (
              <Link
                key={movie.id}
                href={`/movies/${movie.slug}`}
                className="group relative"
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-muted">
                  <img
                    src={movie.image_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop"}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        movie.status === "coming-soon"
                          ? "bg-gold text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {movie.status === "coming-soon" ? "Coming Soon" : "Released"}
                    </span>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Learn More Button */}
                <div className="mt-4 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="coral"
                    size="sm"
                    className="flex-1 rounded-full"
                  >
                    Learn more
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && displayMovies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No movies available at the moment.</p>
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-12">
          <Link href="/movies">
            <Button
              variant="outline"
              className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground gap-2"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
