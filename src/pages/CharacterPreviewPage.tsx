import { useParams, Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { useCharacterRealtime } from "@/hooks/useCharacter";
import { usePdfGeneration } from "@/hooks/usePdfGeneration";
import { PortraitWithSkeleton } from "@/components/character/PortraitWithSkeleton";
import { GenerationProgress } from "@/components/character/GenerationProgress";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import {
  Shield, Heart, Zap, Sparkles, ArrowRight,
  Loader2, Download, AlertTriangle, BookOpen, Swords, Star, Lock
} from "lucide-react";

function StatBadge({ icon: Icon, value, label, color }: { icon: any; value: string | number; label: string; color: string }) {
  return (
    <div className="bg-gradient-card rounded-xl border border-border/50 p-3 text-center flex-1">
      <Icon className={`h-5 w-5 ${color} mx-auto mb-1`} />
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

// Strip markdown formatting from a line: **bold**, *italic*, leading bullets/numbers
function cleanLine(line: string): string {
  return line
    .replace(/^\s*[\*\-•]\s+/, '')      // remove leading * - • bullets
    .replace(/^\s*\d+\.\s+/, '')         // remove leading "1. " numbered list
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // remove **bold**
    .replace(/\*([^*]+)\*/g, '$1')       // remove *italic*
    .trim();
}

// Parse a ## section from the play guide.
// Handles all list formats the AI uses: "* text", "1. text", "• text", "- text"
// The heading match is case-insensitive and allows extra words after
// (e.g. "LEVELING ROADMAP (Levels 3-20)" matches "LEVELING ROADMAP")
function parseGuideSection(guide: string, heading: string, maxItems = 3): string[] {
  const upper = heading.toUpperCase();

  // Split on ## headings (the split removes the "## " prefix)
  const sections = guide.split(/^## /m);

  // Find the section whose first line *contains* the heading keyword
  const section = sections.find(s =>
    s.trim().toUpperCase().includes(upper)
  );
  if (!section) return [];

  const lines = section.split('\n');

  // Match any list item: starts with *, -, •, or a number+dot
  const listLines = lines.filter(l => {
    const t = l.trim();
    return (
      t.startsWith('*') ||
      t.startsWith('-') ||
      t.startsWith('•') ||
      /^\d+\./.test(t)
    );
  });

  const cleaned = listLines
    .map(cleanLine)
    .filter(l => l.length > 5)  // skip empty / very short lines
    .slice(0, maxItems);

  if (cleaned.length > 0) return cleaned;

  // Fallback: grab first meaningful prose sentences
  return lines
    .map(l => cleanLine(l))
    .filter(l =>
      l.length > 20 &&
      !l.startsWith('#') &&
      !l.toUpperCase().includes(upper)
    )
    .slice(0, maxItems);
}

export default function CharacterPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: character, isLoading, error } = useCharacterRealtime(id);
  const { isGenerating: isPdfGenerating, generatePdf } = usePdfGeneration();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading your character...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !character) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Character Not Found</h1>
            <p className="text-muted-foreground mb-6">This character doesn't exist or has been deleted.</p>
            <Link to="/"><Button variant="gold">Create a New Character</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (character.status === 'error') {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold mb-2">Generation Failed</h1>
            <p className="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
            <Link to="/"><Button variant="gold">Try Again</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (character.status === 'generating') {
    return (
      <Layout>
        <GenerationProgress
          progress={character.generation_progress}
          characterName={character.character_name !== 'Generating...' ? character.character_name : undefined}
        />
      </Layout>
    );
  }

  const stats = (
    character.character_data &&
    typeof character.character_data === 'object' &&
    Object.keys(character.character_data as any).length > 0
  ) ? (character.character_data as any) : null;

  if (!stats) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Finalising your character...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const highlightFeatures = stats.features?.slice(0, 3) || [];
  const playGuide = character.play_guide_content || '';

  // 1 tip for combat + roleplay, 3 for leveling
  const combatTips   = parseGuideSection(playGuide, 'COMBAT TACTICS', 1);
  const roleplayTips = parseGuideSection(playGuide, 'ROLEPLAY GUIDE', 1);
  const levelingTips = parseGuideSection(playGuide, 'LEVELING ROADMAP', 3);
  const hasGuide = combatTips.length > 0 || roleplayTips.length > 0 || levelingTips.length > 0;

  const handleDownloadPdf = async () => {
    if (!user) { navigate("/signup"); return; }
    await generatePdf(character);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* ── HERO SECTION ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* Portrait + name */}
          <div className="space-y-4 animate-fade-in">
            <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-card">
              <PortraitWithSkeleton
                portraitUrl={character.portrait_url}
                characterName={character.character_name}
                characterId={character.id}
                className="w-full aspect-square"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background to-transparent p-6">
                <h1 className="font-display text-3xl md:text-4xl font-bold">{character.character_name}</h1>
                <p className="text-lg text-muted-foreground">
                  Level {character.level} {character.race} {character.character_class}
                  {stats.subclass && ` — ${stats.subclass}`}
                </p>
              </div>
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 text-sm font-medium bg-primary/80 text-primary-foreground rounded-full">
                  D&D {character.ruleset}
                </span>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="flex gap-3">
              <StatBadge icon={Heart} value={stats.hitPoints?.maximum || '—'} label="HP" color="text-destructive" />
              <StatBadge icon={Shield} value={stats.armorClass || '—'} label="AC" color="text-primary" />
              <StatBadge icon={Zap} value={`+${stats.proficiencyBonus || 2}`} label="Prof" color="text-gold" />
              <StatBadge icon={Swords} value={stats.speed ? `${stats.speed}ft` : '30ft'} label="Speed" color="text-muted-foreground" />
            </div>

            {/* Ability scores */}
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4">
              <h3 className="font-display text-sm font-semibold uppercase text-muted-foreground mb-3">Ability Scores</h3>
              <div className="grid grid-cols-6 gap-1 text-center">
                {stats.abilityScores && Object.entries(stats.abilityScores).map(([ability, score]: [string, any]) => {
                  const mod = stats.abilityModifiers?.[ability] || 0;
                  return (
                    <div key={ability} className="space-y-0.5">
                      <p className="text-xs uppercase text-muted-foreground">{ability.slice(0, 3)}</p>
                      <p className="text-lg font-bold">{score}</p>
                      <p className="text-xs text-primary font-semibold">{mod >= 0 ? `+${mod}` : mod}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Concept chip */}
            <div className="parchment-texture rounded-xl p-4 text-parchment-foreground">
              <p className="text-xs uppercase font-semibold mb-1 opacity-60">Original Concept</p>
              <p className="text-sm italic">"{character.concept}"</p>
            </div>
          </div>

          {/* Right column — signup CTA */}
          <div className="animate-slide-in-right flex flex-col gap-5" style={{ animationDelay: '150ms' }}>
            {user ? (
              <div className="bg-gradient-card rounded-2xl border border-border/50 p-7 sticky top-24">
                <div className="text-center mb-5">
                  <Sparkles className="h-10 w-10 text-gold mx-auto mb-3" />
                  <h2 className="font-display text-2xl font-bold mb-1">Character Ready!</h2>
                  <p className="text-muted-foreground text-sm">Saved to your library.</p>
                </div>
                <div className="space-y-3">
                  <Link to={`/character/${character.id}`}>
                    <Button variant="gold" className="w-full" size="lg">
                      Full Character Sheet <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="purple" className="w-full" size="lg" onClick={handleDownloadPdf} disabled={isPdfGenerating}>
                    {isPdfGenerating
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating PDF...</>
                      : <><Download className="mr-2 h-4 w-4" />Download Character Sheet</>}
                  </Button>
                  <Link to="/library"><Button variant="outline" className="w-full" size="lg">My Library</Button></Link>
                  <Link to="/"><Button variant="ghost" className="w-full">Create Another</Button></Link>
                </div>
              </div>
            ) : (
              <div className="sticky top-24 space-y-5">
                <div className="text-center">
                  <Sparkles className="h-10 w-10 text-gold mx-auto mb-3 animate-float" />
                  <h2 className="font-display text-2xl font-bold mb-1">Love this character?</h2>
                  <p className="text-muted-foreground text-sm">Create a free account to save them, download the full character sheet PDF, and build your library.</p>
                </div>
                <AuthForm mode="signup" redirectTo={`/character/${id}`} />
                <div className="text-center">
                  <Link to={`/character/${character.id}`} className="text-sm text-muted-foreground hover:text-foreground">
                    Continue without account →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── FLAVOR SECTIONS ──────────────────────────── */}

        {/* Signature Abilities */}
        {highlightFeatures.length > 0 && (
          <section className="mb-10 animate-fade-in">
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-gold" />Signature Abilities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {highlightFeatures.map((feature: any, i: number) => (
                <div key={i} className="bg-gradient-card rounded-xl border border-border/50 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{feature.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">{feature.source}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4">{feature.description}</p>
                </div>
              ))}
            </div>
            {stats.features?.length > 3 && (
              <p className="text-sm text-muted-foreground mt-3">
                + {stats.features.length - 3} more abilities —{' '}
                {user
                  ? <Link to={`/character/${character.id}`} className="text-primary hover:underline">see full sheet →</Link>
                  : <Link to="/signup" className="text-primary hover:underline">create a free account to unlock →</Link>
                }
              </p>
            )}
          </section>
        )}

        {/* ── PLAY GUIDE ───────────────────────────────── */}
        {hasGuide && (
          <section className="mb-10 animate-fade-in">
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />How to Play This Character
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

              {/* Combat Tactics — 1 tip */}
              {combatTips.length > 0 && (
                <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
                  <h3 className="font-semibold text-gold mb-3 flex items-center gap-2">
                    <Swords className="h-4 w-4" />Combat Tactics
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-primary mr-1">›</span>{combatTips[0]}
                  </p>
                </div>
              )}

              {/* Roleplay Guide — 1 tip */}
              {roleplayTips.length > 0 && (
                <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
                  <h3 className="font-semibold text-gold mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />Roleplay Guide
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-primary mr-1">›</span>{roleplayTips[0]}
                  </p>
                </div>
              )}

              {/* Leveling Roadmap — 3 items */}
              {levelingTips.length > 0 && (
                <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
                  <h3 className="font-semibold text-gold mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4" />Leveling Roadmap
                  </h3>
                  <ul className="space-y-2">
                    {levelingTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5 flex-shrink-0">›</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Locked teaser */}
            {!user && (
              <div className="relative rounded-xl overflow-hidden border border-border/50">
                <div className="p-5 space-y-2 select-none pointer-events-none" aria-hidden>
                  {['Full action economy breakdown for every combat scenario',
                    'Feat recommendations at every ASI level through level 20',
                    'Multiclass options and synergy analysis',
                    'Equipment upgrade priority list',
                    'Roleplay voice and mannerism tips with example dialogue',
                  ].map((line, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground blur-sm">
                      <span className="text-primary">›</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent flex flex-col items-center justify-end pb-6 px-6">
                  <Lock className="h-6 w-6 text-gold mb-2" />
                  <p className="text-sm font-semibold mb-3 text-center">
                    Full play guide included with a free account
                  </p>
                  <Link to="/signup">
                    <Button variant="gold" size="sm">Unlock Full Guide — It's Free</Button>
                  </Link>
                </div>
              </div>
            )}

            {user && (
              <div className="mt-2">
                <Link to={`/character/${character.id}`}>
                  <Button variant="outline" size="sm">
                    <BookOpen className="mr-2 h-4 w-4" />Read Full Play Guide
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* Personality snapshot */}
        {stats.personality && (
          <section className="mb-10 animate-fade-in">
            <h2 className="font-display text-2xl font-bold mb-4">Personality</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.personality.traits?.length > 0 && (
                <div className="parchment-texture rounded-xl p-5 text-parchment-foreground">
                  <h3 className="font-semibold mb-2">Traits</h3>
                  <ul className="space-y-1 text-sm">{stats.personality.traits.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
                </div>
              )}
              {stats.personality.ideals?.length > 0 && (
                <div className="parchment-texture rounded-xl p-5 text-parchment-foreground">
                  <h3 className="font-semibold mb-2">Ideals</h3>
                  <ul className="space-y-1 text-sm">{stats.personality.ideals.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
                </div>
              )}
              {stats.personality.bonds?.length > 0 && (
                <div className="parchment-texture rounded-xl p-5 text-parchment-foreground">
                  <h3 className="font-semibold mb-2">Bonds</h3>
                  <ul className="space-y-1 text-sm">{stats.personality.bonds.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
                </div>
              )}
              {stats.personality.flaws?.length > 0 && (
                <div className="parchment-texture rounded-xl p-5 text-parchment-foreground">
                  <h3 className="font-semibold mb-2">Flaws</h3>
                  <ul className="space-y-1 text-sm">{stats.personality.flaws.map((t: string, i: number) => <li key={i}>• {t}</li>)}</ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Bottom CTA for non-logged-in users */}
        {!user && (
          <div className="bg-gradient-card rounded-2xl border border-gold/30 p-8 text-center mb-10">
            <Sparkles className="h-12 w-12 text-gold mx-auto mb-4" />
            <h2 className="font-display text-3xl font-bold mb-2">Ready to Play?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create a free account to save {character.character_name}, download the printable character sheet, and build your entire party.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/signup"><Button variant="gold" size="lg">Create Free Account</Button></Link>
              <Link to={`/character/${character.id}`}><Button variant="outline" size="lg">View Full Sheet</Button></Link>
            </div>
          </div>
        )}

        {/* Hidden full character sheet for PDF generation */}
        <div className="sr-only" id="character-sheet-wrapper">
          <CharacterSheet character={character} forPrint={true} />
        </div>

      </div>
    </Layout>
  );
}
