import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LEVELING_PROMPT = `You are an expert D&D 5e dungeon master creating a personalized leveling roadmap for a specific character.

Your goal is to map out the optimal path from the character's CURRENT level to level 20, always preserving and enhancing the character's concept, flavor, and personality.

Structure your response as follows:

## LEVELING ROADMAP

Briefly summarize the character's identity and what their progression arc looks like thematically.

### LEVELS [CURRENT+1]–[CURRENT+3]: Early Priorities
- Key abilities unlocked at each level
- ASI/Feat recommendations with explanation of why it fits this specific character
- Spell picks (if spellcaster) that reinforce the character's flavor
- Subclass choice reminder if not yet chosen

### LEVELS [CURRENT+4]–10: Mid-Game Progression
- Key power spikes and what changes
- ASI/Feat recommendations
- Multiclass considerations (pros/cons for THIS character's concept)
- Equipment upgrades that fit the character's flavor

### LEVELS 11–16: High-Tier Expansion
- Major class feature milestones
- How the character's story and flavor evolves at this power level
- Feat/ASI priorities

### LEVELS 17–20: Endgame Mastery
- Capstone features and how they complete the character's arc
- Final build recommendations
- How the character fulfills their original concept at full power

## MULTICLASS OPTIONS
If multiclassing makes sense for this character's concept, give 1-2 specific recommendations with level splits and why they enhance the flavor. If it doesn't fit, say so clearly.

## FEAT PRIORITY LIST
Ranked list of the top 5-7 feats for this character with a one-line explanation of why each fits.

## KEY EQUIPMENT MILESTONES
List 3-5 equipment/magic items that would perfectly suit this character's concept and at what tier to look for them.

Be specific to THIS character — reference their actual class features, subclass, personality, backstory, and concept throughout. This is not a generic class guide, it's a personalized roadmap for this specific adventurer.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { characterId } = await req.json();

    if (!characterId) {
      return new Response(
        JSON.stringify({ error: 'Character ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the character
    const { data: character, error: fetchError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', characterId)
      .single();

    if (fetchError || !character) {
      return new Response(
        JSON.stringify({ error: 'Character not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify ownership
    if (character.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Not authorised to access this character' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return cached if already generated
    if (character.leveling_guide_content) {
      return new Response(
        JSON.stringify({ success: true, content: character.leveling_guide_content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the user prompt with character context
    const cd = character.character_data as any;
    const userPrompt = `Generate a personalized leveling roadmap for this character:

NAME: ${character.character_name}
CONCEPT: ${character.concept}
CURRENT LEVEL: ${character.level}
CLASS: ${character.character_class}${cd?.subclass ? ` (${cd.subclass})` : ''}
RACE: ${character.race}
ALIGNMENT: ${cd?.alignment ?? 'Unknown'}
BACKGROUND: ${cd?.background?.name ?? 'Unknown'}
RULESET: D&D ${character.ruleset}

ABILITY SCORES:
${Object.entries(cd?.abilityScores ?? {}).map(([k, v]) => `  ${k}: ${v}`).join('\n')}

CURRENT FEATURES:
${(cd?.features ?? []).map((f: any) => `  - ${f.name} (${f.source})`).join('\n')}

PERSONALITY:
  Traits: ${cd?.personality?.traits?.join('; ') ?? ''}
  Ideals: ${cd?.personality?.ideals?.join('; ') ?? ''}
  Bonds: ${cd?.personality?.bonds?.join('; ') ?? ''}
  Flaws: ${cd?.personality?.flaws?.join('; ') ?? ''}

BACKSTORY SUMMARY: ${(cd?.backstory ?? '').substring(0, 400)}

${cd?.spellcasting ? `SPELLCASTING: ${cd.spellcasting.ability} based, DC ${cd.spellcasting.spellSaveDC}, Attack +${cd.spellcasting.spellAttackBonus}` : 'NON-SPELLCASTER'}

Generate a complete, personalised level ${character.level}→20 roadmap that preserves and enhances this specific character's concept and flavor.`;

    console.log('Generating leveling guide for:', character.character_name);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: LEVELING_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate leveling guide. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'AI returned empty response.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cache the result
    await supabase
      .from('characters')
      .update({ leveling_guide_content: content })
      .eq('id', characterId);

    console.log('Leveling guide saved for:', character.character_name);

    return new Response(
      JSON.stringify({ success: true, content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
