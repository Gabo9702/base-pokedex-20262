import type {
  EvolutionChain,
  NamedAPIResource,
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  PokemonTypeData,
} from '../types/pokemon'

const BASE_URL = 'https://pokeapi.co/api/v2'

export const MAX_POKEMON_ID = 1025

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Caché de promesas: evita repetir peticiones (p. ej. /type/fire) y comparte
// las que están en vuelo. Si una petición falla se elimina para poder reintentar.
const cache = new Map<string, Promise<unknown>>()

function getJson<T>(url: string): Promise<T> {
  const cached = cache.get(url)
  if (cached) return cached as Promise<T>

  const request = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new ApiError(`PokeAPI respondió ${response.status}`, response.status)
      }
      return response.json() as Promise<T>
    })
    .catch((error: unknown) => {
      cache.delete(url)
      throw error
    })

  cache.set(url, request)
  return request
}

export const getPokemon = (query: string | number) =>
  getJson<Pokemon>(`${BASE_URL}/pokemon/${encodeURIComponent(query)}`)

export const getSpecies = (url: string) => getJson<PokemonSpecies>(url)

export const getEvolutionChain = (url: string) => getJson<EvolutionChain>(url)

export const getTypeData = (name: string) =>
  getJson<PokemonTypeData>(`${BASE_URL}/type/${encodeURIComponent(name)}`)

// ---------- Lista completa de nombres (para las sugerencias del buscador) ----------

const NAMES_STORAGE_KEY = 'pokedex:pokemon-names'

/** Valida lo leído de sessionStorage sin usar `any`: debe ser una lista de {name, url}. */
function isResourceList(value: unknown): value is NamedAPIResource[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item: unknown) =>
        typeof item === 'object' &&
        item !== null &&
        'name' in item &&
        'url' in item &&
        typeof item.name === 'string' &&
        typeof item.url === 'string',
    )
  )
}

function readStoredNames(): NamedAPIResource[] | null {
  try {
    const raw = sessionStorage.getItem(NAMES_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isResourceList(parsed) ? parsed : null
  } catch {
    return null // sessionStorage bloqueado o contenido corrupto
  }
}

function storeNames(names: NamedAPIResource[]): void {
  try {
    sessionStorage.setItem(NAMES_STORAGE_KEY, JSON.stringify(names))
  } catch {
    // Sin sessionStorage (modo privado, cuota llena…): basta con la caché en memoria.
  }
}

// Caché en memoria: la lista ya resuelta y la promesa en vuelo (una sola petición).
let namesCache: NamedAPIResource[] | null = null
let namesRequest: Promise<NamedAPIResource[]> | null = null

/** Devuelve la lista de nombres si ya está en memoria o en sessionStorage, sin pedirla. */
export function peekPokemonNames(): NamedAPIResource[] | null {
  namesCache ??= readStoredNames()
  return namesCache
}

/** Obtiene una sola vez los 1025 nombres y los guarda en memoria y en sessionStorage. */
export function getPokemonNames(): Promise<NamedAPIResource[]> {
  const cached = peekPokemonNames()
  if (cached) return Promise.resolve(cached)

  namesRequest ??= getJson<PokemonListResponse>(`${BASE_URL}/pokemon?limit=${MAX_POKEMON_ID}`)
    .then(({ results }) => {
      namesCache = results
      storeNames(results)
      return results
    })
    .finally(() => {
      namesRequest = null // si falló, la próxima llamada puede reintentar
    })
  return namesRequest
}

export function errorMessage(error: unknown, query?: string): string {
  if (error instanceof ApiError && error.status === 404) {
    return query
      ? `No se encontró ningún Pokémon con "${query}".`
      : 'No se encontró la información solicitada.'
  }
  return 'No se pudo conectar con la PokeAPI. Revisa tu conexión e inténtalo de nuevo.'
}
