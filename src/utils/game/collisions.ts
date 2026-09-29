// Colisiones con cajas rectangulares reducidas: se sienten justas porque
// ignoran las esquinas vacías del sprite y de las formas redondeadas.
import type { Box, Obstacle, ObstacleKind, Player } from '../../types/game'
import { DUCK_SCALE } from './physics'

/** Fracción del tamaño visual que ocupa la hitbox de cada obstáculo. */
const OBSTACLE_HITBOX: Record<ObstacleKind, number> = {
  pokeball: 0.8,
  rock: 0.85,
  bush: 0.8,
  'flying-pokeball': 0.8,
  bird: 0.7,
}

/** Caja visual del Pokémon (agachado es más bajo). */
export function playerBox(player: Player): Box {
  const height = player.height * (player.ducking ? DUCK_SCALE : 1)
  return { x: player.x, y: player.y - height, width: player.width, height }
}

/**
 * Hitbox del Pokémon: ~80 % de su caja visual (que ya viene recortada al área
 * opaca del sprite), centrada en horizontal y casi apoyada en el suelo.
 */
export function playerHitbox(player: Player): Box {
  const box = playerBox(player)
  const width = box.width * 0.8
  const height = box.height * 0.8
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + box.height * 0.16,
    width,
    height,
  }
}

export function obstacleHitbox(obstacle: Obstacle): Box {
  const factor = OBSTACLE_HITBOX[obstacle.kind]
  const width = obstacle.width * factor
  const height = obstacle.height * factor
  return {
    x: obstacle.x + (obstacle.width - width) / 2,
    y: obstacle.y + (obstacle.height - height) / 2,
    width,
    height,
  }
}

export function intersects(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

export function hasCollision(player: Player, obstacles: readonly Obstacle[]): boolean {
  const hitbox = playerHitbox(player)
  return obstacles.some((obstacle) => intersects(hitbox, obstacleHitbox(obstacle)))
}
