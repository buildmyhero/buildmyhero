import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CharacterCard } from "@/components/character/CharacterCard";
import { useAuth } from "@/hooks/useAuth";
import { useUserCharacters } from "@/hooks/useCharacter";
import { Plus, Loader2, Library } from "lucide-react";

export default function LibraryPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: characters, isLoading, error } = useUserCharacters();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

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
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
