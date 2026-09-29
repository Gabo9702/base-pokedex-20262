import type { Pokemon } from '../../types/pokemon'

export function SpritesSection({ pokemon }: { pokemon: Pokemon }) {
  const { sprites } = pokemon
  const items = [
    { label: 'Frontal', src: sprites.front_default },
    { label: 'Trasero', src: sprites.back_default },
    { label: 'Frontal shiny', src: sprites.front_shiny },
    { label: 'Trasero shiny', src: sprites.back_shiny },
  ]

  return (
    <div className="sprite-grid">
      {items.map(({ label, src }) => (
        <figure key={label} className="sprite-grid__item">
          {src ? (
            <img src={src} alt={`${pokemon.name}: ${label.toLowerCase()}`} loading="lazy" />
          ) : (
            <span className="sprite-grid__empty">N/D</span>
          )}
          <figcaption>{label}</figcaption>
        </figure>
      ))}
    </div>
  )
}
