import type { PokemonSuggestion } from '../types/pokemon'
import { capitalize, formatId, suggestionOptionId } from '../utils/format'
import './SearchSuggestions.css'

interface SearchSuggestionsProps {
  /** id del listbox: el input lo referencia con aria-controls. */
  id: string
  suggestions: PokemonSuggestion[]
  term: string
  activeIndex: number
  onSelect: (suggestion: PokemonSuggestion) => void
  onHover: (index: number) => void
}

/** Nombre con mayúscula inicial y la parte que coincide con la búsqueda en negrita. */
function HighlightedName({ name, term }: { name: string; term: string }) {
  const label = capitalize(name)
  const start = name.indexOf(term)
  if (start < 0 || !term) return <>{label}</>
  const end = start + term.length
  return (
    <>
      {label.slice(0, start)}
      <strong className="suggestions__match">{label.slice(start, end)}</strong>
      {label.slice(end)}
    </>
  )
}

export function SearchSuggestions({
  id,
  suggestions,
  term,
  activeIndex,
  onSelect,
  onHover,
}: SearchSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <ul id={id} className="suggestions" role="listbox" aria-label="Sugerencias de Pokémon">
        <li className="suggestions__empty" role="option" aria-disabled="true" aria-selected="false">
          No se encontraron Pokémon
        </li>
      </ul>
    )
  }

  return (
    <ul id={id} className="suggestions" role="listbox" aria-label="Sugerencias de Pokémon">
      {suggestions.map((suggestion, index) => (
        <li
          key={suggestion.id}
          id={suggestionOptionId(id, suggestion.id)}
          className={`suggestions__item${index === activeIndex ? ' is-active' : ''}`}
          role="option"
          aria-selected={index === activeIndex}
          // mousedown sin preventDefault quitaría el foco del input antes del clic
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(suggestion)}
          onMouseMove={() => {
            if (index !== activeIndex) onHover(index)
          }}
        >
          <span className="suggestions__number">{formatId(suggestion.id)}</span>
          <img
            className="suggestions__sprite"
            src={suggestion.sprite}
            alt=""
            width={40}
            height={40}
            loading="lazy"
          />
          <span className="suggestions__name">
            <HighlightedName name={suggestion.name} term={term} />
          </span>
        </li>
      ))}
    </ul>
  )
}
