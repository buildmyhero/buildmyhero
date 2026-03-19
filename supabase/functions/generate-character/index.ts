import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are a creative D&D 5e character builder who translates fictional concepts into mechanically brilliant characters. Your goal is to find the PERFECT species, class, and build where the game mechanics themselves CREATE the character's flavor.

CRITICAL INSTRUCTION: DO NOT default to Human or Elf just because the concept references a humanoid character. Always consider species whose MECHANICAL TRAITS (darkvision, resistances, innate spellcasting, natural armor, etc.) reinforce the concept. Human should only be chosen when the concept specifically benefits from the Variant Human feat or when no other species mechanically fits.

=== PROCESS ===

STEP 1: ANALYZE THE CONCEPT
Extract the core traits: What does this character DO? What makes them special? What environment do they operate in? What abilities or powers define them?

STEP 2: MATCH TRAITS TO MECHANICS
Find species whose racial abilities CREATE the flavor, not just describe it:
- "Operates in shadows/darkness" → Tiefling (darkvision 120ft, fire resistance), Drow (superior darkvision, innate magic), Gloom Stalker Ranger
- "Tech genius/inventor" → Rock Gnome (Tinker trait, Artificer's Lore), Warforged (literally built)
- "Elemental power" → Genasi (innate elemental magic), Dragonborn (breath weapon, resistance)
- "Shapeshifter/trickster" → Changeling (shapeshifting), Eladrin (fey step + mood shifting)
- "Feral/primal nature" → Shifter (shifting ability), Lizardfolk (natural armor, bite), Minotaur (horns, charge)
- "Ancient/wise/celestial" → Aasimar (radiant soul, healing hands), Firbolg (hidden step, speech of beast and leaf)
- "Undead/dark themes" → Dhampir (bite, spider climb), Reborn (undead resilience), Shadar-kai (necrotic resistance)

STEP 3: BE CREATIVE WITH SPECIES
Never pick Human by default. Always ask: "Which species has a mechanical trait that BECOMES this character's signature ability?" The best builds are where players discover their species traits perfectly mirror their character concept.

STEP 4: MULTICLASS STRATEGICALLY
When the concept has multiple distinct aspects, consider multiclassing:
- Martial + stealth → Fighter/Rogue
- Divine + arcane → Cleric/Wizard or Paladin/Warlock
- Scholar + warrior → Artificer/Fighter
- Nature + cunning → Ranger/Rogue
Only multiclass when it mechanically serves the concept. Single class is fine when it covers everything.

STEP 5: BACKGROUNDS AND TOOLS
Choose backgrounds whose features and tool proficiencies reinforce the concept:
- Detective/investigator → Urban Bounty Hunter, Investigator
- Noble/leader → Noble, Knight
- Criminal/spy → Criminal, Spy variant
- Scholar → Sage, Cloistered Scholar

=== REAL EXAMPLES OF CREATIVE SPECIES MATCHING ===

"Batman" → Tiefling Shadow Monk/Rogue: Darkvision 120ft for night operations, fire resistance (explosions), Shadow Step for teleporting between shadows, Stunning Strike for non-lethal takedowns, Sneak Attack for precise strikes.

"Iron Man" → Rock Gnome Artificer/Fighter: Tinker trait to build gadgets, Artificer infusions for magical armor, Action Surge for burst damage, INT-based casting for genius inventor feel.

"Elsa (Frozen)" → Air or Water Genasi Sorcerer: Innate elemental magic, Constitution-based innate casting, Draconic/Storm Sorcery for ice and cold themes, natural connection to elemental power.

"Deadpool" → Changeling Rogue/Fighter: Shapeshifting for disguises and chaos, Action Surge for frantic combat, Sneak Attack for lethal precision, proficiency in Deception and Performance.

"Cruella de Vil" → Tiefling Warlock: Hellish Rebuke when crossed, darkness spell for dramatic entrances, Pact of the Chain for a familiar, high Charisma for commanding presence.

"Jason Bourne" → Drow Rogue/Fighter: Superior darkvision for covert ops, innate Faerie Fire for tracking, martial weapon proficiency, expertise in Stealth and Athletics.

"Gandalf" → Aasimar or Firbolg Wizard: Healing Hands or Hidden Step for mysterious power, high-level spell access, ancient wisdom embodied in racial traits.

"Wolverine" → Shifter Barbarian: Shifting for feral transformation (temporary HP, natural weapons), Rage for berserker fury, unarmored defense, relentless endurance.

=== OUTPUT FORMAT ===

Return ONLY valid JSON, no markdown, no explanations, no code blocks.
Include detailed visual descriptions for portrait generation.
Scale equipment appropriately for character level.
Assign ability scores using point buy or standard array.
Calculate all derived stats accurately (AC, HP, saves, skills, etc.).
For spellcasters: include full spell list with proper slot allocation.
Include personality traits, ideals, bonds, flaws.

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
  "spellcasting": null,
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
    "visualDescription": "DETAILED physical description for AI art generation. Include race-specific features, distinctive markings, clothing/armor appearance with colors and materials, weapon appearance, magical effects, pose, expression, and atmosphere. Write as if describing a fantasy portrait painting. 200+ words minimum."
  },
  "backstory": "2-3 paragraph character backstory"
}

RULESET DIFFERENCES:
2024 Ruleset:
- Use Species terminology in descriptions (but keep race key for DB compatibility)
- Species get +2/+1 or +1/+1/+1 ability score increases (player choice)
- Backgrounds grant Origin Feat
- Updated class features (especially Ranger, Monk)

2014 Ruleset:
- Use Race terminology
- Races have fixed ability score increases
- Backgrounds give skills/tools only
- Original class features

EQUIPMENT SCALING BY LEVEL:
- Levels 1-4: Starting equipment, basic items
- Levels 5-10: Uncommon magic items, +1 weapons/armor
- Levels 11-16: Rare magic items, +2 weapons/armor
- Levels 17-20: Very rare/legendary items, +3 weapons/armor

Return ONLY the JSON object, nothing else.`;

const PLAY_GUIDE_PROMPT = `You are an expert D&D dungeon master helping a player understand how to play their new character effectively.

Based on the provided character data, generate a comprehensive play guide with these sections:

## COMBAT TACTICS
- Optimal combat strategy for this character
- Best use of abilities, spells, and features in combat
- Positioning and movement tactics
- What to do in different combat scenarios (single enemy, multiple enemies, boss fights)
- Synergies between abilities
- Action economy optimization (action, bonus action, reaction usage)

## ROLEPLAY GUIDE
- How to portray this character's personality
- Voice and mannerisms suggestions
- How to play their ideals, bonds, and flaws
- Relationship dynamics with party members
- Character development arcs and growth opportunities
- Example dialogue and reactions to common scenarios

## LEVELING ROADMAP
For each level from current to 20:
- Recommended ability score improvements at each ASI level
- Feat recommendations with explanations
- Spell selections for upcoming levels (if spellcaster)
- Multiclass suggestions if beneficial (explain why/why not)
- Key power spikes and what unlocks at each level
- Equipment upgrade priorities

## TIPS FOR NEW PLAYERS
(Include this section only for levels 1-3)
- Basic D&D mechanics explained
- How to read your character sheet
- Common beginner mistakes to avoid
- Helpful resources for learning more

Return well-formatted markdown text with clear headers (use ##) and bullet points. Be specific and actionable.`;

async function generatePortrait(
  visualDescription: string,
  characterName: string,
  characterId: string,
  supabase: any,
  LOVABLE_API_KEY: string
): Promise<string | null> {
  try {
    console.log('Starting portrait generation for:', characterName);

    const portraitPrompt = `Fantasy character portrait art, professional D&D character illustration. ${visualDescription}. High quality digital fantasy art, dramatic lighting, detailed face and upper body portrait, trending on artstation, painterly style.`;

    const imageResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        messages: [{ role: 'user', content: portraitPrompt }],
        modalities: ['image', 'text']
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Portrait generation API error:', imageResponse.status, errorText);
      return null;
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image URL in response:', imageData);
      return null;
    }

    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const fileName = `${characterId}.png`;
    const { error: uploadError } = await supabase.storage
      .from('character-portraits')
      .upload(fileName, imageBytes, { contentType: 'image/png', upsert: true });

    if (uploadError) {
      console.error('Failed to upload portrait:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('character-portraits')
      .getPublicUrl(fileName);

    console.log('Portrait uploaded successfully:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('Portrait generation error:', error);
    return null;
  }
}

async function generatePlayGuide(
  characterData: any,
  characterName: string,
  LOVABLE_API_KEY: string
): Promise<string | null> {
  try {
    console.log('Starting play guide generation for:', characterName);

    const userPrompt = `Generate a comprehensive play guide for this D&D 5e character:\n\nCHARACTER DATA:\n${JSON.stringify(characterData, null, 2)}\n\nCreate a detailed, actionable play guide that will help the player understand how to play this character effectively in both combat and roleplay situations.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // FIX Bug 1: corrected from non-existent 'google/gemini-3-flash-preview'
        model: 'google/gemini-2.5-flash-preview',
        messages: [
          { role: 'system', content: PLAY_GUIDE_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Play guide generation API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in play guide response');
      return null;
    }

    console.log('Play guide generated successfully');
    return content;

  } catch (error) {
    console.error('Play guide generation error:', error);
    return null;
  }
}

async function updateProgress(
  supabase: any,
  characterId: string,
  progress: number,
  status: 'generating' | 'complete' | 'error' = 'generating'
) {
  const { error } = await supabase
    .from('characters')
    .update({ generation_progress: progress, status: status })
    .eq('id', characterId);

  if (error) console.error('Failed to update progress:', error);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { concept, level, ruleset } = await req.json();

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

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const characterId = crypto.randomUUID();

    const initialRecord = {
      id: characterId,
      character_name: 'Generating...',
      character_class: 'Unknown',
      level: level,
      race: 'Unknown',
      ruleset: ruleset,
      concept: concept,
      character_data: {},
      is_guest: true,
      user_id: null,
      portrait_url: null,
      status: 'generating',
      generation_progress: 5,
    };

    const { error: insertError } = await supabase.from('characters').insert(initialRecord);

    if (insertError) {
      console.error('Failed to create initial record:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to start character generation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userPrompt = `Create a D&D 5e character for the ${ruleset} ruleset at level ${level}.\n\nCharacter concept: "${concept}"\n\nGenerate a complete, playable character with all stats, equipment, features, and backstory. Make sure the character fits the concept creatively while being mechanically sound.`;

    console.log('Generating character with concept:', concept, 'level:', level, 'ruleset:', ruleset);

    await updateProgress(supabase, characterId, 15);

    // FIX Bug 1: corrected from non-existent 'google/gemini-3-flash-preview'
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-preview',
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
      await updateProgress(supabase, characterId, 0, 'error');

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
      await updateProgress(supabase, characterId, 0, 'error');
      return new Response(
        JSON.stringify({ error: 'AI returned empty response. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await updateProgress(supabase, characterId, 30);

    let characterData;
    try {
      let jsonStr = content.trim();
      if (jsonStr.startsWith('```json')) jsonStr = jsonStr.slice(7);
      else if (jsonStr.startsWith('```')) jsonStr = jsonStr.slice(3);
      if (jsonStr.endsWith('```')) jsonStr = jsonStr.slice(0, -3);
      jsonStr = jsonStr.trim();
      characterData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      await updateProgress(supabase, characterId, 0, 'error');
      return new Response(
        JSON.stringify({ error: 'Failed to parse character data. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!characterData.name || !characterData.race || !characterData.class) {
      console.error('Missing required character fields:', characterData);
      await updateProgress(supabase, characterId, 0, 'error');
      return new Response(
        JSON.stringify({ error: 'Generated character is missing required fields. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await updateProgress(supabase, characterId, 50);

    const characterRecord = {
      character_name: characterData.name,
      character_class: characterData.class,
      level: characterData.level || level,
      race: characterData.race,
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
      status: 'generating',
      generation_progress: 55,
    };

    console.log('Updating character in database:', characterRecord.character_name);

    const { data: savedCharacter, error: dbError } = await supabase
      .from('characters')
      .update(characterRecord)
      .eq('id', characterId)
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

    const visualDescription = characterData.appearance?.visualDescription ||
      characterData.appearance?.description ||
      `A ${characterData.race} ${characterData.class} named ${characterData.name}`;

    EdgeRuntime.waitUntil((async () => {
      try {
        await updateProgress(supabase, characterId, 60);

        const portraitUrl = await generatePortrait(
          visualDescription, characterData.name, savedCharacter.id, supabase, LOVABLE_API_KEY
        );

        if (portraitUrl) {
          await supabase.from('characters')
            .update({ portrait_url: portraitUrl, generation_progress: 70 })
            .eq('id', savedCharacter.id);
          console.log('Character portrait updated successfully');
        } else {
          await updateProgress(supabase, characterId, 70);
        }

        await updateProgress(supabase, characterId, 75);

        const playGuideContent = await generatePlayGuide(
          {
            name: characterData.name,
            race: characterData.race,
            class: characterData.class,
            subclass: characterData.subclass,
            level: characterData.level || level,
            background: characterData.background,
            abilityScores: characterData.abilityScores,
            features: characterData.features,
            spellcasting: characterData.spellcasting,
            equipment: characterData.equipment,
            personality: characterData.personality,
            alignment: characterData.alignment,
          },
          characterData.name,
          LOVABLE_API_KEY
        );

        if (playGuideContent) {
          await supabase.from('characters')
            .update({ play_guide_content: playGuideContent, generation_progress: 95 })
            .eq('id', savedCharacter.id);
          console.log('Play guide generated successfully');
        } else {
          await updateProgress(supabase, characterId, 95);
        }

        await supabase.from('characters')
          .update({ status: 'complete', generation_progress: 100 })
          .eq('id', savedCharacter.id);

        console.log('Character generation complete');

      } catch (error) {
        console.error('Background generation error:', error);
        await supabase.from('characters')
          .update({ status: 'complete', generation_progress: 100 })
          .eq('id', savedCharacter.id);
      }
    })());

    return new Response(
      JSON.stringify({ success: true, character: savedCharacter, portraitGenerating: true, playGuideGenerating: true }),
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
