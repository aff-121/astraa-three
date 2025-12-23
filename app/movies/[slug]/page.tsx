import Link from "next/link";
import { notFound } from "next/navigation";
import { Layout } from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMovieBySlug } from "@/lib/movies";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar, Clock, ExternalLink, Film, Play, User } from "lucide-react";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const movie = await getMovieBySlug(slug);

  if (!movie) {
    notFound();
  }

  const castMembers = movie.cast_members ?? [];
  const isComingSoon = (movie.status || "").toLowerCase() === "coming-soon";
  const statusLabel = movie.status ? movie.status.replace(/-/g, " ") : "Now Showing";
  const poster = movie.image_url ?? "https://placehold.co/1600x900?text=Movie";
  const synopsis = movie.synopsis ?? movie.description ?? "";
  const description = movie.description ?? movie.synopsis ?? "";

  return (
    <Layout>
      <div className="relative overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute right-0 top-32 h-96 w-96 rounded-full bg-secondary/20 blur-3xl" />
        </div>

        <div className="relative">
          <div className="relative h-[65vh] overflow-hidden rounded-b-[48px] border-b border-border/50">
            <img src={poster} alt={movie.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/20" />
            <div className="absolute top-8 left-8 flex items-center gap-3">
              <Link href="/movies">
                <Button variant="outline" size="sm" className="gap-2 bg-background/70 backdrop-blur-md border-border/60">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Movies
                </Button>
              </Link>
              <Badge variant={isComingSoon ? "secondary" : "default"} className="rounded-full px-4 py-2 capitalize">
                {statusLabel}
              </Badge>
            </div>

            <div className="absolute bottom-10 left-0 right-0">
              <div className="container mx-auto px-4 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-end">
                  <div className="space-y-3 sm:space-y-4 text-left max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                      {movie.genre && (
                        <Badge variant="outline" className="rounded-full border-primary/50 text-primary px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                          <Film className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                          {movie.genre}
                        </Badge>
                      )}
                      {movie.duration && (
                        <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                          {movie.duration}
                        </Badge>
                      )}
                      {movie.release_date && (
                        <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5 sm:mr-2" />
                          {movie.release_date}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground drop-shadow-xl">
                      {movie.title}
                    </h1>
                    <p className="text-sm sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl">
                      {description}
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <Button
                        asChild
                        size="lg"
                        variant="coral"
                        className={cn(
                          "rounded-full px-4 sm:px-6 shadow-xl shadow-primary/30 text-sm sm:text-base",
                          !movie.youtube_url && "pointer-events-none opacity-60",
                        )}
                        disabled={!movie.youtube_url}
                      >
                        <a href={movie.youtube_url ?? "#"} target="_blank" rel="noopener noreferrer">
                          <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                          Watch Trailer
                        </a>
                      </Button>
                      <Button
                        asChild
                        size="lg"
                        variant={isComingSoon ? "gold" : "outline"}
                        className={cn(
                          "rounded-full px-4 sm:px-6 border-primary/40 hover:border-primary/70 text-sm sm:text-base",
                          !movie.bookmyshow_url && "pointer-events-none opacity-60",
                        )}
                        disabled={!movie.bookmyshow_url}
                      >
                        <a href={movie.bookmyshow_url ?? "#"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                          Book on BookMyShow
                          <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="hidden lg:block justify-self-end">
                    <div className="relative w-[320px] rounded-3xl border border-border/60 bg-background/60 p-3 backdrop-blur-xl shadow-2xl shadow-primary/20">
                      <div className="relative overflow-hidden rounded-2xl">
                        <img src={poster} alt={`${movie.title} poster`} className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          <span>{movie.director ? `Directed by ${movie.director}` : "Director TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Film className="w-4 h-4 text-primary" />
                          <span>{movie.genre ?? "Genre TBA"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{movie.duration ?? "Duration TBA"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 pb-20">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-cinema-card/80 backdrop-blur-xl p-5 sm:p-8 shadow-xl shadow-primary/10">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                  <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                  <span>{movie.director ? `Directed by ${movie.director}` : "Director TBA"}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground mb-3">Synopsis</h2>
                <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{synopsis}</p>
              </div>

              <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-cinema-card/80 backdrop-blur-xl p-5 sm:p-8 shadow-xl shadow-primary/10">
                <div className="flex items-center gap-3 mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                  <Film className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                  <span>Cast</span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {castMembers.length === 0 && <span className="text-muted-foreground text-xs sm:text-sm">Cast to be announced.</span>}
                  {castMembers.map((actor) => (
                    <Badge key={actor} variant="secondary" className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm bg-primary/10 text-foreground border-primary/20">
                      {actor}
                    </Badge>
                  ))}
                </div>
              </div>

              {movie.youtube_url && (
                <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-cinema-card/80 backdrop-blur-xl overflow-hidden shadow-xl shadow-primary/10">
                  <div className="relative aspect-video bg-muted">
                    <img src={poster} alt="Trailer thumbnail" className="w-full h-full object-cover opacity-70" />
                    <a
                      href={movie.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/40">
                        <Play className="w-8 h-8 ml-1" />
                      </div>
                    </a>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-xl font-display font-bold text-foreground">Official Trailer</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">Watch the latest trailer in a new tab.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-cinema-card/90 backdrop-blur-xl p-4 sm:p-6 shadow-2xl shadow-primary/10 lg:sticky lg:top-24">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-xl font-display font-bold text-foreground">{isComingSoon ? "Coming Soon" : "Now Showing"}</h3>
                  <Badge variant="outline" className="rounded-full px-2 sm:px-3 py-1 sm:py-1.5 text-xs uppercase tracking-wide">
                    {statusLabel}
                  </Badge>
                </div>

                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="truncate">{movie.release_date ?? "Release date TBA"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Film className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="truncate">{movie.genre ?? "Genre TBA"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                    <span className="truncate">{movie.duration ?? "Duration TBA"}</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col gap-2 sm:gap-3">
                  <Button
                    asChild
                    variant="coral"
                    size="lg"
                    className={cn("w-full rounded-full text-sm sm:text-base", !movie.youtube_url && "pointer-events-none opacity-60")}
                    disabled={!movie.youtube_url}
                  >
                    <a href={movie.youtube_url ?? "#"} target="_blank" rel="noopener noreferrer">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                      Watch Trailer
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant={isComingSoon ? "gold" : "coral"}
                    size="lg"
                    className={cn("w-full rounded-full text-sm sm:text-base", !movie.bookmyshow_url && "pointer-events-none opacity-60")}
                    disabled={!movie.bookmyshow_url}
                  >
                    <a href={movie.bookmyshow_url ?? "#"} target="_blank" rel="noopener noreferrer">
                      Book on BookMyShow
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  {isComingSoon
                    ? movie.release_date
                      ? `Releasing on ${movie.release_date}`
                      : "Releasing soon"
                    : "You will be redirected to BookMyShow"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
