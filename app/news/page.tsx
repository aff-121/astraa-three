"use client";
import { Link } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Calendar, ArrowRight, Play } from "lucide-react";
import { useNews } from "@/hooks/useNews";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton for featured news card
const FeaturedNewsSkeleton = () => (
  <div className="mb-12">
    <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-cinema-card">
      <Skeleton className="w-full h-full" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-8 w-2/3 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  </div>
);

// Skeleton for news card
const NewsCardSkeleton = () => (
  <div className="bg-cinema-card rounded-2xl overflow-hidden border border-border">
    <Skeleton className="aspect-[16/10]" />
    <div className="p-5 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function Page() {
  const { data: news, isLoading, error } = useNews();

  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
              News & Announcements
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest news, announcements, and behind-the-scenes from Astra Production.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <>
              <FeaturedNewsSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(5)].map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </div>
            </>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Failed to load news. Please try again later.</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && news?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No news articles available at the moment.</p>
            </div>
          )}

          {/* News Content */}
          {!isLoading && !error && news && news.length > 0 && (
            <>
              {/* Featured News (First Item) */}
              <div className="mb-12">
                <Link href={`/news/${news[0].slug}`} className="block group">
                  <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-cinema-card">
                    <img
                      src={news[0].image_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop"}
                      alt={news[0].title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    {news[0].youtube_url && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-20 h-20 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                          <Play className="w-8 h-8 ml-1" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-2 text-primary mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(news[0].published_at)}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                        {news[0].title}
                      </h2>
                      <p className="text-muted-foreground max-w-2xl">{news[0].description}</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* News Grid (Remaining Items) */}
              {news.length > 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {news.slice(1).map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="group bg-cinema-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop"}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {item.youtube_url && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                              <Play className="w-5 h-5 ml-0.5" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-cinema-card via-transparent to-transparent" />
                      </div>

                      <div className="p-5">
                        <div className="flex items-center gap-2 text-primary mb-3">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(item.published_at)}</span>
                        </div>
                        <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{item.description}</p>
                        <div className="flex items-center gap-2 text-primary text-sm font-medium">
                          Read more
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
