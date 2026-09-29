// Interfaces de las respuestas de PokeAPI (https://pokeapi.co/api/v2/).
// Solo se tipan los campos que la aplicación consume.

export interface NamedAPIResource {
  name: string
  url: string
}

export interface APIResource {
  url: string
}

// ---------- /pokemon/{id | name} ----------

export interface PokemonTypeSlot {
  slot: number
  type: NamedAPIResource
}

export interface PokemonStat {
  base_stat: number
  effort: number
  stat: NamedAPIResource
}

export interface PokemonAbilitySlot {
  ability: NamedAPIResource
  is_hidden: boolean
  slot: number
}

export interface PokemonMoveSlot {
  move: NamedAPIResource
}

export interface PokemonSprites {
  front_default: string | null
  back_default: string | null
  front_shiny: string | null
  back_shiny: string | null
}

export interface Pokemon {
  id: number
  name: string
  height: number // decímetros
  weight: number // hectogramos
  base_experience: number | null
  types: PokemonTypeSlot[]
  stats: PokemonStat[]
  abilities: PokemonAbilitySlot[]
  moves: PokemonMoveSlot[]
  sprites: PokemonSprites
  species: NamedAPIResource
}

// ---------- /pokemon-species/{id | name} ----------

export interface FlavorTextEntry {
  flavor_text: string
  language: NamedAPIResource
  version: NamedAPIResource
}

export interface Genus {
  genus: string
  language: NamedAPIResource
}

export interface PokemonSpecies {
  id: number
  name: string
  flavor_text_entries: FlavorTextEntry[]
  genera: Genus[]
  generation: NamedAPIResource
  habitat: NamedAPIResource | null
  color: NamedAPIResource
  is_legendary: boolean
  is_mythical: boolean
  evolution_chain: APIResource | null
}

// ---------- /evolution-chain/{id} ----------

export interface EvolutionDetail {
  trigger: NamedAPIResource
  min_level: number | null
  item: NamedAPIResource | null
  held_item: NamedAPIResource | null
  known_move: NamedAPIResource | null
  known_move_type: NamedAPIResource | null
  location: NamedAPIResource | null
  min_happiness: number | null
  min_affection: number | null
  min_beauty: number | null
  time_of_day: string
  gender: number | null
  relative_physical_stats: number | null
  needs_overworld_rain: boolean
  turn_upside_down: boolean
  party_species: NamedAPIResource | null
  party_type: NamedAPIResource | null
  trade_species: NamedAPIResource | null
}

export interface ChainLink {
  species: NamedAPIResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export interface EvolutionChain {
  id: number
  chain: ChainLink
}

// ---------- /type/{name} ----------

export interface TypeRelations {
  double_damage_from: NamedAPIResource[]
  half_damage_from: NamedAPIResource[]
  no_damage_from: NamedAPIResource[]
  double_damage_to: NamedAPIResource[]
  half_damage_to: NamedAPIResource[]
  no_damage_to: NamedAPIResource[]
}

export interface PokemonTypeData {
  id: number
  name: string
  damage_relations: TypeRelations
}

// ---------- /pokemon?limit=N ----------

export interface PokemonListResponse {
  count: number
  results: NamedAPIResource[]
}

// ---------- Tipos propios de la aplicación ----------

/** Sugerencia del buscador: número, nombre y sprite pequeño. */
export interface PokemonSuggestion {
  id: number
  name: string
  sprite: string
}
