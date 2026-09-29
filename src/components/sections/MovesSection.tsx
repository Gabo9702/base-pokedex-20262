import { useState } from 'react'
import type { Pokemon } from '../../types/pokemon'
import { formatName } from '../../utils/format'

const INITIAL_MOVES = 15

export function MovesSection({ pokemon }: { pokemon: Pokemon }) {
  const [expanded, setExpanded] = useState(false)
  const { moves } = pokemon

  if (moves.length === 0) {
    return <p className="muted">Este Pokémon no tiene movimientos registrados.</p>
  }

  const visible = expanded ? moves : moves.slice(0, INITIAL_MOVES)
  const hidden = moves.length - INITIAL_MOVES

  return (
    <>
      <ol className="plain-list plain-list--numbered">
        {visible.map(({ move }) => (
          <li key={move.name}>{formatName(move.name)}</li>
        ))}
      </ol>
      {hidden > 0 && (
        <button type="button" className="text-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? '▲ Ver menos' : `▼ Ver más (${hidden})`}
        </button>
      )}
    </>
  )
}
