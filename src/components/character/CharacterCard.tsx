import { Link } from "react-router-dom";
import { Character } from "@/types/character";
import { Shield, Heart, Sword } from "lucide-react";

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <Link to={`/character/${character.id}`} className="block group">
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-card transition-all duration-300 hover:scale-[1.02] hover:shadow-glow hover:border-primary/50">
        {/* Portrait */}
        <div className="aspect-[3/4] overflow-hidden">
          {character.portrait_url ? (
            <img
              src={character.portrait_url}
              alt={character.character_name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Shield className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        {/* Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-semibold text-foreground truncate">
            {character.character_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            Level {character.level} {character.race} {character.character_class}
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-destructive" />
              {character.character_data.hitPoints?.maximum || "—"}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-primary" />
              {character.character_data.armorClass || "—"}
            </span>
          </div>
        </div>
        
        {/* Ruleset Badge */}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary/80 text-primary-foreground rounded">
            {character.ruleset}
          </span>
        </div>
      </div>
    </Link>
  );
}
