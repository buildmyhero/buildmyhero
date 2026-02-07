import { Link } from "react-router-dom";
import { Wand2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-gold" />
            <span className="font-display text-lg text-gradient-gold">BuildMyHero</span>
          </div>
          
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
          </nav>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BuildMyHero
          </p>
        </div>
      </div>
    </footer>
  );
}
