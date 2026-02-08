import { Loader2 } from "lucide-react";

interface GenerationProgressProps {
  progress: number;
  characterName?: string;
}

const PROGRESS_STAGES = [
  { threshold: 15, message: "Analyzing your concept..." },
  { threshold: 30, message: "Rolling ability scores..." },
  { threshold: 50, message: "Selecting equipment and spells..." },
  { threshold: 60, message: "Generating character portrait..." },
  { threshold: 75, message: "Creating character backstory..." },
  { threshold: 85, message: "Developing combat tactics and roleplay guide..." },
  { threshold: 95, message: "Finalizing play guide..." },
  { threshold: 100, message: "Almost there..." },
];

function getProgressMessage(progress: number): string {
  for (const stage of PROGRESS_STAGES) {
    if (progress <= stage.threshold) {
      return stage.message;
    }
  }
  return "Finalizing character sheet...";
}

export function GenerationProgress({ progress, characterName }: GenerationProgressProps) {
  const message = getProgressMessage(progress);
  
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md w-full">
        {/* Animated icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto relative">
            <div className="absolute inset-0 rounded-full border-4 border-muted-foreground/20" />
            <div 
              className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
              style={{ animationDuration: '1.5s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Character name if available */}
        {characterName && (
          <h2 className="font-display text-2xl font-bold mb-2 text-foreground">
            Creating {characterName}
          </h2>
        )}

        {/* Progress message */}
        <p className="text-lg text-muted-foreground mb-6 min-h-[28px]">
          {message}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-gold transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Estimated time */}
        <p className="text-sm text-muted-foreground/60">
          {progress < 50 ? (
            "This usually takes 30-60 seconds..."
          ) : progress < 85 ? (
            "Generating portrait and play guide..."
          ) : (
            "Almost done!"
          )}
        </p>

        {/* Tip */}
        <div className="mt-8 p-4 bg-gradient-card rounded-xl border border-border/50">
          <p className="text-sm text-muted-foreground">
            💡 <span className="text-foreground">Tip:</span> While you wait, think about how your 
            character might interact with a party of adventurers!
          </p>
        </div>
      </div>
    </div>
  );
}
