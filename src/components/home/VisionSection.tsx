const galleryImages = [
  "/marquee/one/one one.svg",
  "/marquee/one/one two.svg",
  "/marquee/one/one three.svg",
  "/marquee/one/one four.svg",
];

const galleryImages2 = [
  "/marquee/two/two one.svg",
  "/marquee/two/two two.svg",
  "/marquee/two/two three.svg",
  "/marquee/two/two four.svg",
  
];

export const VisionSection = () => {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Top Gallery Slider */}
      <div className="relative mb-8 overflow-hidden">
        <div className="flex gap-4 animate-marquee">
          {[...galleryImages, ...galleryImages].map((img, index) => (
            <div
              key={index}
              className="w-64 h-40 rounded-xl overflow-hidden shrink-0"
            >
              <img
                src={img}
                alt="Gallery"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Vision Text */}
      <div className="container mx-auto px-4 lg:px-8 py-16 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            A Cinematic Vision
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Elevating Coastalwood by exploring untold stories & unseen genres in Tulu cinema.
          </p>
        </div>
      </div>

      {/* Bottom Gallery Slider - Reverse direction */}
      <div className="relative mt-8 overflow-hidden">
        <div className="flex gap-4 animate-marquee" style={{ animationDirection: "reverse" }}>
          {[...galleryImages2, ...galleryImages2].map((img, index) => (
            <div
              key={index}
              className="w-64 h-40 rounded-xl overflow-hidden shrink-0"
            >
              <img
                src={img}
                alt="Gallery"
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
