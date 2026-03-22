import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Character } from '@/types/character';

export function useLevelingGuide() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateLevelingGuide = async (character: Character): Promise<string | null> => {
    // Return cached version if already generated
    if (character.leveling_guide_content) {
      return character.leveling_guide_content;
    }

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('generate-leveling-guide', {
        body: { characterId: character.id },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });

      if (error) {
        console.error('Leveling guide error:', error);
        toast.error('Failed to generate leveling guide. Please try again.');
        return null;
      }

      if (data?.error) {
        toast.error(data.error);
        return null;
      }

      toast.success(`Leveling guide for ${character.character_name} is ready!`);
      return data?.content ?? null;

    } catch (err) {
      console.error('Leveling guide error:', err);
      toast.error('Failed to generate leveling guide.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generateLevelingGuide };
}
