// Personalización del juego según los datos del Pokémon.
import type { GameSetup } from '../../types/game'
import type { Pokemon } from '../../types/pokemon'
import { createConfig } from './physics'
import { themeForType } from './themes'

/** Si PokeAPI no trae la estadística de Velocidad, se usa un valor intermedio. */
const DEFAULT_SPEED_STAT = 70

/** Doble salto: Pokémon de tipo Volador o con la habilidad Levitación (levitate). */
function doubleJumpReason(pokemon: Pokemon): string | null {
  if (pokemon.types.some(({ type }) => type.name === 'flying')) return 'tipo Volador'
  if (pokemon.abilities.some(({ ability }) => ability.name === 'levitate')) return 'habilidad Levitación'
  return null
}

export function gameSetupFor(pokemon: Pokemon): GameSetup {
  const speedStat = pokemon.stats.find(({ stat }) => stat.name === 'speed')?.base_stat ?? DEFAULT_SPEED_STAT
  const reason = doubleJumpReason(pokemon)
  // La paleta depende del tipo principal (slot 1)
  const mainType = [...pokemon.types].sort((a, b) => a.slot - b.slot)[0]?.type.name
  return {
    config: createConfig(speedStat, reason !== null),
    theme: themeForType(mainType),
    speedStat,
    doubleJumpReason: reason,
  }
}
