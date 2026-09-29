import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { usePokemonSuggestions } from '../hooks/usePokemonSuggestions'
import type { PokemonSuggestion } from '../types/pokemon'
import { suggestionOptionId } from '../utils/format'
import { SearchSuggestions } from './SearchSuggestions'
import './Searcher.css'

interface SearcherProps {
  loading: boolean
  error: string | null
  onSearch: (query: string) => void
}

const LIST_ID = 'pokemon-suggestions'

/** Sugerencia resaltada con las flechas, ligada al término de búsqueda que la produjo. */
interface ActiveOption {
  term: string
  index: number
}

// El buscador se monta de nuevo cada vez que se cierra la Pokédex,
// por eso el campo empieza vacío y recibe el foco automáticamente.
export function Searcher({ loading, error, onSearch }: SearcherProps) {
  const [value, setValue] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const [activeOption, setActiveOption] = useState<ActiveOption>({ term: '', index: -1 })
  const inputRef = useRef<HTMLInputElement>(null)
  const fieldRef = useRef<HTMLDivElement>(null)

  const { suggestions, term, active } = usePokemonSuggestions(value)
  const expanded = listOpen && active && !loading
  // Si el término cambió, la sugerencia activa anterior ya no vale.
  const activeIndex = expanded && activeOption.term === term ? activeOption.index : -1
  const activeSuggestion = activeIndex >= 0 ? suggestions[activeIndex] : undefined

  // Foco al montar (al abrir la app y al volver de la Pokédex) y cuando termina
  // una búsqueda fallida, porque mientras carga el input está deshabilitado.
  useEffect(() => {
    if (!loading) inputRef.current?.focus()
  }, [loading])

  // Clic fuera del campo y de la lista: se cierra la lista.
  useEffect(() => {
    if (!expanded) return
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !fieldRef.current?.contains(event.target)) {
        setListOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [expanded])

  // Mantiene visible la opción activa dentro del scroll interno de la lista.
  useEffect(() => {
    if (activeSuggestion) {
      document
        .getElementById(suggestionOptionId(LIST_ID, activeSuggestion.id))
        ?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeSuggestion])

  const selectSuggestion = (suggestion: PokemonSuggestion) => {
    setValue(suggestion.name)
    setListOpen(false)
    if (!loading) onSearch(suggestion.name)
  }

  // Un <form> hace que Enter y el botón Buscar compartan el mismo camino.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setListOpen(false)
    if (!loading) onSearch(value)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (!active) return
        event.preventDefault()
        if (!expanded) {
          setListOpen(true)
          return
        }
        const count = suggestions.length
        if (count === 0) return
        const step = event.key === 'ArrowDown' ? 1 : -1
        // Recorre la lista de forma circular; desde "ninguna", ↓ va a la primera y ↑ a la última.
        const next = activeIndex < 0 ? (step === 1 ? 0 : count - 1) : (activeIndex + step + count) % count
        setActiveOption({ term, index: next })
        return
      }
      case 'Enter':
        // Con una sugerencia activa se busca esa; si no, el formulario envía el texto escrito.
        if (activeSuggestion) {
          event.preventDefault()
          selectSuggestion(activeSuggestion)
        }
        return
      case 'Escape':
        if (expanded) {
          event.preventDefault()
          setListOpen(false)
        }
        return
    }
  }

  return (
    <main className="searcher">
      <form className="searcher__card" onSubmit={handleSubmit} noValidate>
        <h1 className="searcher__title">
          <span className="searcher__ball" aria-hidden="true" />
          Pokédex
        </h1>

        <div className="searcher__row">
          <div className="searcher__field" ref={fieldRef}>
            <input
              ref={inputRef}
              className="searcher__input"
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={expanded}
              aria-controls={LIST_ID}
              aria-activedescendant={
                activeSuggestion ? suggestionOptionId(LIST_ID, activeSuggestion.id) : undefined
              }
              value={value}
              onChange={(event) => {
                setValue(event.target.value)
                setListOpen(true)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Nombre o número del Pokémon"
              aria-label="Nombre o número del Pokémon"
              aria-invalid={error !== null}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              disabled={loading}
            />
            {expanded && (
              <SearchSuggestions
                id={LIST_ID}
                suggestions={suggestions}
                term={term}
                activeIndex={activeIndex}
                onSelect={selectSuggestion}
                onHover={(index) => setActiveOption({ term, index })}
              />
            )}
          </div>
          <button className="searcher__button" type="submit" disabled={loading}>
            Buscar
          </button>
        </div>

        <div className="searcher__feedback">
          {loading && (
            <p className="searcher__loading" role="status">
              <span className="searcher__spinner" aria-hidden="true" />
              Buscando…
            </p>
          )}
          {error && !loading && (
            <p className="searcher__error" role="alert">
              {error}
            </p>
          )}
        </div>
      </form>
    </main>
  )
}
