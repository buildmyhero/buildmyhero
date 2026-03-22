import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
import { CharacterData } from '@/types/character';

interface Character {
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
}

// ── Colour palette ──────────────────────────────────────────────
const C = {
  black:    [20,  20,  20]  as [number,number,number],
  darkGray: [60,  60,  60]  as [number,number,number],
  midGray:  [120, 120, 120] as [number,number,number],
  lightGray:[220, 220, 220] as [number,number,number],
  offWhite: [245, 245, 245] as [number,number,number],
  white:    [255, 255, 255] as [number,number,number],
  red:      [180, 40,  40]  as [number,number,number],
  gold:     [180, 140, 40]  as [number,number,number],
  purple:   [90,  60,  160] as [number,number,number],
  darkPurple:[50, 30, 100]  as [number,number,number],
};

// ── Drawing helpers ─────────────────────────────────────────────
function box(
  pdf: jsPDF,
  x: number, y: number, w: number, h: number,
  opts: { fill?: [number,number,number]; stroke?: [number,number,number]; r?: number; lw?: number } = {}
) {
  pdf.setLineWidth(opts.lw ?? 0.3);
  if (opts.fill)   { pdf.setFillColor(...opts.fill);   }
  if (opts.stroke) { pdf.setDrawColor(...opts.stroke); } else { pdf.setDrawColor(...C.black); }
  if (opts.r) {
    if (opts.fill && opts.stroke) pdf.roundedRect(x, y, w, h, opts.r, opts.r, 'FD');
    else if (opts.fill)           pdf.roundedRect(x, y, w, h, opts.r, opts.r, 'F');
    else                          pdf.roundedRect(x, y, w, h, opts.r, opts.r, 'D');
  } else {
    if (opts.fill && opts.stroke) pdf.rect(x, y, w, h, 'FD');
    else if (opts.fill)           pdf.rect(x, y, w, h, 'F');
    else                          pdf.rect(x, y, w, h, 'D');
  }
}

function label(
  pdf: jsPDF,
  text: string,
  x: number, y: number,
  opts: { size?: number; bold?: boolean; color?: [number,number,number]; align?: 'left'|'center'|'right' } = {}
) {
  pdf.setFontSize(opts.size ?? 7);
  pdf.setFont('helvetica', opts.bold ? 'bold' : 'normal');
  pdf.setTextColor(...(opts.color ?? C.black));
  pdf.text(text, x, y, { align: opts.align ?? 'left' });
}

function sectionHeader(pdf: jsPDF, text: string, x: number, y: number, w: number) {
  box(pdf, x, y, w, 5, { fill: C.darkPurple });
  label(pdf, text, x + w/2, y + 3.6, { size: 6, bold: true, color: C.white, align: 'center' });
}

function circle(pdf: jsPDF, cx: number, cy: number, r: number, filled = false) {
  pdf.setLineWidth(0.25);
  pdf.setDrawColor(...C.black);
  if (filled) { pdf.setFillColor(...C.black); pdf.circle(cx, cy, r, 'FD'); }
  else        { pdf.circle(cx, cy, r, 'D'); }
}

function fmt(n: number) { return n >= 0 ? `+${n}` : `${n}`; }

function wrapText(pdf: jsPDF, text: string, x: number, y: number, maxW: number, lineH: number, maxLines = 99): number {
  const lines = pdf.splitTextToSize(text || '', maxW);
  let written = 0;
  for (const l of lines) {
    if (written >= maxLines) break;
    pdf.text(l, x, y + written * lineH);
    written++;
  }
  return written * lineH;
}

// ════════════════════════════════════════════════════════════════
//  PAGE 1 — CHARACTER SHEET
// ════════════════════════════════════════════════════════════════
function buildPage1(pdf: jsPDF, c: Character) {
  const s = c.character_data as any;
  const PW = 210, PH = 297;
  const M  = 8;   // outer margin

  // Background
  box(pdf, 0, 0, PW, PH, { fill: C.offWhite });

  // ── HEADER ────────────────────────────────────────────────────
  box(pdf, 0, 0, PW, 18, { fill: C.darkPurple });
  label(pdf, 'BUILDMYHERO', M, 7, { size: 14, bold: true, color: C.gold });
  label(pdf, 'CHARACTER SHEET', M, 13, { size: 7, color: C.lightGray });

  // Header fields (right side)
  const hFields = [
    { label: 'CHARACTER NAME', value: c.character_name },
    { label: 'CLASS & LEVEL',  value: `${c.character_class} ${c.level}` },
    { label: 'RACE',           value: c.race },
    { label: 'BACKGROUND',     value: s?.background?.name ?? '' },
    { label: 'ALIGNMENT',      value: s?.alignment ?? '' },
    { label: 'RULESET',        value: `D&D ${c.ruleset}` },
  ];
  const hx = 70, hw = (PW - hx - M) / 3;
  hFields.forEach((f, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = hx + col * hw, y = row * 9;
    label(pdf, f.label, x + 1, y + 4, { size: 5, color: C.lightGray });
    label(pdf, f.value, x + 1, y + 9, { size: 7, bold: true, color: C.white });
    pdf.setDrawColor(...C.midGray); pdf.setLineWidth(0.2);
    pdf.line(x, y + 10, x + hw - 1, y + 10);
  });

  // ── LAYOUT COLUMNS ───────────────────────────────────────────
  const bodyY = 21;
  const LC = { x: M,      w: 38 };   // left col
  const CC = { x: 49,     w: 60 };   // centre col
  const RC = { x: 113,    w: PW - 113 - M }; // right col

  let ly = bodyY;  // left y cursor
  let cy2 = bodyY; // centre y cursor
  let ry = bodyY;  // right y cursor

  // ── LEFT COLUMN ───────────────────────────────────────────────

  // ABILITY SCORES
  const abilities = ['strength','dexterity','constitution','intelligence','wisdom','charisma'];
  const abbrMap: Record<string,string> = {
    strength:'STR', dexterity:'DEX', constitution:'CON',
    intelligence:'INT', wisdom:'WIS', charisma:'CHA'
  };
  const aScores = s?.abilityScores ?? {};
  const aMods   = s?.abilityModifiers ?? {};
  const saves   = s?.savingThrows ?? {};

  abilities.forEach(ab => {
    const score = aScores[ab] ?? 10;
    const mod   = aMods[ab]   ?? 0;
    const save  = saves[ab];
    const bx = LC.x, bw = LC.w, bh = 13;

    // Outer box
    box(pdf, bx, ly, bw, bh, { fill: C.white, stroke: C.darkGray, r: 1.5, lw: 0.4 });
    // Ability name banner
    box(pdf, bx, ly, bw, 4.5, { fill: C.darkPurple, r: 1 });
    label(pdf, abbrMap[ab], bx + bw/2, ly + 3.2, { size: 6, bold: true, color: C.white, align: 'center' });
    // Score (big)
    label(pdf, String(score), bx + bw/2, ly + 9.5, { size: 13, bold: true, color: C.black, align: 'center' });
    // Modifier circle
    const modX = bx + bw/2, modY = ly + bh + 2;
    circle(pdf, modX, modY, 3.5);
    label(pdf, fmt(mod), modX, modY + 1.2, { size: 7, bold: true, align: 'center' });

    ly += bh + 6;
  });

  ly += 2;

  // INSPIRATION + PROFICIENCY
  [['INSPIRATION', ''], ['PROFICIENCY BONUS', fmt(s?.proficiencyBonus ?? 2)]].forEach(([lbl, val]) => {
    box(pdf, LC.x, ly, LC.w, 6, { fill: C.white, stroke: C.darkGray });
    label(pdf, lbl, LC.x + 2, ly + 4, { size: 5.5, bold: true });
    if (val) label(pdf, val, LC.x + LC.w - 3, ly + 4, { size: 8, bold: true, align: 'right', color: C.purple });
    ly += 7;
  });
  ly += 2;

  // SAVING THROWS
  sectionHeader(pdf, 'SAVING THROWS', LC.x, ly, LC.w); ly += 6;
  abilities.forEach(ab => {
    const save = saves[ab];
    const prof = save?.proficient ?? false;
    const bonus = save?.bonus ?? (aMods[ab] ?? 0);
    circle(pdf, LC.x + 2.5, ly - 0.8, 1.2, prof);
    label(pdf, fmt(bonus), LC.x + 6, ly, { size: 6, bold: prof });
    label(pdf, abbrMap[ab], LC.x + 12, ly, { size: 6 });
    ly += 4;
  });
  ly += 3;

  // SKILLS
  sectionHeader(pdf, 'SKILLS', LC.x, ly, LC.w); ly += 6;
  const skills = s?.skills ?? [];
  const skillAbbrMap: Record<string,string> = {
    'Acrobatics':'Dex','Animal Handling':'Wis','Arcana':'Int','Athletics':'Str',
    'Deception':'Cha','History':'Int','Insight':'Wis','Intimidation':'Cha',
    'Investigation':'Int','Medicine':'Wis','Nature':'Int','Perception':'Wis',
    'Performance':'Cha','Persuasion':'Cha','Religion':'Int','Sleight of Hand':'Dex',
    'Stealth':'Dex','Survival':'Wis',
  };
  skills.forEach((sk: any) => {
    const prof = sk.proficient;
    const expert = sk.expertise;
    circle(pdf, LC.x + 2.5, ly - 0.8, 1.2, prof);
    if (expert) { pdf.setFillColor(...C.gold); pdf.circle(LC.x + 2.5, ly - 0.8, 0.8, 'F'); }
    label(pdf, fmt(sk.bonus ?? 0), LC.x + 6, ly, { size: 5.5, bold: prof });
    const abbr = skillAbbrMap[sk.name] ?? '';
    label(pdf, `${sk.name} (${abbr})`, LC.x + 12, ly, { size: 5.5 });
    ly += 3.8;
  });
  ly += 2;

  // PASSIVE PERCEPTION
  box(pdf, LC.x, ly, LC.w, 6, { fill: C.white, stroke: C.darkGray });
  label(pdf, 'PASSIVE PERCEPTION', LC.x + 2, ly + 2.5, { size: 4.5, bold: true });
  label(pdf, String(s?.passivePerception ?? 10), LC.x + LC.w - 3, ly + 4.5, { size: 9, bold: true, align: 'right', color: C.purple });
  ly += 8;

  // PROFICIENCIES & LANGUAGES
  const prof = s?.proficiencies ?? {};
  sectionHeader(pdf, 'PROFICIENCIES & LANGUAGES', LC.x, ly, LC.w); ly += 6;
  const profLines: string[] = [
    ...(prof.armor?.length   ? [`Armor: ${prof.armor.join(', ')}`]     : []),
    ...(prof.weapons?.length ? [`Weapons: ${prof.weapons.join(', ')}`] : []),
    ...(prof.tools?.length   ? [`Tools: ${prof.tools.join(', ')}`]     : []),
    ...(prof.languages?.length ? [`Languages: ${prof.languages.join(', ')}`] : []),
  ];
  pdf.setFontSize(5.5); pdf.setFont('helvetica','normal'); pdf.setTextColor(...C.black);
  profLines.forEach(pl => {
    const wrapped = pdf.splitTextToSize(pl, LC.w - 2);
    wrapped.forEach((wl: string) => { pdf.text(wl, LC.x + 1, ly); ly += 3.5; });
  });

  // ── CENTRE COLUMN ────────────────────────────────────────────

  // Core combat stats row
  const statDefs = [
    { label: 'AC',    value: String(s?.armorClass ?? '—') },
    { label: 'INIT',  value: fmt(s?.initiative ?? 0) },
    { label: 'SPEED', value: `${s?.speed ?? 30}ft` },
    { label: 'HP MAX',value: String(s?.hitPoints?.maximum ?? '—') },
    { label: 'HIT DICE', value: `${s?.hitDice?.total ?? c.level}${s?.hitDice?.type ?? 'd8'}` },
  ];
  const sw = (CC.w - 2) / statDefs.length;
  statDefs.forEach((st, i) => {
    const sx = CC.x + i * sw;
    box(pdf, sx, cy2, sw - 1, 14, { fill: C.white, stroke: C.darkGray, r: 1 });
    label(pdf, st.label, sx + (sw-1)/2, cy2 + 4.5, { size: 5, bold: true, color: C.midGray, align: 'center' });
    label(pdf, st.value, sx + (sw-1)/2, cy2 + 11, { size: 10, bold: true, align: 'center' });
  });
  cy2 += 16;

  // HP current + temp
  box(pdf, CC.x, cy2, CC.w / 2 - 1, 10, { fill: C.white, stroke: C.darkGray });
  label(pdf, 'CURRENT HP', CC.x + 1, cy2 + 4, { size: 5, bold: true, color: C.midGray });
  label(pdf, String(s?.hitPoints?.current ?? s?.hitPoints?.maximum ?? '—'), CC.x + 1, cy2 + 9, { size: 9, bold: true, color: C.red });

  box(pdf, CC.x + CC.w/2, cy2, CC.w/2 - 1, 10, { fill: C.white, stroke: C.darkGray });
  label(pdf, 'TEMP HP', CC.x + CC.w/2 + 1, cy2 + 4, { size: 5, bold: true, color: C.midGray });
  label(pdf, String(s?.hitPoints?.temporary ?? 0), CC.x + CC.w/2 + 1, cy2 + 9, { size: 9, bold: true });
  cy2 += 12;

  // Death saves
  box(pdf, CC.x, cy2, CC.w - 1, 10, { fill: C.white, stroke: C.darkGray });
  label(pdf, 'DEATH SAVES', CC.x + 1, cy2 + 3.5, { size: 5.5, bold: true });
  ['SUCCESSES','FAILURES'].forEach((lbl, row) => {
    label(pdf, lbl, CC.x + 2, cy2 + 5 + row * 4, { size: 4.5 });
    [0,1,2].forEach(i => circle(pdf, CC.x + 28 + i*5, cy2 + 4 + row*4, 1.5));
  });
  cy2 += 12;

  // Portrait
  const portH = 55;
  box(pdf, CC.x, cy2, CC.w - 1, portH, { fill: C.lightGray, stroke: C.darkGray });
  label(pdf, c.character_name.toUpperCase(), CC.x + (CC.w-1)/2, cy2 + portH/2 - 3, { size: 8, bold: true, align: 'center', color: C.midGray });
  label(pdf, `${c.race} · ${c.character_class}`, CC.x + (CC.w-1)/2, cy2 + portH/2 + 3, { size: 6, align: 'center', color: C.midGray });
  label(pdf, '[ portrait ]', CC.x + (CC.w-1)/2, cy2 + portH/2 + 9, { size: 5.5, align: 'center', color: C.lightGray });
  cy2 += portH + 2;

  // ATTACKS
  sectionHeader(pdf, 'ATTACKS & SPELLCASTING', CC.x, cy2, CC.w - 1); cy2 += 6;
  const atkCols = [['WEAPON / SPELL', 28], ['ATK', 8], ['DAMAGE / TYPE', 20]] as [string,number][];
  let ax = CC.x;
  atkCols.forEach(([lbl, w]) => {
    label(pdf, lbl, ax + 1, cy2, { size: 5, bold: true, color: C.midGray });
    ax += w;
  });
  cy2 += 2;
  pdf.setDrawColor(...C.lightGray); pdf.setLineWidth(0.2);
  pdf.line(CC.x, cy2, CC.x + CC.w - 1, cy2);
  cy2 += 2;

  // Build weapon list from equipment
  const weaponKeywords = ['sword','bow','dagger','axe','staff','mace','crossbow','spear','club','flail','rapier','scimitar','trident','lance','pike','whip','dart','sling','javelin','quarterstaff','greatclub','hammer','maul','morningstar','battleaxe'];
  const equip = s?.equipment ?? [];
  const weapons = equip.filter((e: any) =>
    weaponKeywords.some(k => e.name?.toLowerCase().includes(k)) || e.equipped
  ).slice(0, 5);

  if (weapons.length === 0 && equip.length > 0) weapons.push(...equip.slice(0, 3));

  weapons.forEach((w: any) => {
    const lineY = cy2 + 3;
    label(pdf, w.name ?? '', CC.x + 1, lineY, { size: 6 });
    label(pdf, '—', CC.x + 29, lineY, { size: 6 });
    label(pdf, w.description ?? '—', CC.x + 38, lineY, { size: 5.5 });
    cy2 += 5;
    pdf.setDrawColor(...C.lightGray); pdf.line(CC.x, cy2, CC.x + CC.w - 1, cy2);
  });
  // Fill remaining rows
  for (let i = weapons.length; i < 5; i++) {
    cy2 += 5;
    pdf.setDrawColor(...C.lightGray); pdf.line(CC.x, cy2, CC.x + CC.w - 1, cy2);
  }
  cy2 += 4;

  // FEATURES & TRAITS (bottom of centre)
  sectionHeader(pdf, 'FEATURES & TRAITS', CC.x, cy2, CC.w - 1); cy2 += 6;
  const features = s?.features ?? [];
  features.slice(0, 8).forEach((f: any) => {
    pdf.setFontSize(5.5); pdf.setFont('helvetica','bold'); pdf.setTextColor(...C.purple);
    pdf.text(f.name ?? '', CC.x + 1, cy2);
    pdf.setFont('helvetica','normal'); pdf.setTextColor(...C.black);
    const desc = pdf.splitTextToSize(f.description ?? '', CC.w - 4);
    desc.slice(0, 2).forEach((dl: string, di: number) => {
      pdf.text(dl, CC.x + 1, cy2 + (di + 1) * 3.2);
    });
    cy2 += (Math.min(desc.length, 2) + 1) * 3.2 + 1;
    if (cy2 > PH - M - 10) return;
  });

  // ── RIGHT COLUMN ─────────────────────────────────────────────

  // Personality boxes
  const persBoxes = [
    ['PERSONALITY TRAITS', s?.personality?.traits?.join(' ') ?? ''],
    ['IDEALS',             s?.personality?.ideals?.join(' ') ?? ''],
    ['BONDS',              s?.personality?.bonds?.join(' ')  ?? ''],
    ['FLAWS',              s?.personality?.flaws?.join(' ')  ?? ''],
  ];
  persBoxes.forEach(([lbl, val]) => {
    sectionHeader(pdf, lbl, RC.x, ry, RC.w); ry += 6;
    box(pdf, RC.x, ry, RC.w, 18, { fill: C.white, stroke: C.lightGray });
    pdf.setFontSize(5.5); pdf.setFont('helvetica','normal'); pdf.setTextColor(...C.black);
    const lines = pdf.splitTextToSize(val, RC.w - 2);
    lines.slice(0, 5).forEach((l: string, i: number) => pdf.text(l, RC.x + 1, ry + 4 + i * 3.2));
    ry += 20;
  });
  ry += 2;

  // EQUIPMENT list (right col)
  sectionHeader(pdf, 'EQUIPMENT', RC.x, ry, RC.w); ry += 6;
  box(pdf, RC.x, ry, RC.w, 45, { fill: C.white, stroke: C.lightGray });
  equip.slice(0, 12).forEach((item: any, i: number) => {
    const name = item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name;
    label(pdf, `• ${name}`, RC.x + 1, ry + 4 + i * 3.5, { size: 5.5 });
  });
  ry += 47;

  // BACKSTORY snippet
  if (s?.backstory) {
    sectionHeader(pdf, 'BACKSTORY', RC.x, ry, RC.w); ry += 6;
    box(pdf, RC.x, ry, RC.w, 30, { fill: C.white, stroke: C.lightGray });
    pdf.setFontSize(5); pdf.setFont('helvetica','normal'); pdf.setTextColor(...C.black);
    const bLines = pdf.splitTextToSize(s.backstory, RC.w - 2);
    bLines.slice(0, 9).forEach((l: string, i: number) => pdf.text(l, RC.x + 1, ry + 3.5 + i * 3));
    ry += 32;
  }

  // Footer
  pdf.setFontSize(6); pdf.setTextColor(...C.midGray);
  pdf.text('Generated by BuildMyHero.app', PW/2, PH - 4, { align: 'center' });
}

// ════════════════════════════════════════════════════════════════
//  PAGE 2 — SPELL SHEET (only for spellcasters)
// ════════════════════════════════════════════════════════════════
function buildSpellPage(pdf: jsPDF, c: Character) {
  const s  = c.character_data as any;
  const sc = s?.spellcasting;
  if (!sc) return;

  pdf.addPage();
  const PW = 210, PH = 297, M = 8;

  box(pdf, 0, 0, PW, PH, { fill: C.offWhite });

  // Header
  box(pdf, 0, 0, PW, 18, { fill: C.darkPurple });
  label(pdf, 'BUILDMYHERO', M, 7,  { size: 14, bold: true, color: C.gold });
  label(pdf, 'SPELLCASTING SHEET', M, 13, { size: 7, color: C.lightGray });

  // Spellcasting stats
  const statX = [90, 130, 170];
  const statLabels = ['SPELLCASTING ABILITY', 'SPELL SAVE DC', 'SPELL ATTACK BONUS'];
  const statVals = [
    String(sc.ability ?? '—').toUpperCase(),
    String(sc.spellSaveDC ?? '—'),
    fmt(sc.spellAttackBonus ?? 0),
  ];
  statLabels.forEach((lbl, i) => {
    box(pdf, statX[i], 1, 36, 16, { fill: C.white, stroke: C.midGray, r: 1 });
    label(pdf, lbl, statX[i] + 18, 6,  { size: 4.5, bold: true, color: C.midGray, align: 'center' });
    label(pdf, statVals[i], statX[i] + 18, 13, { size: 12, bold: true, color: C.purple, align: 'center' });
  });

  // Character & class info
  label(pdf, c.character_name, M, 8, { size: 11, bold: true, color: C.white });
  label(pdf, `${c.character_class} — Level ${c.level}`, M, 14, { size: 7, color: C.lightGray });

  let y = 22;

  // Spell slots tracker
  const slots = sc.spellSlots ?? [];
  if (slots.length > 0) {
    sectionHeader(pdf, 'SPELL SLOTS', M, y, PW - M*2); y += 6;
    box(pdf, M, y, PW - M*2, 14, { fill: C.white, stroke: C.lightGray });
    const slotW = (PW - M*2) / slots.length;
    slots.forEach((slot: any, i: number) => {
      const sx = M + i * slotW;
      label(pdf, `Level ${slot.level}`, sx + slotW/2, y + 4, { size: 5.5, bold: true, align: 'center', color: C.midGray });
      label(pdf, `${slot.total - (slot.used ?? 0)} / ${slot.total}`, sx + slotW/2, y + 9, { size: 8, bold: true, align: 'center' });
      // Slot circles
      for (let ci = 0; ci < slot.total; ci++) {
        circle(pdf, sx + 4 + ci * 4, y + 12.5, 1.5, ci < (slot.used ?? 0));
      }
    });
    y += 16;
  }
  y += 2;

  // Three-column spell layout (matches WotC spell sheet)
  const allSpells = sc.spells ?? [];
  const cantrips  = allSpells.filter((sp: any) => sp.level === 0);
  const byLevel   = (lvl: number) => allSpells.filter((sp: any) => sp.level === lvl);

  // Column definitions: [left: 0,1,2] [mid: 3,4,5] [right: 6,7,8,9]
  const colW = (PW - M*2 - 4) / 3;
  const cols = [
    { x: M,                groups: [{ level: 0, spells: cantrips }, { level: 1, spells: byLevel(1) }, { level: 2, spells: byLevel(2) }] },
    { x: M + colW + 2,    groups: [{ level: 3, spells: byLevel(3) }, { level: 4, spells: byLevel(4) }, { level: 5, spells: byLevel(5) }] },
    { x: M + (colW+2)*2,  groups: [{ level: 6, spells: byLevel(6) }, { level: 7, spells: byLevel(7) }, { level: 8, spells: byLevel(8) }, { level: 9, spells: byLevel(9) }] },
  ];

  cols.forEach(col => {
    let cy3 = y;
    col.groups.forEach(grp => {
      if (grp.spells.length === 0 && grp.level > 0) return;

      // Level banner
      box(pdf, col.x, cy3, colW, 5.5, { fill: grp.level === 0 ? C.darkPurple : C.darkGray, r: 1 });
      const bannerLabel = grp.level === 0 ? 'CANTRIPS' : `LEVEL ${grp.level}`;
      label(pdf, bannerLabel, col.x + colW/2, cy3 + 3.8, { size: 6, bold: true, color: C.white, align: 'center' });

      // Slot tracker inline (for non-cantrips)
      if (grp.level > 0) {
        const slotInfo = slots.find((sl: any) => sl.level === grp.level);
        if (slotInfo) {
          label(pdf, `${slotInfo.total - (slotInfo.used ?? 0)}/${slotInfo.total} slots`, col.x + colW - 1, cy3 + 3.8, { size: 4.5, color: C.gold, align: 'right' });
        }
      }
      cy3 += 6;

      // Spell lines
      const maxSpells = grp.level === 0 ? 8 : 13;
      const existing = grp.spells.slice(0, maxSpells);
      const blanks   = Math.max(0, (grp.level === 0 ? 6 : 8) - existing.length);

      existing.forEach((sp: any) => {
        const isPrepared = sp.prepared;
        circle(pdf, col.x + 2, cy3 - 0.5, 1.2, isPrepared);
        pdf.setFontSize(5.5); pdf.setFont('helvetica', isPrepared ? 'bold' : 'normal');
        pdf.setTextColor(...(isPrepared ? C.purple : C.black));
        pdf.text(sp.name ?? '', col.x + 5, cy3);
        // Casting time + school in smaller text
        if (sp.castingTime || sp.school) {
          pdf.setFontSize(4.2); pdf.setFont('helvetica','normal'); pdf.setTextColor(...C.midGray);
          pdf.text(`${sp.castingTime ?? ''} ${sp.school ?? ''}`.trim(), col.x + 5, cy3 + 2.8);
          cy3 += 5.5;
        } else {
          cy3 += 4;
        }
        // Underline
        pdf.setDrawColor(...C.lightGray); pdf.setLineWidth(0.2);
        pdf.line(col.x + 1, cy3 - 0.5, col.x + colW - 1, cy3 - 0.5);
      });

      // Blank lines
      for (let b = 0; b < blanks; b++) {
        cy3 += 4;
        pdf.setDrawColor(...C.lightGray); pdf.setLineWidth(0.2);
        circle(pdf, col.x + 2, cy3 - 0.5, 1.2);
        pdf.line(col.x + 5, cy3 - 0.5, col.x + colW - 1, cy3 - 0.5);
      }
      cy3 += 3;
    });
  });

  // Footer
  pdf.setFontSize(6); pdf.setTextColor(...C.midGray);
  pdf.text('Generated by BuildMyHero.app', PW/2, PH - 4, { align: 'center' });
}

// ════════════════════════════════════════════════════════════════
//  HOOK
// ════════════════════════════════════════════════════════════════
export function usePdfGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async (character: Character): Promise<void> => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      buildPage1(pdf, character);

      const s = character.character_data as any;
      if (s?.spellcasting) buildSpellPage(pdf, character);

      const fileName = `${character.character_name.replace(/\s+/g, '_')}_Character_Sheet.pdf`;
      pdf.save(fileName);
      toast.success('Character sheet downloaded!');
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return { isGenerating, generatePdf };
}
