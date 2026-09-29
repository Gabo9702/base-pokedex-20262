import { TYPE_NAMES } from '../data/labels'
import type { PokemonTypeData } from '../types/pokemon'

export type Multiplier = 4 | 2 | 0.5 | 0.25 | 0

/** Orden de presentación de los grupos. */
export const MULTIPLIERS: readonly Multiplier[] = [4, 2, 0.5, 0.25, 0]

export const MULTIPLIER_LABELS: Record<Multiplier, string> = {
  4: 'x4',
  2: 'x2',
  0.5: 'x½',
  0.25: 'x¼',
  0: 'x0',
}

export type Matchups = Record<Multiplier, string[]>

/**
 * Multiplicador de daño que recibe el Pokémon por cada tipo atacante,
 * combinando sus tipos defensivos (uno o dos). Los valores neutros (x1) se omiten.
 */
export function calculateMatchups(defenderTypes: PokemonTypeData[]): Matchups {
  const result: Matchups = { 4: [], 2: [], 0.5: [], 0.25: [], 0: [] }

  for (const attacker of TYPE_NAMES) {
    let multiplier = 1
    for (const defender of defenderTypes) {
      const relations = defender.damage_relations
      const has = (list: { name: string }[]) => list.some((t) => t.name === attacker)
      if (has(relations.no_damage_from)) multiplier *= 0
      else if (has(relations.double_damage_from)) multiplier *= 2
      else if (has(relations.half_damage_from)) multiplier *= 0.5
    }
    if (multiplier !== 1) result[multiplier as Multiplier].push(attacker)
  }

  return result
}
