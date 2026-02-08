import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Character, CharacterData, GenerationStatus } from '@/types/character';

// Transform database row to Character type
function transformCharacter(row: any): Character {
  return {
    id: row.id,
    user_id: row.user_id,
    character_name: row.character_name,
    character_class: row.character_class,
    level: row.level,
    race: row.race,
    ruleset: row.ruleset as '2014' | '2024',
    concept: row.concept,
    character_data: row.character_data as CharacterData,
    portrait_url: row.portrait_url,
    character_sheet_pdf_url: row.character_sheet_pdf_url,
    play_guide_pdf_url: row.play_guide_pdf_url,
    play_guide_content: row.play_guide_content,
    is_guest: row.is_guest,
    created_at: row.created_at,
    updated_at: row.updated_at,
    status: row.status as GenerationStatus || 'complete',
    generation_progress: row.generation_progress ?? 100,
    email_sent: row.email_sent ?? false,
    email_requested: row.email_requested ?? false,
  };
}

export function useCharacter(id: string | undefined) {
  return useQuery({
    queryKey: ['character', id],
    queryFn: async () => {
      if (!id) throw new Error('Character ID is required');

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching character:', error);
        throw error;
      }

      return transformCharacter(data);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Real-time subscription hook for generation progress
export function useCharacterRealtime(id: string | undefined) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    const fetchCharacter = async () => {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError(error);
        setIsLoading(false);
        return;
      }

      setCharacter(transformCharacter(data));
      setIsLoading(false);
    };

    fetchCharacter();

    // Set up real-time subscription
    const channel = supabase
      .channel(`character-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'characters',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log('Character update received:', payload);
          setCharacter(transformCharacter(payload.new));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { data: character, isLoading, error };
}

export function useUserCharacters() {
  return useQuery({
    queryKey: ['user-characters'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching characters:', error);
        throw error;
      }

      return data.map(transformCharacter);
    },
  });
}
