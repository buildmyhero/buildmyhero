import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserCharacters } from "@/hooks/useCharacter";
import { usePdfGeneration } from "@/hooks/usePdfGeneration";
import { usePlayGuidePdf } from "@/hooks/usePlayGuidePdf";
import { PortraitWithSkeleton } from "@/components/character/PortraitWithSkeleton";
import { Character } from "@/types/character";
import {
  Plus, Loader2, Library, Heart, Shield, Zap,
  BookOpen, Printer, Download, Eye, Trash2, Sparkles, Swords
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

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: characters, isLoading, error, refetch } = useUserCharacters();
  const { generatePdf } = usePdfGeneration();
  const { generatePlayGuidePdf } = usePlayGuidePdf();
  const [actionLoading, setActionLoading] = useState<{ id: string; type: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const featured = characters?.[0] ?? null;
  const rest = characters?.slice(1) ?? [];
  const total = characters?.length ?? 0;
  const rulesets = [...new Set(characters?.map(c => c.ruleset) ?? [])];

  const handleSheet = async (c: Character) => {
    setActionLoading({ id: c.id, type: 'sheet' });
    await generatePdf(c);
    setActionLoading(null);
  };

  const handlePlayGuide = async (c: Character) => {
    if (!c.play_guide_content) return;
    setActionLoading({ id: c.id, type: 'guide' });
    await generatePlayGuidePdf({
      characterName: c.character_name,
      characterClass: c.character_class,
      race: c.race,
      level: c.level,
      playGuideContent: c.play_guide_content,
    });
    setActionLoading(null);
  };

  const handlePrint = () => window.print();

  const handleDelete = async (c: Character) => {
    try {
      const { error } = await supabase.from('characters').delete().eq('id', c.id);
      if (error) throw error;
      toast.success(`${c.character_name} deleted`);
      refetch?.();
    } catch {
      toast.error('Failed to delete character');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* ── TOP BAR ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">My Characters</h1>
            {total > 0 && (
              <p className="text-muted-foreground mt-1 text-sm">
                {total} character{total !== 1 ? 's' : ''}
                {rulesets.length > 0 && ` · ${rulesets.join(', ')}`}
              </p>
            )}
          </div>
          <Link to="/">
            <Button variant="gold" size="lg" className="gap-2 shadow-lg">
              <Plus className="h-5 w-5" />
              Create New Character
            </Button>
          </Link>
        </div>

        {/* ── EMPTY STATE ─────────────────────────────── */}
        {!error && total === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <Library className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
            <h2 className="font-display text-2xl font-semibold mb-3">Your party awaits</h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              You haven't created any characters yet. Describe your concept and we'll build the rest.
            </p>
            <Link to="/">
              <Button variant="gold" size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Generate Your First Character
              </Button>
            </Link>
          </div>
        )}

        {total > 0 && (
          <>
            {/* ── FEATURED CHARACTER ──────────────────── */}
            {featured && (
              <section className="mb-10 animate-fade-in">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Most Recent</p>
                <div className="bg-gradient-card rounded-2xl border border-border/50 overflow-hidden shadow-card">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-0">

                    {/* Portrait */}
                    <div className="relative md:aspect-auto aspect-square overflow-hidden min-h-[240px]">
                      <PortraitWithSkeleton
                        portraitUrl={featured.portrait_url}
                        characterName={featured.character_name}
                        characterId={featured.id}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/80 hidden md:block" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent md:hidden" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 text-xs font-medium bg-primary/80 text-primary-foreground rounded">
                          D&D {featured.ruleset}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="md:col-span-2 p-6 flex flex-col justify-between">
                      <div>
                        <h2 className="font-display text-3xl font-bold mb-1">{featured.character_name}</h2>
                        <p className="text-muted-foreground mb-4">
                          Level {featured.level} {featured.race} {featured.character_class}
                          {(featured.character_data as any)?.subclass && ` — ${(featured.character_data as any).subclass}`}
                        </p>

                        {/* Stats row */}
                        <div className="flex gap-4 mb-4">
                          {[
                            { icon: Heart, value: (featured.character_data as any)?.hitPoints?.maximum, label: 'HP', color: 'text-destructive' },
                            { icon: Shield, value: (featured.character_data as any)?.armorClass, label: 'AC', color: 'text-primary' },
                            { icon: Zap, value: `+${(featured.character_data as any)?.proficiencyBonus ?? 2}`, label: 'Prof', color: 'text-gold' },
                            { icon: Swords, value: `${(featured.character_data as any)?.speed ?? 30}ft`, label: 'Speed', color: 'text-muted-foreground' },
                          ].map(({ icon: Icon, value, label, color }) => (
                            <div key={label} className="bg-muted/40 rounded-lg px-3 py-2 text-center min-w-[56px]">
                              <Icon className={`h-4 w-4 ${color} mx-auto mb-0.5`} />
                              <p className="text-sm font-bold">{value ?? '—'}</p>
                              <p className="text-xs text-muted-foreground">{label}</p>
                            </div>
                          ))}
                        </div>

                        {featured.concept && (
                          <p className="text-sm text-muted-foreground italic line-clamp-2">
                            "{featured.concept}"
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-border/30">
                        <Link to={`/character/${featured.id}`}>
                          <Button variant="gold" size="sm" className="gap-1.5">
                            <Eye className="h-4 w-4" />View Sheet
                          </Button>
                        </Link>
                        {featured.play_guide_content && (
                          <Button
                            variant="outline" size="sm" className="gap-1.5"
                            onClick={() => handlePlayGuide(featured)}
                            disabled={actionLoading?.id === featured.id && actionLoading.type === 'guide'}
                          >
                            {actionLoading?.id === featured.id && actionLoading.type === 'guide'
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <BookOpen className="h-4 w-4" />}
                            Play Guide
                          </Button>
                        )}
                        <Button
                          variant="outline" size="sm" className="gap-1.5"
                          onClick={() => handleSheet(featured)}
                          disabled={actionLoading?.id === featured.id && actionLoading.type === 'sheet'}
                        >
                          {actionLoading?.id === featured.id && actionLoading.type === 'sheet'
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Download className="h-4 w-4" />}
                          Download PDF
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1.5" onClick={handlePrint}>
                          <Printer className="h-4 w-4" />Print
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ── CHARACTER LIST ──────────────────────── */}
            {rest.length > 0 && (
              <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">All Characters</p>
                <div className="bg-gradient-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/40">
                  {rest.map((c) => (
                    <CharacterRow
                      key={c.id}
                      character={c}
                      actionLoading={actionLoading}
                      onSheet={() => handleSheet(c)}
                      onPlayGuide={() => handlePlayGuide(c)}
                      onPrint={handlePrint}
                      onDelete={() => handleDelete(c)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* If there's only one character, show it as featured only — no list needed */}
          </>
        )}
      </div>
    </Layout>
  );
}

// ── Character Row Component ──────────────────────────────────────────────────
interface RowProps {
  character: Character;
  actionLoading: { id: string; type: string } | null;
  onSheet: () => void;
  onPlayGuide: () => void;
  onPrint: () => void;
  onDelete: () => void;
}

function CharacterRow({ character: c, actionLoading, onSheet, onPlayGuide, onPrint, onDelete }: RowProps) {
  const stats = c.character_data as any;
  const isLoading = (type: string) => actionLoading?.id === c.id && actionLoading.type === type;

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors group">
      {/* Thumbnail */}
      <Link to={`/character/${c.id}`} className="flex-shrink-0">
        <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/50">
          <PortraitWithSkeleton
            portraitUrl={c.portrait_url}
            characterName={c.character_name}
            characterId={c.id}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Name + class */}
      <Link to={`/character/${c.id}`} className="flex-1 min-w-0">
        <p className="font-semibold truncate group-hover:text-primary transition-colors">
          {c.character_name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          Lv{c.level} {c.race} {c.character_class}
          {stats?.subclass && ` — ${stats.subclass}`}
        </p>
      </Link>

      {/* Quick stats — hidden on small screens */}
      <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
        <span className="flex items-center gap-1">
          <Heart className="h-3 w-3 text-destructive" />{stats?.hitPoints?.maximum ?? '—'}
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-primary" />{stats?.armorClass ?? '—'}
        </span>
        <span className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-gold" />+{stats?.proficiencyBonus ?? 2}
        </span>
        <span className="px-1.5 py-0.5 bg-muted/50 rounded text-muted-foreground">
          {c.ruleset}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link to={`/character/${c.id}`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Sheet">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>

        {c.play_guide_content && (
          <Button
            variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download Play Guide"
            onClick={onPlayGuide} disabled={isLoading('guide')}
          >
            {isLoading('guide') ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />}
          </Button>
        )}

        <Button
          variant="ghost" size="sm" className="h-8 w-8 p-0" title="Download Character Sheet"
          onClick={onSheet} disabled={isLoading('sheet')}
        >
          {isLoading('sheet') ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        </Button>

        <Button
          variant="ghost" size="sm" className="h-8 w-8 p-0" title="Print"
          onClick={onPrint}
        >
          <Printer className="h-4 w-4" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost" size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {c.character_name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone. All character data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
