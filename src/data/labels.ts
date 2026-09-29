// Tablas estáticas de traducción y color (los tipos, colores, generaciones y
// hábitats de PokeAPI son conjuntos cerrados).

export interface TypeInfo {
  label: string
  color: string
  /** true si el color es claro y el texto debe ser oscuro */
  light?: boolean
}

export const TYPE_INFO: Record<string, TypeInfo> = {
  normal: { label: 'Normal', color: '#A8A77A' },
  fire: { label: 'Fuego', color: '#EE8130' },
  water: { label: 'Agua', color: '#6390F0' },
  electric: { label: 'Eléctrico', color: '#F7D02C', light: true },
  grass: { label: 'Planta', color: '#7AC74C' },
  ice: { label: 'Hielo', color: '#96D9D6', light: true },
  fighting: { label: 'Lucha', color: '#C22E28' },
  poison: { label: 'Veneno', color: '#A33EA1' },
  ground: { label: 'Tierra', color: '#E2BF65', light: true },
  flying: { label: 'Volador', color: '#A98FF3' },
  psychic: { label: 'Psíquico', color: '#F95587' },
  bug: { label: 'Bicho', color: '#A6B91A' },
  rock: { label: 'Roca', color: '#B6A136' },
  ghost: { label: 'Fantasma', color: '#735797' },
  dragon: { label: 'Dragón', color: '#6F35FC' },
  dark: { label: 'Siniestro', color: '#705746' },
  steel: { label: 'Acero', color: '#B7B7CE', light: true },
  fairy: { label: 'Hada', color: '#D685AD' },
}

/** Los 18 tipos usados para calcular debilidades y resistencias. */
export const TYPE_NAMES = Object.keys(TYPE_INFO)

export const FALLBACK_TYPE: TypeInfo = { label: '???', color: '#777777' }

export const STAT_LABELS: Record<string, string> = {
  hp: 'PS',
  attack: 'Ataque',
  defense: 'Defensa',
  'special-attack': 'At. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidad',
}

export const COLOR_LABELS: Record<string, string> = {
  black: 'Negro',
  blue: 'Azul',
  brown: 'Marrón',
  gray: 'Gris',
  green: 'Verde',
  pink: 'Rosa',
  purple: 'Morado',
  red: 'Rojo',
  white: 'Blanco',
  yellow: 'Amarillo',
}

export const HABITAT_LABELS: Record<string, string> = {
  cave: 'Cueva',
  forest: 'Bosque',
  grassland: 'Pradera',
  mountain: 'Montaña',
  rare: 'Raro',
  'rough-terrain': 'Terreno accidentado',
  sea: 'Mar',
  urban: 'Urbano',
  'waters-edge': 'Orilla del agua',
}

export interface SectionInfo {
  title: string
  short: string
}

/** Contenido de cada botón azul (índice = número del botón). */
export const SECTIONS: readonly SectionInfo[] = [
  { title: 'Descripción', short: 'DESC' },
  { title: 'Tipos', short: 'TIPO' },
  { title: 'Estadísticas base', short: 'STAT' },
  { title: 'Habilidades', short: 'HAB' },
  { title: 'Datos físicos', short: 'FÍS' },
  { title: 'Movimientos', short: 'MOV' },
  { title: 'Cadena evolutiva', short: 'EVO' },
  { title: 'Especie', short: 'ESP' },
  { title: 'Sprites', short: 'SPR' },
  { title: 'Debilidades y resistencias', short: 'DEB' },
]
