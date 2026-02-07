import { Layout } from "@/components/layout/Layout";
import { CharacterGeneratorForm } from "@/components/character/CharacterGeneratorForm";
import { ExampleCharacters } from "@/components/character/ExampleCharacters";
import { Sparkles, Wand2, Scroll, Download } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  {
    icon: Wand2,
    title: "AI-Powered Generation",
    description: "Describe any concept and watch it transform into a complete character",
  },
  {
    icon: Sparkles,
    title: "Unique Portraits",
    description: "Each character gets a custom AI-generated portrait that matches your vision",
  },
  {
    icon: Scroll,
    title: "Complete Character Sheet",
    description: "Full stats, abilities, equipment, spells, and backstory — ready to play",
  },
  {
    icon: Download,
    title: "Printable PDFs",
    description: "Download professional character sheets and play guides instantly",
  },
];

export default function HomePage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 px-4">
        {/* Background Image */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${heroBg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Create Perfect D&D
              <br />
              <span className="text-gradient-hero">Characters in Seconds</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Describe your character concept. We bring them to life with complete stats, 
              spells, equipment, and a unique AI-generated portrait.
            </p>
          </div>
          
          {/* Generator Form */}
          <CharacterGeneratorForm />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="p-6 rounded-xl bg-gradient-card border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <feature.icon className="h-10 w-10 text-gold mb-4" />
                <h3 className="font-display text-lg font-semibold mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Characters */}
      <ExampleCharacters />
    </Layout>
  );
}
