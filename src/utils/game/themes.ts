// Paletas del escenario según el tipo principal del Pokémon.
// El fondo siempre es oscuro, como la pantalla negra de la Pokédex.
import type { GameTheme, PokemonType } from '../../types/game'

const BACKGROUND = '#0b0b0b'

/** Estilo monocromo clásico (blanco y gris sobre negro), para los tipos sin paleta propia. */
const CLASSIC: GameTheme = {
  name: 'Clásico',
  background: BACKGROUND,
  ground: '#d8d8d8',
  groundDetail: '#7a7a7a',
  cloud: '#3a3a3a',
  text: '#f2f2f2',
  textDim: '#9a9a9a',
  accent: '#ffd54a',
  particle: 'none',
  particleColors: [],
}

const FIRE: GameTheme = {
  name: 'Volcán',
  background: BACKGROUND,
  ground: '#e0553a',
  groundDetail: '#8c2a17',
  cloud: '#3b1d17',
  text: '#ffe3d6',
  textDim: '#c98a74',
  accent: '#ffb347',
  particle: 'embers',
  particleColors: ['#ff7a2f', '#ffb347', '#ff4a1c'],
}

const WATER: GameTheme = {
  name: 'Océano',
  background: BACKGROUND,
  ground: '#3f8ef0',
  groundDetail: '#1c4f99',
  cloud: '#16283f',
  text: '#dcebff',
  textDim: '#7fa6d6',
  accent: '#7fe0ff',
  particle: 'bubbles',
  particleColors: ['#7fc4ff', '#b6e0ff'],
}

const FOREST: GameTheme = {
  name: 'Bosque',
  background: BACKGROUND,
  ground: '#62c046',
  groundDetail: '#2f6e22',
  cloud: '#1b3017',
  text: '#e2f7d8',
  textDim: '#8fbf7c',
  accent: '#d6ff6a',
  particle: 'leaves',
  particleColors: ['#62c046', '#a6d93a', '#3f8f2c'],
}

const ELECTRIC: GameTheme = {
  name: 'Tormenta',
  background: BACKGROUND,
  ground: '#f5cf2c',
  groundDetail: '#8f7412',
  cloud: '#2e2a14',
  text: '#fff8d6',
  textDim: '#c9b56a',
  accent: '#fff36b',
  particle: 'sparks',
  particleColors: ['#fff36b', '#ffffff'],
}

const ICE: GameTheme = {
  name: 'Glaciar',
  background: BACKGROUND,
  ground: '#8fdcf0',
  groundDetail: '#4a8ea3',
  cloud: '#1e3138',
  text: '#eafaff',
  textDim: '#94c4d1',
  accent: '#c9f4ff',
  particle: 'snow',
  particleColors: ['#ffffff', '#cdefff'],
}

const MYSTIC: GameTheme = {
  name: 'Noche',
  background: BACKGROUND,
  ground: '#9b6ad6',
  groundDetail: '#553286',
  cloud: '#261b36',
  text: '#efe3ff',
  textDim: '#a58cc9',
  accent: '#f5a8ff',
  particle: 'stars',
  particleColors: ['#ffffff', '#d7b8ff', '#f5a8ff'],
}

const EARTH: GameTheme = {
  name: 'Cañón',
  background: BACKGROUND,
  ground: '#b08453',
  groundDetail: '#6b4d2c',
  cloud: '#2b241c',
  text: '#f3e6d6',
  textDim: '#b39c80',
  accent: '#ffd08a',
  particle: 'none',
  particleColors: [],
}

const STEEL: GameTheme = {
  ...EARTH,
  name: 'Fábrica',
  ground: '#a7abb8',
  groundDetail: '#5d616c',
  cloud: '#23252b',
  text: '#eef0f5',
  textDim: '#9a9fab',
  accent: '#d9e3ff',
}

export const GAME_THEMES: Record<PokemonType, GameTheme> = {
  normal: CLASSIC,
  fighting: CLASSIC,
  poison: CLASSIC,
  flying: CLASSIC,
  dragon: CLASSIC,
  fairy: CLASSIC,
  fire: FIRE,
  water: WATER,
  grass: FOREST,
  bug: FOREST,
  electric: ELECTRIC,
  ice: ICE,
  ghost: MYSTIC,
  dark: MYSTIC,
  psychic: MYSTIC,
  rock: EARTH,
  ground: EARTH,
  steel: STEEL,
}

export function isPokemonType(name: string): name is PokemonType {
  return Object.hasOwn(GAME_THEMES, name)
}

/** Paleta para el tipo principal (o la clásica si el tipo es desconocido). */
export function themeForType(typeName: string | undefined): GameTheme {
  return typeName && isPokemonType(typeName) ? GAME_THEMES[typeName] : CLASSIC
}
