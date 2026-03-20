import { useState } from 'react';
import { toast } from 'sonner';
import { CharacterData } from '@/types/character';

interface Character {
  id: string;
  character_name: string;
  character_class: string;
  level: number;
  race: string;
  ruleset: string;
  character_data: CharacterData;
  portrait_url: string | null;
  play_guide_content?: string | null;
}

export function usePdfGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async (character: Character): Promise<void> => {
    setIsGenerating(true);
    try {
      // Use browser print dialog — renders the #character-sheet element
      // via the print-specific CSS rules in index.css.
      // This gives a clean 1-2 page A4/Letter output.
      window.print();
      toast.success('Print dialog opened — save as PDF to download.');
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Could not open print dialog. Please use Ctrl/Cmd+P.');
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generatePdf };
}
