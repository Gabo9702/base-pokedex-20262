// Escenario: nubes en parallax, piedritas del suelo y partículas según el tipo.
// Funciones puras: reciben el estado y devuelven uno nuevo; el azar se inyecta.
import type { Cloud, GameTheme, Particle, Pebble } from '../../types/game'
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from './constants'
import type { RandomFn } from './obstacles'

/** Las nubes se mueven más lento que el suelo (parallax). */
const CLOUD_PARALLAX = 0.2
const CLOUD_COUNT = 4
const PEBBLE_COUNT = 18
const MAX_PARTICLES = 40

export function createClouds(rng: RandomFn): Cloud[] {
  return Array.from({ length: CLOUD_COUNT }, (_, i) => ({
    x: (i / CLOUD_COUNT) * GAME_WIDTH + rng() * 80,
    y: 40 + rng() * 110,
    width: 40 + rng() * 30,
  }))
}

export function moveClouds(clouds: readonly Cloud[], dx: number, rng: RandomFn): Cloud[] {
  return clouds.map((cloud) => {
    const x = cloud.x - dx * CLOUD_PARALLAX
    // La nube que sale por la izquierda reaparece por la derecha
    return x + cloud.width < 0
      ? { x: GAME_WIDTH + rng() * 120, y: 40 + rng() * 110, width: 40 + rng() * 30 }
      : { ...cloud, x }
  })
}

export function createPebbles(rng: RandomFn): Pebble[] {
  return Array.from({ length: PEBBLE_COUNT }, () => ({
    x: rng() * GAME_WIDTH,
    y: GROUND_Y + 5 + rng() * 34,
    width: 2 + rng() * 5,
  }))
}

export function movePebbles(pebbles: readonly Pebble[], dx: number, rng: RandomFn): Pebble[] {
  return pebbles.map((pebble) => {
    const x = pebble.x - dx
    return x + pebble.width < 0
      ? { x: GAME_WIDTH + rng() * 40, y: GROUND_Y + 5 + rng() * 34, width: 2 + rng() * 5 }
      : { ...pebble, x }
  })
}

/** Crea una partícula nueva según el tipo de escenario (o null si ese escenario no tiene). */
function spawnParticle(theme: GameTheme, rng: RandomFn): Particle | null {
  const colors = theme.particleColors
  if (theme.particle === 'none' || colors.length === 0) return null
  const color = colors[Math.floor(rng() * colors.length)]
  const x = rng() * GAME_WIDTH

  switch (theme.particle) {
    case 'embers': // brasas que suben desde el suelo
      return { x, y: GROUND_Y, vx: -20 - rng() * 30, vy: -30 - rng() * 40, size: 2 + rng() * 2, life: 0, maxLife: 2 + rng() * 2, color }
    case 'bubbles': // burbujas que suben despacio
      return { x, y: GROUND_Y - rng() * 20, vx: -10, vy: -25 - rng() * 20, size: 2 + rng() * 4, life: 0, maxLife: 4 + rng() * 3, color }
    case 'leaves': // hojas que caen balanceándose
      return { x, y: -6, vx: -30 - rng() * 30, vy: 25 + rng() * 25, size: 3 + rng() * 2, life: 0, maxLife: 8, color }
    case 'snow': // copos de nieve
      return { x, y: -6, vx: -15 - rng() * 15, vy: 30 + rng() * 25, size: 1.5 + rng() * 2, life: 0, maxLife: 9, color }
    case 'stars': // estrellas quietas que titilan
      return { x, y: 10 + rng() * (GROUND_Y - 80), vx: -4, vy: 0, size: 1 + rng() * 1.5, life: 0, maxLife: 3 + rng() * 3, color }
    case 'sparks': // destellos breves y ocasionales
      return { x, y: 20 + rng() * (GROUND_Y - 60), vx: 0, vy: 0, size: 6 + rng() * 6, life: 0, maxLife: 0.18, color }
  }
}

/** Partículas nuevas por segundo según el escenario. */
function spawnRate(theme: GameTheme): number {
  switch (theme.particle) {
    case 'sparks':
      return 0.6
    case 'stars':
      return 4
    case 'none':
      return 0
    default:
      return 8
  }
}

export function updateParticles(
  particles: readonly Particle[],
  theme: GameTheme,
  dt: number,
  rng: RandomFn,
): Particle[] {
  const next = particles
    .map((p) => ({
      ...p,
      // Las hojas se balancean de lado a lado
      x: p.x + (p.vx + (theme.particle === 'leaves' ? Math.sin(p.life * 4) * 25 : 0)) * dt,
      y: p.y + p.vy * dt,
      life: p.life + dt,
    }))
    .filter((p) => p.life < p.maxLife && p.y < GAME_HEIGHT + 10 && p.y > -10 && p.x > -10)

  if (next.length < MAX_PARTICLES && rng() < spawnRate(theme) * dt) {
    const particle = spawnParticle(theme, rng)
    if (particle) next.push(particle)
  }
  return next
}
