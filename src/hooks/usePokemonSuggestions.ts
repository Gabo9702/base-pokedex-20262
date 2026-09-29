import { useEffect, useMemo, useState } from 'react'
import { getPokemonNames, peekPokemonNames } from '../api/pokeapi'
import type { NamedAPIResource, PokemonSuggestion } from '../types/pokemon'
import { idFromResourceUrl, normalizeQuery } from '../utils/format'

const DEBOUNCE_MS = 250
const MAX_SUGGESTIONS = 8
const MIN_LENGTH = 2
const SPRITE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'

export interface PokemonSuggestionsResult {
  /** Máximo 8 coincidencias: primero las que empiezan con el texto y luego las que lo contienen. */
  suggestions: PokemonSuggestion[]
  /** Texto normalizado con el que se filtró (sirve para resaltar la coincidencia). */
  term: string
  /** false si no hay que mostrar la lista: búsqueda numérica, muy corta o nombres sin cargar. */
  active: boolean
}

/** Solo se sugieren nombres: nada de números ni búsquedas de menos de 2 caracteres. */
function isSuggestible(term: string): boolean {
  return term.length >= MIN_LENGTH && !/^\d+$/.test(term)
}

function toSuggestion({ name, url }: NamedAPIResource): PokemonSuggestion | null {
  const id = idFromResourceUrl(url)
  return id === null ? null : { id, name, sprite: `${SPRITE_URL}/${id}.png` }
}

function filterNames(names: NamedAPIResource[], term: string): PokemonSuggestion[] {
  const startsWith: NamedAPIResource[] = []
  const contains: NamedAPIResource[] = []
  for (const resource of names) {
    if (resource.name.startsWith(term)) startsWith.push(resource)
    else if (resource.name.includes(term)) contains.push(resource)
  }
  return [...startsWith, ...contains]
    .slice(0, MAX_SUGGESTIONS)
    .map(toSuggestion)
    .filter((suggestion): suggestion is PokemonSuggestion => suggestion !== null)
}

export function usePokemonSuggestions(query: string): PokemonSuggestionsResult {
  // Lista de nombres: se toma de la caché si existe; si no, se pide una sola vez.
  const [names, setNames] = useState<NamedAPIResource[] | null>(peekPokemonNames)
  // Texto con debounce: solo se actualiza 250 ms después de dejar de escribir.
  const [debounced, setDebounced] = useState(query)

  useEffect(() => {
    if (names) return
    let cancelled = false
    getPokemonNames()
      .then((loaded) => {
        if (!cancelled) setNames(loaded)
      })
      .catch(() => {
        // Sin lista no hay sugerencias, pero la búsqueda normal sigue funcionando.
      })
    return () => {
      cancelled = true
    }
  }, [names])

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query])

  const term = normalizeQuery(debounced)
  const suggestions = useMemo(
    () => (names && isSuggestible(term) ? filterNames(names, term) : []),
    [names, term],
  )

  // El texto actual también debe ser válido: así la lista se oculta al instante
  // cuando se borra el campo o se escribe un número, sin esperar el debounce.
  const active = names !== null && isSuggestible(term) && isSuggestible(normalizeQuery(query))

  return { suggestions, term, active }
}
