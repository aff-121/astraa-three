"use client";
import { Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Calendar, User, Film } from "lucide-react";
import { useMovies } from "@/hooks/useMovies";
import { MovieCardSkeleton, SkeletonGrid } from "@/components/skeletons";

export default function Page() {
  const { data: movies, isLoading, isError } = useMovies();

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">Our Movies</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our collection of Tulu cinema that celebrates coastal culture and storytelling.
            </p>
          </div>

          {isLoading && (
            <SkeletonGrid count={6}>
              <MovieCardSkeleton />
            </SkeletonGrid>
          )}

          {isError && (
            <div className="text-center text-muted-foreground">Failed to load movies.</div>
          )}

          {!isLoading && !isError && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {movies?.map((movie) => (
             
             
             
             
             <div
                key={movie.id}
                className="group bg-cinema-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
              >
                  <div className="relative aspect-square overflow-hidden">
                  <img
                    src={movie.image_url ?? "https://placehold.co/600x800?text=Movie"}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                        movie.status === "coming-soon" ? "bg-gold text-secondary-foreground" : "bg-primary text-primary-foreground"
                      }`}
                    >
                      {movie.status === "coming-soon" ? "Coming Soon" : "Released"}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent" />
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                    {movie.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{movie.description}</p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4 text-primary" />
                      <span>Directed by {movie.director}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Film className="w-4 h-4 text-primary" />
                      <span>{movie.genre}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{movie.release_date}</span>
                    </div>
                  </div>
                  <Link href={`/movies/${movie.slug}`}>
                    <Button variant="coral" className="w-full rounded-full gap-2">
                      Learn more
                      <ArrowUpRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>

                
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
