import type { PokemonSpecies } from '../../types/pokemon'
import { pickFlavorText } from '../../utils/format'

export function DescriptionSection({ species }: { species: PokemonSpecies }) {
  const entry = pickFlavorText(species.flavor_text_entries)

  if (!entry) return <p className="muted">Sin descripción disponible.</p>

  return (
    <>
      <p>{entry.text}</p>
      {entry.language === 'en' && (
        <p className="muted">(Sin traducción al español: texto en inglés)</p>
      )}
    </>
  )
}
