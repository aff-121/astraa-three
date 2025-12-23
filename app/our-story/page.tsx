"use client";
import { Layout } from "@/components/layout/Layout";
import { Film, Award, Users, Heart } from "lucide-react";

const milestones = [
  { year: "2018", title: "The Beginning", description: "Astra Production was founded with a vision to revolutionize Tulu cinema." },
  { year: "2019", title: "First Production", description: "Released our debut film 'Kattimani' to critical acclaim." },
  { year: "2021", title: "Expansion", description: "Expanded operations with a new studio and production facility." },
  { year: "2023", title: "Awards Launch", description: "Launched the Astra Filmfare Awards to celebrate regional talent." },
  { year: "2024", title: "Record Success", description: "Our films crossed 100 crore cumulative box office collection." },
];

const stats = [
  { icon: Film, value: "15+", label: "Films Produced" },
  { icon: Award, value: "50+", label: "Awards Won" },
  { icon: Users, value: "1M+", label: "Happy Viewers" },
  { icon: Heart, value: "100+", label: "Talented Artists" },
];

export default function Page() {
  return (
    <Layout>
      <div className="pt-24 pb-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 lg:px-8 mb-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">Our Story</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Astra Production was born from a passion for storytelling and a deep love for coastal Karnataka's rich cultural heritage. We
              believe that every story deserves to be told, and every voice deserves to be heard.
            </p>
          </div>
        </div>

        <div className="bg-cinema-card py-20 mb-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">A Cinematic Vision</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  We are committed to elevating Coastalwood by exploring untold stories and unseen genres in Tulu cinema. Our mission is to
                  create films that resonate with audiences while preserving and celebrating our unique cultural identity.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  From action-packed thrillers to heartfelt dramas, we push the boundaries of regional cinema while staying true to our
                  roots. Every project we undertake is a labor of love, crafted with attention to detail and a commitment to excellence.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=300&fit=crop"
                  alt="Film production"
                  className="rounded-2xl w-full h-48 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop"
                  alt="Cinema"
                  className="rounded-2xl w-full h-48 object-cover mt-8"
                />
                <img
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop"
                  alt="Movie set"
                  className="rounded-2xl w-full h-48 object-cover"
                />
                <img
                  src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop"
                  alt="Theater"
                  className="rounded-2xl w-full h-48 object-cover mt-8"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-cinema-card rounded-2xl p-8 border border-border text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="text-3xl font-display font-bold text-foreground mb-2">{stat.value}</div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 mb-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-12">Our Journey</h2>
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.year}
                  className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="bg-cinema-card rounded-2xl p-6 border border-border">
                      <h3 className="text-xl font-display font-bold text-foreground mb-2">{milestone.title}</h3>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-primary/10 border-4 border-background flex items-center justify-center shrink-0 z-10">
                    <span className="text-lg font-bold text-primary">{milestone.year}</span>
                  </div>
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-cinema-card py-20">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-12">
              Behind every great film is a team of passionate individuals dedicated to bringing stories to life. Our team combines
              experience with fresh perspectives.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <div className="w-32 h-32 rounded-full bg-muted mx-auto mb-4 overflow-hidden">
                    <img
                      src={`https://images.unsplash.com/photo-${1500648767791 + i * 100}-00dcc994a43e?w=200&h=200&fit=crop`}
                      alt="Team member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground">Team Member</h3>
                  <p className="text-sm text-muted-foreground">Position</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
