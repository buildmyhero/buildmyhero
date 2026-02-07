import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { placeholderCharacter } from "@/data/placeholder-character";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, Heart, Zap, Download, Printer, Trash2, 
  Sparkles, Sword, BookOpen, User, Scroll, ArrowLeft
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

export default function CharacterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const character = placeholderCharacter; // Using placeholder for now
  const stats = character.character_data;

  const isOwner = user && character.user_id === user.id;
  const canDownload = !!user;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!user) {
      toast.error("Please sign in to download PDFs");
      navigate("/signup");
      return;
    }
    toast.info("PDF generation coming soon!");
  };

  const handleDelete = () => {
    toast.success("Character deleted");
    navigate("/library");
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
                disabled={!canDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Character Sheet PDF
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
                <p className="text-xl font-bold">{stats.hitPoints.maximum}</p>
                <p className="text-xs text-muted-foreground">HP</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Shield className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.armorClass}</p>
                <p className="text-xs text-muted-foreground">AC</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Zap className="h-5 w-5 text-gold mx-auto mb-1" />
                <p className="text-xl font-bold">+{stats.proficiencyBonus}</p>
                <p className="text-xs text-muted-foreground">Prof</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Sword className="h-5 w-5 text-destructive mx-auto mb-1" />
                <p className="text-xl font-bold">+{stats.initiative}</p>
                <p className="text-xs text-muted-foreground">Init</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <User className="h-5 w-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.speed}</p>
                <p className="text-xs text-muted-foreground">Speed</p>
              </div>
              <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <Scroll className="h-5 w-5 text-gold mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.hitDice.total}{stats.hitDice.type}</p>
                <p className="text-xs text-muted-foreground">HD</p>
              </div>
            </div>

            {/* Ability Scores */}
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Ability Scores</h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                {Object.entries(stats.abilityScores).map(([ability, score]) => {
                  const modifier = stats.abilityModifiers[ability as keyof typeof stats.abilityModifiers];
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
                  {Object.entries(stats.savingThrows).map(([ability, save]) => (
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
                  {stats.skills.map((skill) => (
                    <div key={skill.name} className="flex justify-between items-center text-sm">
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
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Features & Traits</h3>
              <div className="space-y-4">
                {stats.features.map((feature) => (
                  <div key={feature.name} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-gold" />
                      <h4 className="font-semibold">{feature.name}</h4>
                      <span className="text-xs text-muted-foreground">({feature.source})</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

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
                    <p className="text-xl font-bold capitalize">{stats.spellcasting.ability.slice(0, 3)}</p>
                  </div>
                </div>

                {/* Spell Slots */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Spell Slots</h4>
                  <div className="flex gap-2">
                    {stats.spellcasting.spellSlots.map((slot) => (
                      <div key={slot.level} className="text-center p-2 bg-muted/50 rounded-lg flex-1">
                        <p className="text-xs text-muted-foreground">Level {slot.level}</p>
                        <p className="font-bold">{slot.total - slot.used}/{slot.total}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Spells List */}
                <div className="space-y-3">
                  {[0, 1, 2].map((level) => {
                    const spellsAtLevel = stats.spellcasting!.spells.filter(s => s.level === level);
                    if (spellsAtLevel.length === 0) return null;
                    
                    return (
                      <div key={level}>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                          {level === 0 ? "Cantrips" : `Level ${level}`}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {spellsAtLevel.map((spell) => (
                            <span 
                              key={spell.name}
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
              </div>
            )}

            {/* Equipment */}
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {stats.equipment.map((item) => (
                  <div 
                    key={item.name} 
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

            {/* Personality */}
            <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Personality</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Traits</h4>
                  {stats.personality.traits.map((trait, i) => (
                    <p key={i} className="text-sm mb-1">• {trait}</p>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Ideals</h4>
                  {stats.personality.ideals.map((ideal, i) => (
                    <p key={i} className="text-sm mb-1">• {ideal}</p>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Bonds</h4>
                  {stats.personality.bonds.map((bond, i) => (
                    <p key={i} className="text-sm mb-1">• {bond}</p>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Flaws</h4>
                  {stats.personality.flaws.map((flaw, i) => (
                    <p key={i} className="text-sm mb-1">• {flaw}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Backstory */}
            <div className="parchment-texture rounded-xl p-6 text-parchment-foreground">
              <h3 className="font-display text-lg font-semibold mb-4">Backstory</h3>
              <p className="text-sm leading-relaxed">{stats.backstory}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
