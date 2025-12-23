"use client";
import { Link, useParams } from "@/lib/navigation";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useNewsItem, useNewsGallery } from "@/hooks/useNews";
import { ArrowLeft, Calendar, Play, Loader2 } from "lucide-react";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { data: news, isLoading } = useNewsItem(id || "");
  const { data: gallery } = useNewsGallery(news?.id || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!news) {
    return (
      <Layout>
        <div className="pt-24 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">News Not Found</h1>
            <Link href="/news">
              <Button variant="coral" className="rounded-full">
                Browse News
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-20 pb-20 bg-background min-h-screen">
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src={news.image_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=800&fit=crop"}
            alt={news.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute top-8 left-8">
            <Link href="/news">
              <Button variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 -mt-32 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(news.published_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">{news.title}</h1>
              <p className="text-xl text-muted-foreground mb-8">{news.description}</p>

              <div className="prose prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{news.content}</p>
              </div>
            </div>

            {gallery && gallery.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((img) => (
                    <div key={img.id} className="aspect-[4/3] rounded-xl overflow-hidden group">
                      <img
                        src={img.image_url}
                        alt="Gallery"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {news.youtube_url && (
              <div className="mb-12">
                <h2 className="text-2xl font-display font-bold text-foreground mb-6">Watch Video</h2>
                <a href={news.youtube_url} target="_blank" rel="noopener noreferrer" className="block group">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-cinema-card">
                    <img
                      src={news.image_url || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=800&fit=crop"}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-background/40 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 ml-1" />
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
