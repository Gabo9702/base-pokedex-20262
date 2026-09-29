import type { FlavorTextEntry, Genus, NamedAPIResource } from '../types/pokemon'

/** Sin espacios sobrantes, en minúsculas y con "#" inicial / espacios internos resueltos. */
export function normalizeQuery(raw: string): string {
  return raw.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-')
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "solar-power" -> "Solar Power" */
export function formatName(slug: string): string {
  return slug.split('-').map(capitalize).join(' ')
}

export function formatId(id: number): string {
  return `#${String(id).padStart(3, '0')}`
}

export function toMeters(decimeters: number): string {
  return `${(decimeters / 10).toFixed(1)} m`
}

export function toKilograms(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`
}

/** Elimina saltos de línea, saltos de página y guiones blandos de los textos de la Pokédex. */
export function cleanFlavorText(text: string): string {
  return text
    .replace(/­\s*/g, '')
    .replace(/[\n\f\r\v]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

interface LocalizedText {
  text: string
  language: 'es' | 'en'
}

function pickLocalized<T extends { language: NamedAPIResource }>(
  entries: T[],
  read: (entry: T) => string,
): LocalizedText | null {
  for (const language of ['es', 'en'] as const) {
    // Se toma la última coincidencia: suele ser la de la versión más reciente.
    const found = entries.filter((entry) => entry.language.name === language).at(-1)
    if (found) return { text: read(found), language }
  }
  return null
}

export function pickFlavorText(entries: FlavorTextEntry[]): LocalizedText | null {
  const picked = pickLocalized(entries, (entry) => entry.flavor_text)
  return picked && { ...picked, text: cleanFlavorText(picked.text) }
}

export function pickGenus(genera: Genus[]): string | null {
  return pickLocalized(genera, (entry) => entry.genus)?.text ?? null
}

export function formatGeneration(slug: string): string {
  return `Generación ${slug.replace('generation-', '').toUpperCase()}`
}

/** Extrae el número final de la URL de un recurso: ".../pokemon/25/" -> 25. */
export function idFromResourceUrl(url: string): number | null {
  const match = /\/(\d+)\/?$/.exec(url)
  return match ? Number(match[1]) : null
}

/** id de cada opción de la lista de sugerencias (lo usa aria-activedescendant en el input). */
export function suggestionOptionId(listId: string, pokemonId: number): string {
  return `${listId}-${pokemonId}`
}
