import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useCharacter } from "@/hooks/useCharacter";
import { usePdfGeneration } from "@/hooks/usePdfGeneration";
import { CharacterSheet } from "@/components/character/CharacterSheet";
import { PortraitWithSkeleton } from "@/components/character/PortraitWithSkeleton";
import { 
  Shield, Heart, Zap, Download, Printer, Trash2, 
  Sparkles, Sword, BookOpen, User, Scroll, ArrowLeft, Loader2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function CharacterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: character, isLoading, error } = useCharacter(id);
  const { isGenerating: isPdfGenerating, generatePdf } = usePdfGeneration();

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading character sheet...</p>
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

  const stats = character.character_data;
  const isOwner = user && character.user_id === user.id;
  const canDownload = !!user;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!user) {
      toast.error("Please sign in to download PDFs");
      navigate("/signup");
      return;
    }
    await generatePdf(character);
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', character.id);

      if (error) throw error;

      toast.success("Character deleted");
      navigate("/library");
    } catch (err) {
      console.error('Delete error:', err);
      toast.error("Failed to delete character");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Link */}
        <Link 
          to={user ? "/library" : "/"} 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {user ? "Back to Library" : "Back to Home"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Portrait & Actions */}
          <div className="space-y-6">
            {/* Portrait */}
            <div className="relative overflow-hidden rounded-2xl border border-border/50 shadow-card">
              <PortraitWithSkeleton
                portraitUrl={character.portrait_url}
                characterName={character.character_name}
                characterId={character.id}
                className="w-full aspect-square"
              />
            </div>

            {/* Character Info */}
            <div className="parchment-texture rounded-xl p-6 text-parchment-foreground">
              <h1 className="font-display text-2xl font-bold mb-1">
                {character.character_name}
              </h1>
              <p className="text-sm opacity-80 mb-4">
                Level {character.level} {character.race} {character.character_class}
              </p>
              
              <p className="text-sm italic border-t border-parchment-foreground/20 pt-4">
                "{character.concept}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                variant="gold" 
                className="w-full" 
                onClick={handleDownloadPDF}
                disabled={!canDownload || isPdfGenerating}
              >
                {isPdfGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Character Sheet PDF
                  </>
                )}
              </Button>
              
              <Button 
                variant="purple" 
                className="w-full" 
                onClick={handleDownloadPDF}
                disabled={!canDownload}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Download Play Guide PDF
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handlePrint}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Character Sheet
              </Button>

              {isOwner && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Character
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete {character.character_name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your 
                        character and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}

              {!user && (
                <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign up to download PDFs and save this character
                  </p>
                  <Link to="/signup">
                    <Button variant="gold" size="sm">
                      Create Free Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Middle & Right Columns - Character Sheet */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Stats */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Heart className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.hitPoints?.maximum || '—'}</p>
                <p className="text-xs text-muted-foreground">HP</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.armorClass || '—'}</p>
                <p className="text-xs text-muted-foreground">AC</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Zap className="h-5 w-5 text-gold mx-auto mb-1" />
                <p className="text-xl font-bold">+{stats.proficiencyBonus || 2}</p>
                <p className="text-xs text-muted-foreground">Prof</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Sword className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.initiative !== undefined ? (stats.initiative >= 0 ? '+' : '') + stats.initiative : '—'}</p>
                <p className="text-xs text-muted-foreground">Init</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <User className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.speed || 30}</p>
                <p className="text-xs text-muted-foreground">Speed</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Scroll className="h-5 w-5 text-gold mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.hitDice?.total || character.level}{stats.hitDice?.type || 'd8'}</p>
                <p className="text-xs text-muted-foreground">HD</p>
              </div>
            </div>

            {/* Ability Scores */}
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Ability Scores</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {stats.abilityScores && Object.entries(stats.abilityScores).map(([ability, score]) => {
                  const modifier = stats.abilityModifiers?.[ability as keyof typeof stats.abilityModifiers] || 0;
                  return (
                    <div key={ability} className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs uppercase text-muted-foreground font-medium">
                        {ability}
                      </p>
                      <p className="text-2xl font-bold">{score}</p>
                      <p className="text-sm text-muted-foreground">
                        {modifier >= 0 ? '+' : ''}{modifier}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saving Throws & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Saving Throws */}
              <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Saving Throws</h3>
                <div className="space-y-2">
                  {stats.savingThrows && Object.entries(stats.savingThrows).map(([ability, save]) => (
                    <div key={ability} className="flex justify-between items-center text-sm">
                      <span className="capitalize flex items-center gap-2">
                        {save.proficient && <span className="w-2 h-2 rounded-full bg-gold" />}
                        {ability}
                      </span>
                      <span className="font-mono">
                        {save.bonus >= 0 ? '+' : ''}{save.bonus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Skills</h3>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {stats.skills && stats.skills.map((skill, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        {skill.proficient && <span className="w-2 h-2 rounded-full bg-gold" />}
                        {skill.expertise && <span className="w-2 h-2 rounded-full bg-primary" />}
                        {skill.name}
                      </span>
                      <span className="font-mono">
                        {skill.bonus >= 0 ? '+' : ''}{skill.bonus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features & Traits */}
            {stats.features && stats.features.length > 0 && (
              <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Features & Traits</h3>
                <div className="space-y-4">
                  {stats.features.map((feature, index) => (
                    <div key={index} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-gold" />
                        <h4 className="font-semibold">{feature.name}</h4>
                        {feature.source && (
                          <span className="text-xs text-muted-foreground">({feature.source})</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spellcasting */}
            {stats.spellcasting && (
              <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Spellcasting</h3>
                
                {/* Spell Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Spell Save DC</p>
                    <p className="text-xl font-bold">{stats.spellcasting.spellSaveDC}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Spell Attack</p>
                    <p className="text-xl font-bold">+{stats.spellcasting.spellAttackBonus}</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Ability</p>
                    <p className="text-xl font-bold capitalize">{String(stats.spellcasting.ability).slice(0, 3)}</p>
                  </div>
                </div>

                {/* Spell Slots */}
                {stats.spellcasting.spellSlots && stats.spellcasting.spellSlots.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium mb-2">Spell Slots</h4>
                    <div className="flex gap-2 flex-wrap">
                      {stats.spellcasting.spellSlots.map((slot) => (
                        <div key={slot.level} className="text-center p-2 bg-muted/50 rounded-lg min-w-[60px]">
                          <p className="text-xs text-muted-foreground">Level {slot.level}</p>
                          <p className="font-bold">{slot.total - slot.used}/{slot.total}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spells List */}
                {stats.spellcasting.spells && stats.spellcasting.spells.length > 0 && (
                  <div className="space-y-3">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                      const spellsAtLevel = stats.spellcasting!.spells.filter(s => s.level === level);
                      if (spellsAtLevel.length === 0) return null;
                      
                      return (
                        <div key={level}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            {level === 0 ? "Cantrips" : `Level ${level}`}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {spellsAtLevel.map((spell, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 text-xs bg-primary/20 text-primary-foreground rounded-md"
                              >
                                {spell.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Equipment */}
            {stats.equipment && stats.equipment.length > 0 && (
              <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Equipment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {stats.equipment.map((item, index) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded"
                    >
                      <span>{item.name}</span>
                      {item.quantity > 1 && (
                        <span className="text-muted-foreground">x{item.quantity}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personality */}
            {stats.personality && (
              <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Personality</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.personality.traits && stats.personality.traits.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Traits</h4>
                      {stats.personality.traits.map((trait, i) => (
                        <p key={i} className="text-sm mb-1">• {trait}</p>
                      ))}
                    </div>
                  )}
                  {stats.personality.ideals && stats.personality.ideals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Ideals</h4>
                      {stats.personality.ideals.map((ideal, i) => (
                        <p key={i} className="text-sm mb-1">• {ideal}</p>
                      ))}
                    </div>
                  )}
                  {stats.personality.bonds && stats.personality.bonds.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Bonds</h4>
                      {stats.personality.bonds.map((bond, i) => (
                        <p key={i} className="text-sm mb-1">• {bond}</p>
                      ))}
                    </div>
                  )}
                  {stats.personality.flaws && stats.personality.flaws.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Flaws</h4>
                      {stats.personality.flaws.map((flaw, i) => (
                        <p key={i} className="text-sm mb-1">• {flaw}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Backstory */}
            {stats.backstory && (
              <div className="parchment-texture rounded-xl p-6 text-parchment-foreground">
                <h3 className="font-display text-lg font-semibold mb-4">Backstory</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line">{stats.backstory}</p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden CharacterSheet for PDF generation */}
        <div className="hidden print:block mt-8">
          <CharacterSheet character={character} forPrint />
        </div>
      </div>
    </Layout>
  );
}
