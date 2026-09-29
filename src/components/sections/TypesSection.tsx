import type { Pokemon } from '../../types/pokemon'
import { TypeBadge } from '../TypeBadge'

export function TypesSection({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div className="badge-row">
      {pokemon.types.map(({ type }) => (
        <TypeBadge key={type.name} name={type.name} />
      ))}
    </div>
  )
}
