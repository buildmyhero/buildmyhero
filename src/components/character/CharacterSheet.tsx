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
    play_guide_content?: string | null;
  };
  forPrint?: boolean;
}

export function CharacterSheet({ character, forPrint = false }: CharacterSheetProps) {
  const stats = character.character_data as any;
  const abilityNames = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
  const fmt = (mod: number) => mod >= 0 ? `+${mod}` : `${mod}`;

  return (
    <div className={`character-sheet ${forPrint ? 'for-print' : ''}`} id="character-sheet">

      {/* ═══ PAGE 1 ════════════════════════════════════════════════ */}
      <div className="print-page">

        {/* Header */}
        <div className="print-header">
          <div className="print-portrait-wrap">
            {character.portrait_url
              ? <img src={character.portrait_url} alt={character.character_name} className="print-portrait" />
              : <div className="print-portrait-placeholder"><User className="h-12 w-12 opacity-30" /></div>}
          </div>
          <div className="print-title">
            <h1>{character.character_name}</h1>
            <p className="print-subtitle">
              Level {character.level} {character.race} {character.character_class}
              {stats.subclass && ` — ${stats.subclass}`}
            </p>
            <div className="print-badges">
              {stats.alignment && <span className="print-badge">{stats.alignment}</span>}
              {stats.background?.name && <span className="print-badge">{stats.background.name}</span>}
              <span className="print-badge">D&D {character.ruleset}</span>
            </div>
          </div>
          {/* Core stats inline in header */}
          <div className="print-core-stats">
            {[
              { label: 'AC', value: stats.armorClass || '—' },
              { label: 'HP', value: stats.hitPoints?.maximum || '—' },
              { label: 'Init', value: fmt(stats.initiative || 0) },
              { label: 'Speed', value: `${stats.speed || 30}` },
              { label: 'Perc', value: stats.passivePerception || 10 },
              { label: 'Prof', value: fmt(stats.proficiencyBonus || 2) },
            ].map(s => (
              <div key={s.label} className="print-core-stat">
                <span className="print-core-stat-value">{s.value}</span>
                <span className="print-core-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Two-column body */}
        <div className="print-body">

          {/* LEFT column */}
          <div className="print-col print-col-left">

            {/* Ability Scores */}
            <div className="print-section">
              <h2 className="print-section-title">Ability Scores</h2>
              <div className="print-abilities">
                {abilityNames.map(ab => {
                  const score = stats.abilityScores?.[ab] || 10;
                  const mod = stats.abilityModifiers?.[ab] || 0;
                  const save = stats.savingThrows?.[ab];
                  return (
                    <div key={ab} className="print-ability">
                      <span className="print-ability-name">{ab.slice(0,3).toUpperCase()}</span>
                      <span className="print-ability-score">{score}</span>
                      <span className="print-ability-mod">{fmt(mod)}</span>
                      {save?.proficient && <span className="print-ability-save">✦ {fmt(save.bonus ?? mod)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skills */}
            <div className="print-section">
              <h2 className="print-section-title">Skills</h2>
              <div className="print-skills">
                {stats.skills?.map((skill: any) => (
                  <div key={skill.name} className={`print-skill ${skill.proficient ? 'proficient' : ''}`}>
                    <span className="print-skill-dot">{skill.expertise ? '◆' : skill.proficient ? '●' : '○'}</span>
                    <span className="print-skill-name">{skill.name}</span>
                    <span className="print-skill-bonus">{fmt(skill.bonus || 0)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Proficiencies */}
            {stats.proficiencies && (
              <div className="print-section">
                <h2 className="print-section-title">Proficiencies</h2>
                {stats.proficiencies.armor?.length > 0 && <p className="print-prof-line"><b>Armor:</b> {stats.proficiencies.armor.join(', ')}</p>}
                {stats.proficiencies.weapons?.length > 0 && <p className="print-prof-line"><b>Weapons:</b> {stats.proficiencies.weapons.join(', ')}</p>}
                {stats.proficiencies.tools?.length > 0 && <p className="print-prof-line"><b>Tools:</b> {stats.proficiencies.tools.join(', ')}</p>}
                {stats.proficiencies.languages?.length > 0 && <p className="print-prof-line"><b>Languages:</b> {stats.proficiencies.languages.join(', ')}</p>}
              </div>
            )}
          </div>

          {/* RIGHT column */}
          <div className="print-col print-col-right">

            {/* Features & Traits */}
            <div className="print-section">
              <h2 className="print-section-title">Features & Traits</h2>
              <div className="print-features">
                {stats.features?.map((f: any, i: number) => (
                  <div key={i} className="print-feature">
                    <span className="print-feature-name">{f.name}</span>
                    <span className="print-feature-src"> [{f.source}]</span>
                    <p className="print-feature-desc">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div className="print-section">
              <h2 className="print-section-title">Equipment</h2>
              <div className="print-equipment">
                {stats.equipment?.map((item: any, i: number) => (
                  <div key={i} className="print-equip-item">
                    <span>{item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ''}</span>
                    {item.description && <span className="print-equip-desc"> — {item.description}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Personality */}
            <div className="print-section">
              <h2 className="print-section-title">Personality</h2>
              {stats.personality?.traits?.length > 0 && <p className="print-pers-line"><b>Traits:</b> {stats.personality.traits.join(' ')}</p>}
              {stats.personality?.ideals?.length > 0 && <p className="print-pers-line"><b>Ideals:</b> {stats.personality.ideals.join(' ')}</p>}
              {stats.personality?.bonds?.length > 0 && <p className="print-pers-line"><b>Bonds:</b> {stats.personality.bonds.join(' ')}</p>}
              {stats.personality?.flaws?.length > 0 && <p className="print-pers-line"><b>Flaws:</b> {stats.personality.flaws.join(' ')}</p>}
            </div>

            {/* Backstory */}
            {stats.backstory && (
              <div className="print-section">
                <h2 className="print-section-title">Backstory</h2>
                <p className="print-backstory">{stats.backstory}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ PAGE 2 — Spells (only if spellcaster) ════════════════ */}
      {stats.spellcasting && (
        <div className="print-page print-page-break">
          <h2 className="print-page-title">{character.character_name} — Spellcasting</h2>
          <div className="print-spell-header">
            <div className="print-core-stat">
              <span className="print-core-stat-value capitalize">{stats.spellcasting.ability}</span>
              <span className="print-core-stat-label">Ability</span>
            </div>
            <div className="print-core-stat">
              <span className="print-core-stat-value">{stats.spellcasting.spellSaveDC}</span>
              <span className="print-core-stat-label">Save DC</span>
            </div>
            <div className="print-core-stat">
              <span className="print-core-stat-value">{fmt(stats.spellcasting.spellAttackBonus)}</span>
              <span className="print-core-stat-label">Atk Bonus</span>
            </div>
          </div>

          {/* Spell Slots */}
          {stats.spellcasting.spellSlots?.length > 0 && (
            <div className="print-section">
              <h2 className="print-section-title">Spell Slots</h2>
              <div className="print-spell-slots">
                {stats.spellcasting.spellSlots.map((slot: any) => (
                  <div key={slot.level} className="print-slot-group">
                    <span className="print-slot-level">Lvl {slot.level}</span>
                    <span className="print-slot-circles">
                      {Array.from({ length: slot.total }).map((_: any, i: number) => (
                        <span key={i} className="print-slot-circle">○</span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Spells by level */}
          <div className="print-body">
            <div className="print-col">
              {/* Cantrips */}
              {stats.spellcasting.spells?.filter((s: any) => s.level === 0).length > 0 && (
                <div className="print-section">
                  <h2 className="print-section-title">Cantrips</h2>
                  {stats.spellcasting.spells.filter((s: any) => s.level === 0).map((spell: any, i: number) => (
                    <div key={i} className="print-spell">
                      <b>{spell.name}</b> — {spell.castingTime}, {spell.range}
                      <p className="print-spell-desc">{spell.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {[1,2,3,4].map(lvl => {
                const spells = stats.spellcasting?.spells?.filter((s: any) => s.level === lvl) || [];
                if (!spells.length) return null;
                return (
                  <div key={lvl} className="print-section">
                    <h2 className="print-section-title">Level {lvl} Spells</h2>
                    {spells.map((spell: any, i: number) => (
                      <div key={i} className="print-spell">
                        <b>{spell.name}</b>{spell.prepared ? ' ✦' : ''} — {spell.castingTime}, {spell.range}
                        <p className="print-spell-desc">{spell.description}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="print-col">
              {[5,6,7,8,9].map(lvl => {
                const spells = stats.spellcasting?.spells?.filter((s: any) => s.level === lvl) || [];
                if (!spells.length) return null;
                return (
                  <div key={lvl} className="print-section">
                    <h2 className="print-section-title">Level {lvl} Spells</h2>
                    {spells.map((spell: any, i: number) => (
                      <div key={i} className="print-spell">
                        <b>{spell.name}</b>{spell.prepared ? ' ✦' : ''} — {spell.castingTime}, {spell.range}
                        <p className="print-spell-desc">{spell.description}</p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
