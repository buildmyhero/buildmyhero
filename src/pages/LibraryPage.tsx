import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/character/CharacterCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserCharacters } from "@/hooks/useCharacter";
import { usePdfGeneration } from "@/hooks/usePdfGeneration";
import { usePlayGuidePdf } from "@/hooks/usePlayGuidePdf";
import { Plus, Loader2, Library } from "lucide-react";
import { Character } from "@/types/character";

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: characters, isLoading, error } = useUserCharacters();
  const { isGenerating: isSheetGenerating, generatePdf } = usePdfGeneration();
  const { isGenerating: isPlayGuideGenerating, generatePlayGuidePdf } = usePlayGuidePdf();
  const [downloadingSheetId, setDownloadingSheetId] = useState<string | null>(null);
  const [downloadingPlayGuideId, setDownloadingPlayGuideId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const handleDownloadSheet = async (character: Character) => {
    setDownloadingSheetId(character.id);
    await generatePdf(character);
    setDownloadingSheetId(null);
  };

  const handleDownloadPlayGuide = async (character: Character) => {
    if (!character.play_guide_content) return;
    
    setDownloadingPlayGuideId(character.id);
    await generatePlayGuidePdf({
      characterName: character.character_name,
      characterClass: character.character_class,
      race: character.race,
      level: character.level,
      playGuideContent: character.play_guide_content,
    });
    setDownloadingPlayGuideId(null);
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading your library...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              My Characters
            </h1>
            <p className="text-muted-foreground mt-1">
              {characters?.length || 0} character{characters?.length !== 1 ? 's' : ''} in your library
            </p>
          </div>
          
          <Link to="/">
            <Button variant="gold" size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Create New Character
            </Button>
          </Link>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load characters</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        )}

        {!error && characters && characters.length === 0 && (
          <div className="text-center py-16">
            <Library className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-semibold mb-2">
              No Characters Yet
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your character library is empty. Create your first character and 
              start building your adventuring party!
            </p>
            <Link to="/">
              <Button variant="gold" size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Generate Your First Character
              </Button>
            </Link>
          </div>
        )}

        {characters && characters.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard 
                key={character.id} 
                character={character}
                showDownload={true}
                onDownloadSheet={() => handleDownloadSheet(character)}
                onDownloadPlayGuide={() => handleDownloadPlayGuide(character)}
                isDownloadingSheet={downloadingSheetId === character.id}
                isDownloadingPlayGuide={downloadingPlayGuideId === character.id}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
