import type { ChainLink, EvolutionDetail } from '../types/pokemon'
import { formatName } from './format'

export interface EvolutionStage {
  name: string
  depth: number
  /** Cómo se llega a esta etapa; vacío en la etapa inicial. */
  methods: string[]
}

const TRIGGER_LABELS: Record<string, string> = {
  trade: 'Intercambio',
  shed: 'Muda (hueco libre en el equipo)',
  spin: 'Girar sobre sí mismo',
  'tower-of-darkness': 'Torre de la Oscuridad',
  'tower-of-waters': 'Torre del Agua',
  'three-critical-hits': 'Tres golpes críticos en un combate',
  'take-damage': 'Recibir daño',
  'recoil-damage': 'Sufrir daño por retroceso',
  other: 'Método especial',
}

const TIME_LABELS: Record<string, string> = {
  day: 'de día',
  night: 'de noche',
  dusk: 'al atardecer',
}

const RELATIVE_STATS: Record<number, string> = {
  1: 'Ataque > Defensa',
  '-1': 'Defensa > Ataque',
  0: 'Ataque = Defensa',
}

export function describeEvolution(detail: EvolutionDetail): string {
  const trigger = detail.trigger.name
  const parts: string[] = []

  if (trigger === 'level-up') {
    parts.push(detail.min_level ? `Nivel ${detail.min_level}` : 'Subir de nivel')
  } else if (trigger === 'use-item') {
    parts.push(detail.item ? `Usar ${formatName(detail.item.name)}` : 'Usar un objeto')
  } else {
    parts.push(TRIGGER_LABELS[trigger] ?? formatName(trigger))
  }

  if (detail.held_item) parts.push(`llevando ${formatName(detail.held_item.name)}`)
  if (detail.known_move) parts.push(`conociendo ${formatName(detail.known_move.name)}`)
  if (detail.known_move_type) {
    parts.push(`con un movimiento tipo ${formatName(detail.known_move_type.name)}`)
  }
  if (detail.min_happiness) parts.push(`felicidad ≥ ${detail.min_happiness}`)
  if (detail.min_affection) parts.push(`afecto ≥ ${detail.min_affection}`)
  if (detail.min_beauty) parts.push(`belleza ≥ ${detail.min_beauty}`)
  if (detail.time_of_day) parts.push(TIME_LABELS[detail.time_of_day] ?? detail.time_of_day)
  if (detail.location) parts.push(`en ${formatName(detail.location.name)}`)
  if (detail.gender === 1) parts.push('solo hembra')
  if (detail.gender === 2) parts.push('solo macho')
  if (detail.relative_physical_stats !== null) {
    const label = RELATIVE_STATS[detail.relative_physical_stats]
    if (label) parts.push(label)
  }
  if (detail.needs_overworld_rain) parts.push('con lluvia')
  if (detail.turn_upside_down) parts.push('con la consola boca abajo')
  if (detail.party_species) parts.push(`con ${formatName(detail.party_species.name)} en el equipo`)
  if (detail.party_type) parts.push(`con un Pokémon tipo ${formatName(detail.party_type.name)} en el equipo`)
  if (detail.trade_species) parts.push(`por ${formatName(detail.trade_species.name)}`)

  return parts.join(', ')
}

/** Aplana el árbol evolutivo (incluye ramificaciones) en una lista con profundidad. */
export function flattenChain(link: ChainLink, depth = 0): EvolutionStage[] {
  const stage: EvolutionStage = {
    name: link.species.name,
    depth,
    methods: [...new Set(link.evolution_details.map(describeEvolution))],
  }
  return [stage, ...link.evolves_to.flatMap((next) => flattenChain(next, depth + 1))]
}
