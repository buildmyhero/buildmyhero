import { Link } from "react-router-dom";
import { Character } from "@/types/character";
import { Shield, Heart, Download, Loader2, BookOpen, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortraitWithSkeleton } from "./PortraitWithSkeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CharacterCardProps {
  character: Character;
  showDownload?: boolean;
  onDownloadSheet?: () => void;
  onDownloadPlayGuide?: () => void;
  isDownloadingSheet?: boolean;
  isDownloadingPlayGuide?: boolean;
}

export function CharacterCard({ 
  character, 
  showDownload = false, 
  onDownloadSheet, 
  onDownloadPlayGuide,
  isDownloadingSheet = false,
  isDownloadingPlayGuide = false,
}: CharacterCardProps) {
  const hasPlayGuide = !!character.play_guide_content;
  const isGenerating = character.status === 'generating';

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-card transition-all duration-300 hover:shadow-glow hover:border-primary/50 group">
      <Link to={`/character/${character.id}`} className="block">
        {/* Portrait */}
        <div className="aspect-[3/4] overflow-hidden">
          <PortraitWithSkeleton
            portraitUrl={character.portrait_url}
            characterName={character.character_name}
            characterId={character.id}
            className="w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />
          
          {/* Generating indicator */}
          {isGenerating && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Generating...</p>
                <p className="text-xs text-muted-foreground/60">{character.generation_progress}%</p>
              </div>
            </div>
          )}
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
      </Link>

      {/* Download Menu (appears on hover) */}
      {showDownload && !isGenerating && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDownloadSheet?.();
                }}
                disabled={isDownloadingSheet}
              >
                {isDownloadingSheet ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Character Sheet
              </DropdownMenuItem>
              {hasPlayGuide && (
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDownloadPlayGuide?.();
                  }}
                  disabled={isDownloadingPlayGuide}
                >
                  {isDownloadingPlayGuide ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <BookOpen className="mr-2 h-4 w-4" />
                  )}
                  Play Guide
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
