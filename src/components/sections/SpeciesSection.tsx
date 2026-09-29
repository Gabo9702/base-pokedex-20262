import { COLOR_LABELS, HABITAT_LABELS } from '../../data/labels'
import type { PokemonSpecies } from '../../types/pokemon'
import { formatGeneration, formatName, pickGenus } from '../../utils/format'

function rarity(species: PokemonSpecies): string {
  if (species.is_legendary) return 'Legendario'
  if (species.is_mythical) return 'Mítico'
  return 'No'
}

export function SpeciesSection({ species }: { species: PokemonSpecies }) {
  const { habitat, color } = species

  return (
    <dl className="data-list">
      <dt>Categoría</dt>
      <dd>{pickGenus(species.genera) ?? '—'}</dd>
      <dt>Generación</dt>
      <dd>{formatGeneration(species.generation.name)}</dd>
      <dt>Hábitat</dt>
      <dd>{habitat ? (HABITAT_LABELS[habitat.name] ?? formatName(habitat.name)) : 'Desconocido'}</dd>
      <dt>Color</dt>
      <dd>{COLOR_LABELS[color.name] ?? formatName(color.name)}</dd>
      <dt>Legendario / mítico</dt>
      <dd>{rarity(species)}</dd>
    </dl>
  )
}
