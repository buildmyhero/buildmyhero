import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Home, Wand2 } from "lucide-react";

const NotFound = () => {
  return (
    <Layout showFooter={false}>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative mb-8">
            <h1 className="font-display text-9xl font-bold text-muted-foreground/20">
              404
            </h1>
            <p className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-gradient-hero">
              Quest Not Found
            </p>
          </div>
          
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            The path you seek does not exist in this realm. 
            Perhaps the dungeon has collapsed, or the portal has closed.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button variant="gold" size="lg">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg">
                <Wand2 className="mr-2 h-4 w-4" />
                Create a Character
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
