import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
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

function hasCharacterData(char: Character): boolean {
  return !!(
    char.character_data &&
    typeof char.character_data === 'object' &&
    Object.keys(char.character_data as any).length > 0
  );
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
    staleTime: 1000 * 60 * 5,
  });
}

// Real-time hook with polling fallback.
// Polls every 3s while generating. When status flips to 'complete' but
// character_data is still empty (race condition between status update and
// data update), does one immediate re-fetch to get the full record.
export function useCharacterRealtime(id: string | undefined) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const fetchCharacter = async (): Promise<Character | null> => {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id!)
      .single();

    if (error) {
      console.error('Error fetching character:', error);
      return null;
    }
    return transformCharacter(data);
  };

  // When status is complete but character_data is empty, the status update
  // and data update landed in different DB transactions. Re-fetch once after
  // a short delay to get the fully-written record.
  const applyCharacter = async (char: Character) => {
    const isDone = char.status === 'complete' || char.status === 'error';
    const dataReady = hasCharacterData(char);

    if (isDone && !dataReady) {
      console.log('Status complete but character_data empty — re-fetching in 500ms');
      stopPolling();
      await new Promise(r => setTimeout(r, 500));
      const fresh = await fetchCharacter();
      if (fresh) setCharacter(fresh);
      return;
    }

    setCharacter(char);
    if (isDone) stopPolling();
  };

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchCharacter().then(async (char) => {
      if (char) {
        await applyCharacter(char);
      } else {
        setError(new Error('Character not found'));
      }
      setIsLoading(false);
    });

    // Poll every 3s while generating
    pollIntervalRef.current = setInterval(async () => {
      const char = await fetchCharacter();
      if (char) await applyCharacter(char);
    }, 3000);

    // Realtime subscription as bonus fast-path if enabled in Supabase
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
        async (payload) => {
          console.log('Realtime update received:', payload.new);
          const char = transformCharacter(payload.new);
          await applyCharacter(char);
        }
      )
      .subscribe();

    return () => {
      stopPolling();
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

      if (!user) throw new Error('Not authenticated');

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
