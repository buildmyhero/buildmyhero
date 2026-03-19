import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import { useCharacterRealtime } from "@/hooks/useCharacter";
import { usePdfGeneration } from "@/hooks/usePdfGeneration";
import { usePlayGuidePdf } from "@/hooks/usePlayGuidePdf";
import { useSendCharacterEmail } from "@/hooks/useSendCharacterEmail";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { PortraitWithSkeleton } from "@/components/character/PortraitWithSkeleton";
import { GenerationProgress } from "@/components/character/GenerationProgress";
import { Shield, Heart, Zap, Eye, Sparkles, ArrowRight, Loader2, Download, BookOpen, Mail } from "lucide-react";

export default function CharacterPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: character, isLoading, error } = useCharacterRealtime(id);
  const { isGenerating: isPdfGenerating, generatePdf } = usePdfGeneration();
  const { isGenerating: isPlayGuidePdfGenerating, generatePlayGuidePdf } = usePlayGuidePdf();
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
            <p className="text-muted-foreground mb-6">
              This character doesn't exist or has been deleted.
            </p>
            <Link to="/">
              <Button variant="gold">Create a New Character</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  // Show generation progress if still generating
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

  const stats = (character.character_data && typeof character.character_data === 'object' && Object.keys(character.character_data as any).length > 0) 
    ? (character.character_data as any)
    : null;

  if (!stats) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Character data is still loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleDownloadPdf = async () => {
    if (!user) {
      navigate("/signup");
      return;
    }
    await generatePdf(character);
  };

  const handleDownloadPlayGuide = async () => {
    if (!user) {
      navigate("/signup");
      return;
    }
    if (character.play_guide_content) {
      await generatePlayGuidePdf({
        characterName: character.character_name,
        characterClass: character.character_class,
        race: character.race,
        level: character.level,
        playGuideContent: character.play_guide_content,
      });
    }
  };

  const handleSendGuestEmail = async () => {
    if (guestEmail && id) {
      const success = await sendEmail(id, guestEmail);
      if (success) {
        setEmailSent(true);
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Character Info */}
          <div className="space-y-6 animate-fade-in">
            {/* Portrait */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-card">
              <PortraitWithSkeleton
                portraitUrl={character.portrait_url}
                characterName={character.character_name}
                characterId={character.id}
                className="w-full aspect-square"
              />
              
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
                <p className="text-2xl font-bold">{stats.hitPoints?.maximum || '—'}</p>
                <p className="text-xs text-muted-foreground">Hit Points</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.armorClass || '—'}</p>
                <p className="text-xs text-muted-foreground">Armor Class</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Zap className="h-6 w-6 text-gold mx-auto mb-2" />
                <p className="text-2xl font-bold">+{stats.proficiencyBonus || 2}</p>
                <p className="text-xs text-muted-foreground">Proficiency</p>
              </div>
            </div>

            {/* Ability Scores Preview */}
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Ability Scores</h3>
              <div className="grid grid-cols-6 gap-2 text-center">
                {stats.abilityScores && Object.entries(stats.abilityScores).map(([ability, score]) => {
                  const modifier = stats.abilityModifiers?.[ability as keyof typeof stats.abilityModifiers] || 0;
                  return (
                    <div key={ability} className="space-y-1">
                      <p className="text-xs uppercase text-muted-foreground">
                        {ability.slice(0, 3)}
                      </p>
                      <p className="text-xl font-bold">{score}</p>
                      <p className="text-xs text-muted-foreground">
                        ({modifier >= 0 ? '+' : ''}{modifier})
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Features Preview */}
            {stats.features && stats.features.length > 0 && (
              <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Features</h3>
                <ul className="space-y-2">
                  {stats.features.slice(0, 3).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
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
                {stats.features.length > 3 && (
                  <Link 
                    to={`/character/${character.id}`}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-4"
                  >
                    <Eye className="h-4 w-4" />
                    View all {stats.features.length} features
                  </Link>
                )}
              </div>
            )}

            {/* Concept */}
            <div className="parchment-texture rounded-xl p-6 text-parchment-foreground">
              <h3 className="font-display text-lg font-semibold mb-2">Original Concept</h3>
              <p className="text-sm italic">"{character.concept}"</p>
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
                  <Button 
                    variant="purple" 
                    className="w-full" 
                    size="lg"
                    onClick={handleDownloadPdf}
                    disabled={isPdfGenerating}
                  >
                    {isPdfGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Character Sheet
                      </>
                    )}
                  </Button>
                  {character.play_guide_content && (
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      size="lg"
                      onClick={handleDownloadPlayGuide}
                      disabled={isPlayGuidePdfGenerating}
                    >
                      {isPlayGuidePdfGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating PDF...
                        </>
                      ) : (
                        <>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Download Play Guide
                        </>
                      )}
                    </Button>
                  )}
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
              <div className="sticky top-24 space-y-6">
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
                
                {/* Guest Email Capture */}
                {!emailSent ? (
                  <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
                    <h3 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-gold" />
                      Get it emailed to you
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Enter your email to receive this character sheet (no account required)
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="gold"
                        onClick={handleSendGuestEmail}
                        disabled={isEmailSending || !guestEmail}
                      >
                        {isEmailSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Send'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
                    <p className="text-green-400 font-medium">
                      ✓ Character emailed! Check your inbox.
                    </p>
                  </div>
                )}
                
                <div className="text-center">
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

        {/* Full Character Sheet (hidden, used for PDF generation) */}
        <div className="mt-12 print:mt-0" id="character-sheet-wrapper">
          <CharacterSheet character={character} />
        </div>
      </div>
    </Layout>
  );
}
