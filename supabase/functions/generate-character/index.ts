import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are an expert D&D 5e character generator. Generate a complete, playable character based on the user's concept using the specified ruleset.

CRITICAL REQUIREMENTS:
- Return ONLY valid JSON, no markdown, no explanations, no code blocks
- Include detailed visual descriptions for portrait generation
- Scale equipment appropriately for character level
- Assign ability scores using point buy or standard array
- Calculate all derived stats accurately (AC, HP, saves, skills, etc.)
- For spellcasters: include full spell list with proper slot allocation
- Include personality traits, ideals, bonds, flaws

JSON STRUCTURE:
{
  "name": "Character name",
  "race": "Race/species name",
  "class": "Class name",
  "subclass": "Subclass if level 3+, otherwise null",
  "level": number,
  "background": {
    "name": "Background name",
    "feature": "Background feature name",
    "description": "What the feature does"
  },
  "alignment": "Alignment",
  "abilityScores": {
    "strength": number,
    "dexterity": number,
    "constitution": number,
    "intelligence": number,
    "wisdom": number,
    "charisma": number
  },
  "abilityModifiers": {
    "strength": number,
    "dexterity": number,
    "constitution": number,
    "intelligence": number,
    "wisdom": number,
    "charisma": number
  },
  "hitPoints": {
    "maximum": number,
    "current": number,
    "temporary": 0
  },
  "hitDice": {
    "type": "d8",
    "total": level,
    "used": 0
  },
  "armorClass": number,
  "proficiencyBonus": number,
  "speed": number,
  "initiative": number,
  "passivePerception": number,
  "savingThrows": {
    "strength": {"proficient": boolean, "bonus": number},
    "dexterity": {"proficient": boolean, "bonus": number},
    "constitution": {"proficient": boolean, "bonus": number},
    "intelligence": {"proficient": boolean, "bonus": number},
    "wisdom": {"proficient": boolean, "bonus": number},
    "charisma": {"proficient": boolean, "bonus": number}
  },
  "skills": [
    {"name": "Acrobatics", "ability": "dexterity", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Animal Handling", "ability": "wisdom", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Arcana", "ability": "intelligence", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Athletics", "ability": "strength", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Deception", "ability": "charisma", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "History", "ability": "intelligence", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Insight", "ability": "wisdom", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Intimidation", "ability": "charisma", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Investigation", "ability": "intelligence", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Medicine", "ability": "wisdom", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Nature", "ability": "intelligence", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Perception", "ability": "wisdom", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Performance", "ability": "charisma", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Persuasion", "ability": "charisma", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Religion", "ability": "intelligence", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Sleight of Hand", "ability": "dexterity", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Stealth", "ability": "dexterity", "proficient": boolean, "expertise": boolean, "bonus": number},
    {"name": "Survival", "ability": "wisdom", "proficient": boolean, "expertise": boolean, "bonus": number}
  ],
  "proficiencies": {
    "armor": ["Light armor", "Medium armor"],
    "weapons": ["Simple weapons"],
    "tools": ["Tool name"],
    "languages": ["Common", "Other language"]
  },
  "equipment": [
    {"name": "Item name", "quantity": number, "description": "Brief desc", "equipped": boolean}
  ],
  "features": [
    {"name": "Feature name", "description": "What it does", "source": "Class/Race/Background"}
  ],
  "spellcasting": null OR {
    "ability": "intelligence" | "wisdom" | "charisma",
    "spellSaveDC": number,
    "spellAttackBonus": number,
    "cantripsKnown": number,
    "spellsKnown": number,
    "spellSlots": [
      {"level": 1, "total": number, "used": 0},
      {"level": 2, "total": number, "used": 0}
    ],
    "spells": [
      {"name": "Spell name", "level": 0, "school": "Evocation", "castingTime": "1 action", 
       "range": "60 feet", "components": "V, S", "duration": "Instantaneous", 
       "description": "Brief description", "prepared": true}
    ]
  },
  "personality": {
    "traits": ["trait 1", "trait 2"],
    "ideals": ["What they believe"],
    "bonds": ["What they care about"],
    "flaws": ["Their weakness"]
  },
  "appearance": {
    "age": "25 years",
    "height": "5'10\"",
    "weight": "170 lbs",
    "eyes": "Eye color",
    "skin": "Skin description",
    "hair": "Hair description",
    "description": "DETAILED physical description for AI art generation. Include race-specific features, clothing/armor appearance, weapon appearance, magical effects if any. 150+ words."
  },
  "backstory": "2-3 paragraph character backstory"
}

RULESET DIFFERENCES:
2024 Ruleset:
- Use "Species" terminology in descriptions (but keep "race" key for DB compatibility)
- Species get +2/+1 or +1/+1/+1 ability score increases (player choice)
- Backgrounds grant Origin Feat
- Updated class features (especially Ranger, Monk)

2014 Ruleset:
- Use "Race" terminology  
- Races have fixed ability score increases
- Backgrounds give skills/tools only
- Original class features

EQUIPMENT SCALING BY LEVEL:
- Levels 1-4: Starting equipment, basic items
- Levels 5-10: Uncommon magic items, +1 weapons/armor
- Levels 11-16: Rare magic items, +2 weapons/armor
- Levels 17-20: Very rare/legendary items, +3 weapons/armor

Return ONLY the JSON object, nothing else.`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { concept, level, ruleset } = await req.json();

    // Validate inputs
    if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Character concept is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!level || typeof level !== 'number' || level < 1 || level > 20) {
      return new Response(
        JSON.stringify({ error: 'Level must be between 1 and 20' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ruleset || !['2014', '2024'].includes(ruleset)) {
      return new Response(
        JSON.stringify({ error: 'Ruleset must be "2014" or "2024"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Create a D&D 5e character for the ${ruleset} ruleset at level ${level}.

Character concept: "${concept}"

Generate a complete, playable character with all stats, equipment, features, and backstory. Make sure the character fits the concept creatively while being mechanically sound.`;

    console.log('Generating character with concept:', concept, 'level:', level, 'ruleset:', ruleset);

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to generate character. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response:', aiData);
      return new Response(
        JSON.stringify({ error: 'AI returned empty response. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from the AI response
    let characterData;
    try {
      // Try to extract JSON from the response (handle potential markdown code blocks)
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();
      
      characterData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError, 'Content:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse character data. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!characterData.name || !characterData.race || !characterData.class) {
      console.error('Missing required character fields:', characterData);
      return new Response(
        JSON.stringify({ error: 'Generated character is missing required fields. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare the character data for storage
    const characterRecord = {
      character_name: characterData.name,
      character_class: characterData.class,
      level: characterData.level || level,
      race: characterData.race,
      ruleset: ruleset,
      concept: concept,
      character_data: {
        abilityScores: characterData.abilityScores,
        abilityModifiers: characterData.abilityModifiers,
        savingThrows: characterData.savingThrows,
        skills: characterData.skills,
        armorClass: characterData.armorClass,
        hitPoints: characterData.hitPoints,
        hitDice: characterData.hitDice,
        speed: characterData.speed,
        initiative: characterData.initiative,
        proficiencyBonus: characterData.proficiencyBonus,
        passivePerception: characterData.passivePerception,
        proficiencies: characterData.proficiencies,
        equipment: characterData.equipment,
        features: characterData.features,
        spellcasting: characterData.spellcasting,
        personality: characterData.personality,
        background: characterData.background,
        appearance: characterData.appearance,
        backstory: characterData.backstory,
        alignment: characterData.alignment,
        subclass: characterData.subclass,
      },
      is_guest: true,
      user_id: null,
      portrait_url: null,
    };

    console.log('Saving character to database:', characterRecord.character_name);

    // Insert into database
    const { data: savedCharacter, error: dbError } = await supabase
      .from('characters')
      .insert(characterRecord)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save character. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Character saved successfully with ID:', savedCharacter.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        character: savedCharacter 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
