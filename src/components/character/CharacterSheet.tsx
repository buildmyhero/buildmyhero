import React from "react";
import { CharacterData } from "@/types/character";
import { Shield, Heart, Zap, Footprints, Eye, Sword, BookOpen, Sparkles, User } from "lucide-react";

interface CharacterSheetProps {
  character: {
    id: string;
    character_name: string;
    character_class: string;
    level: number;
    race: string;
    ruleset: string;
    concept: string;
    portrait_url: string | null;
    character_data: CharacterData;
  };
  forPrint?: boolean;
}

export function CharacterSheet({ character, forPrint = false }: CharacterSheetProps) {
  const stats = character.character_data;
  const abilityNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
  
  const formatModifier = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`;
  
  return (
    <div className={`character-sheet ${forPrint ? 'print-mode' : ''}`} id="character-sheet">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Portrait */}
        <div className="flex-shrink-0">
          {character.portrait_url ? (
            <img
              src={character.portrait_url}
              alt={character.character_name}
              className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-xl border-2 border-primary/30 shadow-lg"
            />
          ) : (
            <div className="w-40 h-40 md:w-48 md:h-48 bg-gradient-card rounded-xl border-2 border-border/50 flex items-center justify-center">
              <User className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
        </div>
        
        {/* Character Info */}
        <div className="flex-1">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            {character.character_name}
          </h1>
          <p className="text-xl text-muted-foreground mb-4">
            Level {character.level} {character.race} {character.character_class}
            {stats.subclass && ` (${stats.subclass})`}
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 bg-primary/20 text-primary rounded-full">
              {stats.alignment}
            </span>
            <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full">
              {stats.background?.name}
            </span>
            <span className="px-3 py-1 bg-gold/20 text-gold rounded-full">
              D&D {character.ruleset}
            </span>
          </div>
        </div>
      </div>

      {/* Core Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
          <Shield className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats.armorClass || '—'}</p>
          <p className="text-xs text-muted-foreground uppercase">Armor Class</p>
        </div>
        <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
          <Heart className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats.hitPoints?.maximum || '—'}</p>
          <p className="text-xs text-muted-foreground uppercase">Hit Points</p>
        </div>
        <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
          <Zap className="h-6 w-6 text-gold mx-auto mb-2" />
          <p className="text-3xl font-bold">{formatModifier(stats.initiative || 0)}</p>
          <p className="text-xs text-muted-foreground uppercase">Initiative</p>
        </div>
        <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
          <Footprints className="h-6 w-6 text-secondary-foreground mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats.speed || 30} ft</p>
          <p className="text-xs text-muted-foreground uppercase">Speed</p>
        </div>
        <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center col-span-2 md:col-span-1">
          <Eye className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-3xl font-bold">{stats.passivePerception || 10}</p>
          <p className="text-xs text-muted-foreground uppercase">Passive Perception</p>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          Ability Scores
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {abilityNames.map((ability) => {
            const score = stats.abilityScores?.[ability] || 10;
            const modifier = stats.abilityModifiers?.[ability] || 0;
            const save = stats.savingThrows?.[ability];
            
            return (
              <div key={ability} className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
                <p className="text-xs uppercase text-muted-foreground font-medium mb-1">
                  {ability.slice(0, 3)}
                </p>
                <p className="text-3xl font-bold">{score}</p>
                <p className="text-lg font-semibold text-primary">
                  {formatModifier(modifier)}
                </p>
                {save && (
                  <div className={`mt-2 text-xs ${save.proficient ? 'text-gold' : 'text-muted-foreground'}`}>
                    Save: {formatModifier(save.bonus || modifier)}
                    {save.proficient && ' ●'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold mb-4">Skills</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {stats.skills?.map((skill) => (
            <div 
              key={skill.name}
              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                skill.proficient ? 'bg-primary/10' : 'bg-muted/50'
              }`}
            >
              <span className="flex items-center gap-2">
                {skill.expertise && <span className="text-gold">◆</span>}
                {skill.proficient && !skill.expertise && <span className="text-primary">●</span>}
                {!skill.proficient && <span className="text-muted-foreground/30">○</span>}
                <span className={skill.proficient ? 'font-medium' : 'text-muted-foreground'}>
                  {skill.name}
                </span>
              </span>
              <span className="font-mono font-semibold">
                {formatModifier(skill.bonus || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Equipment & Weapons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Weapons */}
        <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Sword className="h-5 w-5 text-destructive" />
            Weapons & Attacks
          </h2>
          <div className="space-y-3">
            {stats.equipment?.filter(item => 
              item.name?.toLowerCase().includes('sword') ||
              item.name?.toLowerCase().includes('bow') ||
              item.name?.toLowerCase().includes('dagger') ||
              item.name?.toLowerCase().includes('axe') ||
              item.name?.toLowerCase().includes('staff') ||
              item.name?.toLowerCase().includes('mace') ||
              item.name?.toLowerCase().includes('crossbow') ||
              item.name?.toLowerCase().includes('spear') ||
              item.equipped
            ).slice(0, 5).map((weapon, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                <span className="font-medium">{weapon.name}</span>
                <span className="text-sm text-muted-foreground">{weapon.description}</span>
              </div>
            ))}
            {(!stats.equipment || stats.equipment.length === 0) && (
              <p className="text-muted-foreground text-sm">No weapons equipped</p>
            )}
          </div>
        </div>

        {/* Equipment */}
        <div className="bg-gradient-card rounded-xl border border-border/50 p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Equipment</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.equipment?.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm py-1">
                <span>{item.name}</span>
                {item.quantity > 1 && <span className="text-muted-foreground">×{item.quantity}</span>}
              </div>
            ))}
            {(!stats.equipment || stats.equipment.length === 0) && (
              <p className="text-muted-foreground text-sm">No equipment</p>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-gold" />
          Features & Traits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.features?.map((feature, index) => (
            <div key={index} className="bg-gradient-card rounded-xl border border-border/50 p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{feature.name}</h3>
                <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                  {feature.source}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Spellcasting */}
      {stats.spellcasting && (
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Spellcasting
          </h2>
          
          {/* Spellcasting Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs uppercase text-muted-foreground mb-1">Ability</p>
              <p className="text-lg font-bold capitalize">{stats.spellcasting.ability}</p>
            </div>
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs uppercase text-muted-foreground mb-1">Spell Save DC</p>
              <p className="text-3xl font-bold">{stats.spellcasting.spellSaveDC}</p>
            </div>
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4 text-center">
              <p className="text-xs uppercase text-muted-foreground mb-1">Attack Bonus</p>
              <p className="text-3xl font-bold">{formatModifier(stats.spellcasting.spellAttackBonus)}</p>
            </div>
          </div>

          {/* Spell Slots */}
          {stats.spellcasting.spellSlots && stats.spellcasting.spellSlots.length > 0 && (
            <div className="bg-gradient-card rounded-xl border border-border/50 p-4 mb-6">
              <h3 className="font-semibold mb-3">Spell Slots</h3>
              <div className="flex flex-wrap gap-4">
                {stats.spellcasting.spellSlots.map((slot) => (
                  <div key={slot.level} className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Level {slot.level}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: slot.total }).map((_, i) => (
                        <div 
                          key={i}
                          className={`w-4 h-4 rounded-full border-2 ${
                            i < slot.used ? 'bg-muted border-muted' : 'border-primary bg-primary/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spells List */}
          <div className="space-y-4">
            {/* Cantrips */}
            {stats.spellcasting.spells?.filter(s => s.level === 0).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 text-gold">Cantrips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {stats.spellcasting.spells.filter(s => s.level === 0).map((spell, index) => (
                    <div key={index} className="bg-muted/50 rounded-lg p-3">
                      <p className="font-medium">{spell.name}</p>
                      <p className="text-xs text-muted-foreground">{spell.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leveled Spells by Level */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((spellLevel) => {
              const spellsAtLevel = stats.spellcasting?.spells?.filter(s => s.level === spellLevel) || [];
              if (spellsAtLevel.length === 0) return null;
              
              return (
                <div key={spellLevel}>
                  <h3 className="font-semibold mb-2">Level {spellLevel} Spells</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {spellsAtLevel.map((spell, index) => (
                      <div key={index} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{spell.name}</p>
                          {spell.prepared && (
                            <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                              Prepared
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {spell.school} • {spell.castingTime} • {spell.range}
                        </p>
                        <p className="text-xs text-muted-foreground">{spell.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Personality */}
      <div className="mb-8">
        <h2 className="font-display text-xl font-semibold mb-4">Personality</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="parchment-texture rounded-xl p-4 text-parchment-foreground">
            <h3 className="font-semibold mb-2">Traits</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {stats.personality?.traits?.map((trait, i) => (
                <li key={i}>{trait}</li>
              ))}
            </ul>
          </div>
          <div className="parchment-texture rounded-xl p-4 text-parchment-foreground">
            <h3 className="font-semibold mb-2">Ideals</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {stats.personality?.ideals?.map((ideal, i) => (
                <li key={i}>{ideal}</li>
              ))}
            </ul>
          </div>
          <div className="parchment-texture rounded-xl p-4 text-parchment-foreground">
            <h3 className="font-semibold mb-2">Bonds</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {stats.personality?.bonds?.map((bond, i) => (
                <li key={i}>{bond}</li>
              ))}
            </ul>
          </div>
          <div className="parchment-texture rounded-xl p-4 text-parchment-foreground">
            <h3 className="font-semibold mb-2">Flaws</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {stats.personality?.flaws?.map((flaw, i) => (
                <li key={i}>{flaw}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Backstory */}
      {stats.backstory && (
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Backstory</h2>
          <div className="parchment-texture rounded-xl p-6 text-parchment-foreground">
            <p className="whitespace-pre-line text-sm leading-relaxed">{stats.backstory}</p>
          </div>
        </div>
      )}
    </div>
  );
}
