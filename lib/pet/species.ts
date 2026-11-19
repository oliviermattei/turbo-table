import type { Rarity } from '../game/types';

/** Movement profile: a CSS animation applied to the static image (see .mv-* in globals.css). */
export type Move = 'sautille' | 'tortille' | 'voltige' | 'lourde' | 'flotte' | 'nage';
export interface Species { id: string; name: string; q: Rarity; move: Move }

const S = (q: Rarity, list: [string, string, Move][]) => list.map(([id, name, move]) => ({ id, name, q, move }));

/** The bestiary chosen in docs/Bestiaire.md. A species only appears in eggs once its images exist (assets.json). */
export const SPECIES: Species[] = [
  ...S('commun', [
    ['chaton', 'Chaton', 'sautille'], ['chiot', 'Chiot', 'sautille'], ['lapin', 'Lapin', 'sautille'],
    ['cochon', 'Cochon', 'lourde'], ['vache', 'Vache', 'lourde'], ['canard', 'Canard', 'nage'],
    ['poisson-rouge', 'Poisson rouge', 'nage'], ['ane', 'Âne', 'lourde'], ['tortue', 'Tortue', 'lourde'],
    ['perruche', 'Perruche', 'voltige'], ['herisson', 'Hérisson', 'tortille'],
  ]),
  ...S('peu-commun', [
    ['fennec', 'Fennec', 'sautille'], ['panda-roux', 'Panda roux', 'sautille'], ['axolotl', 'Axolotl', 'nage'],
    ['loutre', 'Loutre', 'nage'], ['manchot', 'Manchot', 'lourde'], ['chouette', 'Chouette', 'voltige'],
    ['koala', 'Koala', 'lourde'], ['hippocampe', 'Hippocampe', 'nage'], ['toucan', 'Toucan', 'voltige'],
    ['slime', 'Slime', 'tortille'],
  ]),
  ...S('rare', [
    ['champignouf', 'Champignouf', 'sautille'], ['lumignon', 'Lumignon', 'voltige'], ['nuagichat', 'Nuagichat', 'flotte'],
    ['rainette-fleurie', 'Rainette Fleurie', 'sautille'], ['cactouille', 'Cactouille', 'tortille'],
    ['meduluce', 'Méduluce', 'nage'], ['rocaillou', 'Rocaillou', 'lourde'],
  ]),
  ...S('epique', [
    ['lion-de-braise', 'Lion de Braise', 'lourde'], ['ours-glacier', 'Ours Glacier', 'lourde'],
    ['cerf-de-cristal', 'Cerf de Cristal', 'sautille'], ['hibou-astral', 'Hibou Astral', 'flotte'],
    ['loup-de-lune', 'Loup de Lune', 'sautille'],
  ]),
  ...S('legendaire', [
    ['licorne-aurore', 'Licorne Arc-en-ciel', 'flotte'], ['phenix-solaire', 'Phénix Solaire', 'voltige'],
    ['renard-celeste', 'Renard Céleste', 'sautille'],
  ]),
];
export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(SPECIES.map(s => [s.id, s]));
