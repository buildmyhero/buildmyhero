import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { placeholderCharacter } from "@/data/placeholder-character";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Heart, Zap, Eye, Sparkles, ArrowRight } from "lucide-react";

export default function CharacterPreviewPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const character = placeholderCharacter; // Using placeholder for now

  const stats = character.character_data;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Character Info */}
          <div className="space-y-6 animate-fade-in">
            {/* Portrait */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-card">
              {character.portrait_url ? (
                <img
                  src={character.portrait_url}
                  alt={character.character_name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-muted flex items-center justify-center">
                  <Shield className="h-24 w-24 text-muted-foreground/50" />
                </div>
              )}
              
              {/* Overlay with name */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  {character.character_name}
                </h1>
                <p className="text-lg text-muted-foreground">
                  Level {character.level} {character.race} {character.character_class}
                </p>
              </div>
              
              {/* Ruleset badge */}
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-sm font-medium bg-primary/80 text-primary-foreground rounded-full">
                  D&D {character.ruleset}
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Heart className="h-6 w-6 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.hitPoints.maximum}</p>
                <p className="text-xs text-muted-foreground">Hit Points</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.armorClass}</p>
                <p className="text-xs text-muted-foreground">Armor Class</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Zap className="h-6 w-6 text-gold mx-auto mb-2" />
                <p className="text-2xl font-bold">+{stats.proficiencyBonus}</p>
                <p className="text-xs text-muted-foreground">Proficiency</p>
              </div>
            </div>

            {/* Ability Scores Preview */}
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Ability Scores</h3>
              <div className="grid grid-cols-6 gap-2 text-center">
                {Object.entries(stats.abilityScores).map(([ability, score]) => (
                  <div key={ability} className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">
                      {ability.slice(0, 3)}
                    </p>
                    <p className="text-xl font-bold">{score}</p>
                    <p className="text-xs text-muted-foreground">
                      ({stats.abilityModifiers[ability as keyof typeof stats.abilityModifiers] >= 0 ? '+' : ''}
                      {stats.abilityModifiers[ability as keyof typeof stats.abilityModifiers]})
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Preview */}
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2">
                {stats.features.slice(0, 3).map((feature) => (
                  <li key={feature.name} className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{feature.name}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <Link 
                to={`/character/${character.id}`}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4"
              >
                <Eye className="h-4 w-4" />
                View full character sheet
              </Link>
            </div>
          </div>

          {/* Right Column - Signup CTA or Actions */}
          <div className="animate-slide-in-right" style={{ animationDelay: "200ms" }}>
            {user ? (
              <div className="bg-gradient-card rounded-2xl border border-border/50 p-8 sticky top-24">
                <div className="text-center mb-6">
                  <Sparkles className="h-12 w-12 text-gold mx-auto mb-4" />
                  <h2 className="font-display text-2xl font-bold mb-2">
                    Character Ready!
                  </h2>
                  <p className="text-muted-foreground">
                    Your character has been saved to your library.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Link to={`/character/${character.id}`}>
                    <Button variant="gold" className="w-full" size="lg">
                      View Full Character Sheet
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/library">
                    <Button variant="outline" className="w-full" size="lg">
                      Go to Library
                    </Button>
                  </Link>
                  <Link to="/">
                    <Button variant="ghost" className="w-full">
                      Create Another Character
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="sticky top-24">
                <div className="text-center mb-6">
                  <Sparkles className="h-12 w-12 text-gold mx-auto mb-4 animate-float" />
                  <h2 className="font-display text-2xl font-bold mb-2">
                    Love Your Character?
                  </h2>
                  <p className="text-muted-foreground">
                    Sign up to save it and download your character sheet PDF!
                  </p>
                </div>
                
                <AuthForm mode="signup" redirectTo={`/character/${id}`} />
                
                <div className="text-center mt-6">
                  <Link 
                    to={`/character/${character.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Continue without account →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
