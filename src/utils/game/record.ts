// Récord por Pokémon en localStorage (clave pokerunner:record:{id}).
// localStorage puede no existir o lanzar (modo privado, almacenamiento bloqueado):
// toda lectura y escritura va dentro de try/catch y el juego funciona igual sin él.

export function recordKey(pokemonId: number): string {
  return `pokerunner:record:${pokemonId}`
}

export function readRecord(pokemonId: number): number {
  try {
    const value = Number(window.localStorage.getItem(recordKey(pokemonId)))
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0
  } catch {
    return 0
  }
}

export function writeRecord(pokemonId: number, score: number): void {
  try {
    window.localStorage.setItem(recordKey(pokemonId), String(Math.floor(score)))
  } catch {
    // Sin almacenamiento disponible: el récord solo dura esta sesión de juego.
  }
}
