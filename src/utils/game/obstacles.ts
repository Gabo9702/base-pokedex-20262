// Generación y movimiento de obstáculos (funciones puras; el azar se inyecta).
import type { GroundObstacleKind, Obstacle } from '../../types/game'
import { FLYING_MIN_SCORE, GROUND_Y } from './constants'

export type RandomFn = () => number

const between = (rng: RandomFn, min: number, max: number) => min + rng() * (max - min)

/**
 * Hueco mínimo entre grupos de obstáculos, proporcional a la velocidad: cubre
 * un salto largo completo (~0,75 s en el aire) más un margen para reaccionar,
 * de modo que siempre es posible esquivarlos.
 */
export function minGapForSpeed(speed: number): number {
  return speed * 0.9 + 120
}

/** Distancia hasta el siguiente grupo, contada desde el final del grupo actual. */
export function nextGap(speed: number, rng: RandomFn): number {
  return minGapForSpeed(speed) + rng() * speed * 0.9
}

function groundSize(kind: GroundObstacleKind, rng: RandomFn): { width: number; height: number } {
  switch (kind) {
    case 'pokeball': {
      const size = between(rng, 22, 32)
      return { width: size, height: size }
    }
    case 'rock':
      return { width: between(rng, 26, 40), height: between(rng, 20, 32) }
    case 'bush':
      return { width: between(rng, 30, 44), height: between(rng, 22, 34) }
  }
}

/**
 * Alturas de los voladores (distancia de su borde inferior al suelo):
 * - 12: hay que saltarlo.
 * - 44: hay que agacharse (de pie choca, agachado pasa por debajo).
 * - 90: pasa por encima si el Pokémon no salta.
 */
const FLYING_ALTITUDES = [12, 44, 90] as const

/** Crea un grupo de obstáculos que empieza en `startX`. */
export function createObstacleGroup(
  score: number,
  startX: number,
  firstId: number,
  rng: RandomFn,
): Obstacle[] {
  // Voladores: a partir de 500 puntos, un 30 % de las veces
  if (score >= FLYING_MIN_SCORE && rng() < 0.3) {
    const kind = rng() < 0.5 ? 'bird' : 'flying-pokeball'
    const width = kind === 'bird' ? 36 : 26
    const height = kind === 'bird' ? 24 : 26
    const altitude = FLYING_ALTITUDES[Math.floor(rng() * FLYING_ALTITUDES.length)]
    return [
      {
        id: firstId,
        kind,
        x: startX,
        y: GROUND_Y - altitude - height,
        width,
        height,
        phase: rng() * Math.PI * 2,
      },
    ]
  }

  const kinds: readonly GroundObstacleKind[] = ['pokeball', 'rock', 'bush']
  const kind = kinds[Math.floor(rng() * kinds.length)]
  // Grupos de 2 o 3 cuando ya se lleva un rato (3 solo con Poké Balls, que son las más estrechas)
  const maxCount = score < 150 ? 1 : kind === 'pokeball' ? 3 : 2
  const count = rng() < 0.35 ? 1 + Math.floor(rng() * maxCount) : 1

  const group: Obstacle[] = []
  let x = startX
  for (let i = 0; i < count; i++) {
    const { width, height } = groundSize(kind, rng)
    group.push({ id: firstId + i, kind, x, y: GROUND_Y - height, width, height, phase: 0 })
    x += width + 2
  }
  return group
}

/** Ancho total de un grupo. */
export function groupWidth(group: readonly Obstacle[]): number {
  if (group.length === 0) return 0
  const last = group[group.length - 1]
  return last.x + last.width - group[0].x
}

/** Desplaza los obstáculos hacia la izquierda y descarta los que ya salieron. */
export function moveObstacles(obstacles: readonly Obstacle[], dx: number, dt: number): Obstacle[] {
  return obstacles
    .map((obstacle) => ({
      ...obstacle,
      // Los pájaros van un poco más rápido que el suelo, como el pterodáctilo de Chrome
      x: obstacle.x - dx * (obstacle.kind === 'bird' ? 1.08 : 1),
      phase: obstacle.phase + dt * (obstacle.kind === 'bird' ? 10 : 3),
    }))
    .filter((obstacle) => obstacle.x + obstacle.width > -10)
}
