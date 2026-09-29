import type { Pokemon } from '../../types/pokemon'
import { formatName } from '../../utils/format'

export function AbilitiesSection({ pokemon }: { pokemon: Pokemon }) {
  const abilities = [...pokemon.abilities].sort((a, b) => a.slot - b.slot)

  return (
    <ul className="plain-list">
      {abilities.map(({ ability, is_hidden }) => (
        <li key={ability.name}>
          {formatName(ability.name)}
          {is_hidden && <span className="tag">Oculta</span>}
        </li>
      ))}
    </ul>
  )
}
