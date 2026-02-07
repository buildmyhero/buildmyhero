import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wand2, Sparkles, Loader2 } from "lucide-react";
import { Ruleset } from "@/types/character";
import { useCharacterGeneration } from "@/hooks/useCharacterGeneration";

const placeholderExamples = [
  "A spooky swamp witch who talks to frogs",
  "Like Jason Bourne, but with magic",
  "Cruella de Vil from 101 Dalmatians",
  "A grumpy dwarf chef who only cooks for royalty",
  "Robin Hood as a tiefling rogue",
];

export function CharacterGeneratorForm() {
  const [concept, setConcept] = useState("");
  const [level, setLevel] = useState("3");
  const [ruleset, setRuleset] = useState<Ruleset>("2024");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const { isGenerating, generateCharacter } = useCharacterGeneration();

  const handleGenerate = async () => {
    if (!concept.trim()) return;
    await generateCharacter(concept, parseInt(level), ruleset);
  };

  const cyclePlaceholder = () => {
    setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-card rounded-2xl border border-border/50 p-6 md:p-8 shadow-card animate-scale-in">
        <div className="space-y-6">
          {/* Concept Input */}
          <div className="space-y-2">
            <Label htmlFor="concept" className="text-lg font-display">
              Describe Your Character
            </Label>
            <div className="relative">
              <Textarea
                id="concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={placeholderExamples[placeholderIndex]}
                className="min-h-[120px] text-lg bg-muted/50 border-border/50 focus:border-primary resize-none"
                onFocus={cyclePlaceholder}
                disabled={isGenerating}
              />
              <button
                type="button"
                onClick={cyclePlaceholder}
                className="absolute bottom-3 right-3 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                disabled={isGenerating}
              >
                <Sparkles className="h-3 w-3" />
                Try another idea
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Pop culture references, personality traits, or fantasy archetypes — anything goes!
            </p>
          </div>

          {/* Level and Ruleset Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Selector */}
            <div className="space-y-2">
              <Label htmlFor="level" className="font-display">Level</Label>
              <Select value={level} onValueChange={setLevel} disabled={isGenerating}>
                <SelectTrigger className="bg-muted/50 border-border/50">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => (
                    <SelectItem key={lvl} value={lvl.toString()}>
                      Level {lvl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ruleset Selector */}
            <div className="space-y-2">
              <Label className="font-display">Ruleset</Label>
              <RadioGroup
                value={ruleset}
                onValueChange={(value) => setRuleset(value as Ruleset)}
                className="flex gap-4"
                disabled={isGenerating}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2024" id="ruleset-2024" />
                  <Label htmlFor="ruleset-2024" className="cursor-pointer font-normal">
                    D&D 2024
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2014" id="ruleset-2014" />
                  <Label htmlFor="ruleset-2014" className="cursor-pointer font-normal">
                    D&D 2014
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handleGenerate}
            disabled={!concept.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating Your Hero...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Character
              </>
            )}
          </Button>
          
          {isGenerating && (
            <p className="text-sm text-center text-muted-foreground animate-pulse">
              This usually takes 15-30 seconds. We're crafting something special!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
