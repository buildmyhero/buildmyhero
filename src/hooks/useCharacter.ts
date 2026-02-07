import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Character, CharacterData } from '@/types/character';

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
    is_guest: row.is_guest,
    created_at: row.created_at,
    updated_at: row.updated_at,
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
