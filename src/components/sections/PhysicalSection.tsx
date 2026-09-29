import type { Pokemon } from '../../types/pokemon'
import { toKilograms, toMeters } from '../../utils/format'

export function PhysicalSection({ pokemon }: { pokemon: Pokemon }) {
  return (
    <dl className="data-list">
      <dt>Altura</dt>
      <dd>{toMeters(pokemon.height)}</dd>
      <dt>Peso</dt>
      <dd>{toKilograms(pokemon.weight)}</dd>
      <dt>Exp. base</dt>
      <dd>{pokemon.base_experience ?? '—'}</dd>
    </dl>
  )
}
