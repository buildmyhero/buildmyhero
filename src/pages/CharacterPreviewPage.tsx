import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { useCharacterRealtime } from "@/hooks/useCharacter";
import { usePdfGeneration } from "@/hooks/usePdfGeneration";
import { useSendCharacterEmail } from "@/hooks/useSendCharacterEmail";
import { PortraitWithSkeleton } from "@/components/character/PortraitWithSkeleton";
import { GenerationProgress } from "@/components/character/GenerationProgress";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import {
  Shield, Heart, Zap, Sparkles, ArrowRight,
  Loader2, Download, Mail, AlertTriangle, BookOpen, Swords, Star
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

export default function CharacterPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: character, isLoading, error } = useCharacterRealtime(id);
  const { isGenerating: isPdfGenerating, generatePdf } = usePdfGeneration();
  const { isSending: isEmailSending, sendEmail } = useSendCharacterEmail();
  const [guestEmail, setGuestEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

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

  // Pull a few highlight features to tease
  const highlightFeatures = stats.features?.slice(0, 3) || [];

  // Parse play guide into sections — grab just Combat Tactics snippet
  const playGuide = character.play_guide_content || '';
  const combatSection = playGuide.split('## ')[1] || '';
  const combatSnippet = combatSection.split('\n').filter((l: string) => l.startsWith('-')).slice(0, 3).join('\n');

  const handleDownloadPdf = async () => {
    if (!user) { navigate("/signup"); return; }
    await generatePdf(character);
  };

  const handleSendGuestEmail = async () => {
    if (guestEmail && id) {
      const success = await sendEmail(id, guestEmail);
      if (success) setEmailSent(true);
    }
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
                {!emailSent ? (
                  <div className="bg-gradient-card rounded-xl border border-border/50 p-5">
                    <h3 className="font-display text-base font-semibold mb-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gold" />Email it to yourself
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">No account required</p>
                    <div className="flex gap-2">
                      <Input type="email" placeholder="your@email.com" value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)} className="flex-1 h-9" />
                      <Button variant="gold" size="sm" onClick={handleSendGuestEmail} disabled={isEmailSending || !guestEmail}>
                        {isEmailSending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                    <p className="text-green-400 font-medium text-sm">✓ Check your inbox!</p>
                  </div>
                )}
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
                + {stats.features.length - 3} more abilities — <Link to={`/character/${character.id}`} className="text-primary hover:underline">see full sheet →</Link>
              </p>
            )}
          </section>
        )}

        {/* How to Play Teaser */}
        {combatSnippet && (
          <section className="mb-10 animate-fade-in">
            <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />How to Play This Character
            </h2>
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-semibold text-gold mb-3">⚔️ Combat Strategy</h3>
              <ul className="space-y-2">
                {combatSnippet.split('\n').map((tip: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">›</span>
                    <span>{tip.replace(/^-\s*/, '')}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 pt-4 border-t border-border/30">
                {user ? (
                  <Link to={`/character/${character.id}`}>
                    <Button variant="outline" size="sm">
                      <BookOpen className="mr-2 h-4 w-4" />Read Full Play Guide
                    </Button>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Full play guide included with free account</p>
                    <Link to={`/character/${character.id}`}>
                      <Button variant="gold" size="sm">Unlock Full Guide</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
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
