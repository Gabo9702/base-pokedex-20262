import { useCallback, useRef, useState } from 'react'
import { errorMessage, getPokemon, getSpecies, MAX_POKEMON_ID } from '../api/pokeapi'
import type { Pokemon, PokemonSpecies } from '../types/pokemon'
import { normalizeQuery } from '../utils/format'

export interface PokedexEntry {
  pokemon: Pokemon
  species: PokemonSpecies
}

/**
 * Ciclo de vida de la Pokédex:
 * closed → (búsqueda correcta) → opening → (fin de animación) → open
 * open → (cerrar / nueva búsqueda) → closing → (fin de animación) → closed
 * Los cambios opening→open y closing→closed los dispara el componente al
 * recibir `animationend`, nunca un temporizador con tiempo fijo.
 */
export type PokedexState = 'closed' | 'opening' | 'open' | 'closing'

async function fetchEntry(query: string): Promise<PokedexEntry> {
  const pokemon = await getPokemon(query)
  const species = await getSpecies(pokemon.species.url)
  return { pokemon, species }
}

export function usePokedex() {
  const [state, setState] = useState<PokedexState>('closed')
  const [entry, setEntry] = useState<PokedexEntry | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Solo cuenta la última petición: las anteriores se descartan al resolverse.
  const requestId = useRef(0)

  const load = useCallback(async (raw: string | number) => {
    const query = normalizeQuery(String(raw))
    if (!query) {
      setError('Escribe el nombre o el número de un Pokémon.')
      return
    }

    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const next = await fetchEntry(query)
      if (id !== requestId.current) return
      setEntry(next)
      // Desde el buscador se abre con animación; dentro de la Pokédex solo cambia el contenido.
      setState((current) => (current === 'closed' ? 'opening' : current))
    } catch (err) {
      if (id !== requestId.current) return
      setError(errorMessage(err, query))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [])

  /** Pokémon anterior (-1) o siguiente (+1) por número, con vuelta al inicio/final. */
  const step = useCallback(
    (delta: 1 | -1) => {
      if (!entry) return
      const current = entry.species.id
      const next = ((current - 1 + delta + MAX_POKEMON_ID) % MAX_POKEMON_ID) + 1
      void load(next)
    },
    [entry, load],
  )

  const random = useCallback(() => {
    void load(Math.floor(Math.random() * MAX_POKEMON_ID) + 1)
  }, [load])

  /** Inicia el cierre (botón cerrar y "Nueva búsqueda"). Solo es válido con la Pokédex abierta. */
  const close = useCallback(() => {
    requestId.current++ // invalida cualquier petición pendiente
    setLoading(false)
    setError(null)
    setState((current) => (current === 'open' ? 'closing' : current))
  }, [])

  /** Lo llama la Pokédex cuando termina su animación de apertura o de cierre. */
  const finishTransition = useCallback(() => {
    setState((current) => {
      if (current === 'opening') return 'open'
      if (current === 'closing') return 'closed' // desmonta la Pokédex y vuelve al buscador
      return current
    })
  }, [])

  return { state, entry, loading, error, search: load, step, random, close, finishTransition }
}
