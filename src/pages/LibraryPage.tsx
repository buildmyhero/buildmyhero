import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/character/CharacterCard";
import { useAuth } from "@/hooks/useAuth";
import { placeholderCharacter } from "@/data/placeholder-character";
import { Wand2, Library as LibraryIcon, Loader2 } from "lucide-react";
import { Character } from "@/types/character";

// Mock data for the library
const mockCharacters: Character[] = [
  {
    ...placeholderCharacter,
    id: "saved-1",
    character_name: "Agatha Mosswhisper",
    user_id: "user-1",
    is_guest: false,
  },
];

export default function LibraryPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const characters = mockCharacters; // Will be replaced with actual data
  const hasCharacters = characters.length > 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              <span className="text-gradient-hero">My Characters</span>
            </h1>
            <p className="text-muted-foreground">
              Your collection of heroes and adventurers
            </p>
          </div>
          
          <Link to="/">
            <Button variant="gold" size="lg">
              <Wand2 className="mr-2 h-5 w-5" />
              Generate New Character
            </Button>
          </Link>
        </div>

        {hasCharacters ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-card border border-border/50 flex items-center justify-center mb-6">
              <LibraryIcon className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-2">
              No Characters Yet
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your library is empty. Generate your first character and watch it 
              appear here with its portrait, stats, and everything you need to play.
            </p>
            <Link to="/">
              <Button variant="hero" size="xl">
                <Wand2 className="mr-2 h-5 w-5" />
                Generate Your First Character
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}
