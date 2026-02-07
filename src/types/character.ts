export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface AbilityModifiers {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface SavingThrows {
  strength: { proficient: boolean; bonus: number };
  dexterity: { proficient: boolean; bonus: number };
  constitution: { proficient: boolean; bonus: number };
  intelligence: { proficient: boolean; bonus: number };
  wisdom: { proficient: boolean; bonus: number };
  charisma: { proficient: boolean; bonus: number };
}

export interface Skill {
  name: string;
  ability: keyof AbilityScores;
  proficient: boolean;
  expertise: boolean;
  bonus: number;
}

export interface Spell {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared?: boolean;
}

export interface SpellSlots {
  level: number;
  total: number;
  used: number;
}

export interface Equipment {
  name: string;
  quantity: number;
  weight?: number;
  equipped?: boolean;
  description?: string;
}

export interface Feature {
  name: string;
  source: string;
  description: string;
}

export interface CharacterData {
  abilityScores: AbilityScores;
  abilityModifiers: AbilityModifiers;
  savingThrows: SavingThrows;
  skills: Skill[];
  armorClass: number;
  hitPoints: {
    maximum: number;
    current: number;
    temporary: number;
  };
  hitDice: {
    type: string;
    total: number;
    used: number;
  };
  speed: number;
  initiative: number;
  proficiencyBonus: number;
  passivePerception: number;
  proficiencies: {
    armor: string[];
    weapons: string[];
    tools: string[];
    languages: string[];
  };
  equipment: Equipment[];
  features: Feature[];
  spellcasting?: {
    ability: keyof AbilityScores;
    spellSaveDC: number;
    spellAttackBonus: number;
    spellSlots: SpellSlots[];
    spells: Spell[];
    cantripsKnown: number;
    spellsKnown: number;
  };
  personality: {
    traits: string[];
    ideals: string[];
    bonds: string[];
    flaws: string[];
  };
  background: {
    name: string;
    feature: string;
    description: string;
  };
  appearance: {
    age: string;
    height: string;
    weight: string;
    eyes: string;
    skin: string;
    hair: string;
    description: string;
    visualDescription?: string;
  };
  backstory: string;
  alignment?: string;
  subclass?: string | null;
}

export interface Character {
  id: string;
  user_id: string | null;
  character_name: string;
  character_class: string;
  level: number;
  race: string;
  ruleset: '2014' | '2024';
  concept: string;
  character_data: CharacterData;
  portrait_url: string | null;
  character_sheet_pdf_url: string | null;
  play_guide_pdf_url: string | null;
  is_guest: boolean;
  created_at: string;
  updated_at: string;
}

export type Ruleset = '2014' | '2024';

export interface GenerationFormData {
  concept: string;
  level: number;
  ruleset: Ruleset;
}
