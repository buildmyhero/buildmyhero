import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Ruleset } from '@/types/character';

interface GenerationState {
  isGenerating: boolean;
  error: string | null;
}

export function useCharacterGeneration() {
  const navigate = useNavigate();
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
  });

  const generateCharacter = async (concept: string, level: number, ruleset: Ruleset) => {
    if (!concept.trim()) {
      toast.error('Please describe your character concept');
      return;
    }

    setState({ isGenerating: true, error: null });

    try {
      // Include the user's session token so the edge function can assign user_id
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('generate-character', {
        body: { concept, level, ruleset },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });

      if (error) {
        console.error('Generation error:', error);
        toast.error(error.message || 'Failed to generate character');
        setState({ isGenerating: false, error: error.message });
        return;
      }

      if (data?.error) {
        console.error('API error:', data.error);
        toast.error(data.error);
        setState({ isGenerating: false, error: data.error });
        return;
      }

      if (data?.success && data?.character) {
        toast.success(`${data.character.character_name} has been created!`);
        setState({ isGenerating: false, error: null });
        navigate(`/character/${data.character.id}/preview`);
      } else {
        toast.error('Unexpected response from server');
        setState({ isGenerating: false, error: 'Unexpected response' });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      toast.error(message);
      setState({ isGenerating: false, error: message });
    }
  };

  return {
    ...state,
    generateCharacter,
  };
}
