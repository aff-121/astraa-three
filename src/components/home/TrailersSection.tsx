import { Play } from "lucide-react";

const trailers = [
  {
    id: 1,
    title: "Bulldog - Official Trailer",
    thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=340&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: 2,
    title: "Netterekere - Behind The Scenes",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=340&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
  {
    id: 3,
    title: "Astra Filmfare Awards 2024 - Highlights",
    thumbnail: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=340&fit=crop",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  },
];

export const TrailersSection = () => {
  return (
    <section className="py-20 bg-cinema-card relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-primary/50" />
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Trailers & Media
          </h2>
          <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-primary/50" />
        </div>

        {/* Trailers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trailers.map((trailer) => (
            <a
              key={trailer.id}
              href={trailer.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block"
            >
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted">
                <img
                  src={trailer.thumbnail}
                  alt={trailer.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/90 text-primary-foreground flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg shadow-primary/30">
                    <Play className="w-6 h-6 ml-1" />
                  </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                    {trailer.title}
                  </h3>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
