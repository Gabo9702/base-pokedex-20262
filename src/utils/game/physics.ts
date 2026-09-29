// Física del Pokémon: funciones puras (reciben un estado y devuelven uno nuevo).
import type { GameConfig, GameInput, Player } from '../../types/game'
import { GROUND_Y, PLAYER_MAX_HEIGHT, PLAYER_MAX_WIDTH, PLAYER_X } from './constants'

export const GRAVITY = 2400
export const JUMP_VELOCITY = 640
export const DOUBLE_JUMP_VELOCITY = 560
/** Tiempo máximo durante el que mantener la tecla alarga el salto. */
export const MAX_JUMP_HOLD = 0.2
/** Mientras se mantiene el salto (y dentro de MAX_JUMP_HOLD) la gravedad se reduce. */
export const HOLD_GRAVITY_FACTOR = 0.4
/** Pulsar ↓ en el aire hace caer más rápido. */
export const FAST_FALL_FACTOR = 2.6
/** Escala vertical del Pokémon agachado. */
export const DUCK_SCALE = 0.55

const MIN_SPEED_STAT = 20
const MAX_SPEED_STAT = 160
const SLOWEST_BASE_SPEED = 280
const FASTEST_BASE_SPEED = 420
/** Cuánto sube la velocidad del juego por cada punto. */
const SPEED_PER_POINT = 0.4
/** Margen de aceleración sobre la velocidad inicial. */
const SPEED_HEADROOM = 300

/**
 * Velocidad inicial (unidades lógicas por segundo) a partir de la estadística
 * base de Velocidad del Pokémon:
 *
 *   t = clamp((stat - 20) / (160 - 20), 0, 1)
 *   velocidadInicial = 280 + t * (420 - 280)
 *
 * Así un Shuckle (stat 5) empieza a 280 u/s (cruza la pantalla en ~2,1 s) y un
 * Regieleki (stat 200) a 420 u/s (~1,4 s): ni muy lento ni injugable.
 * La velocidad máxima es la inicial + 300 u/s.
 */
export function baseSpeedFromStat(speedStat: number): number {
  const t = Math.min(Math.max((speedStat - MIN_SPEED_STAT) / (MAX_SPEED_STAT - MIN_SPEED_STAT), 0), 1)
  return SLOWEST_BASE_SPEED + t * (FASTEST_BASE_SPEED - SLOWEST_BASE_SPEED)
}

export function createConfig(speedStat: number, canDoubleJump: boolean): GameConfig {
  const baseSpeed = baseSpeedFromStat(speedStat)
  return { baseSpeed, maxSpeed: baseSpeed + SPEED_HEADROOM, canDoubleJump }
}

/** Dificultad progresiva: la velocidad crece con el puntaje hasta el máximo. */
export function speedForScore(score: number, config: GameConfig): number {
  return Math.min(config.maxSpeed, config.baseSpeed + score * SPEED_PER_POINT)
}

export function createPlayer(width: number, height: number): Player {
  return {
    x: PLAYER_X,
    y: GROUND_Y,
    vy: 0,
    width,
    height,
    onGround: true,
    ducking: false,
    jumpsUsed: 0,
    jumpHoldTime: 0,
    runPhase: 0,
  }
}

/** Avanza la física del Pokémon `dt` segundos. */
export function updatePlayer(
  player: Player,
  input: GameInput,
  dt: number,
  config: GameConfig,
  speed: number,
): Player {
  const next: Player = { ...player }
  const wantsDuck = input.duckHeld || input.duckTimer > 0

  // Salto (o doble salto en el aire si el Pokémon lo permite)
  if (input.jumpQueued && !wantsDuck) {
    if (next.onGround) {
      next.vy = -JUMP_VELOCITY
      next.onGround = false
      next.jumpsUsed = 1
      next.jumpHoldTime = 0
    } else if (config.canDoubleJump && next.jumpsUsed < 2) {
      next.vy = -DOUBLE_JUMP_VELOCITY
      next.jumpsUsed = 2
      next.jumpHoldTime = 0
    }
  }

  if (!next.onGround) {
    let gravity = GRAVITY
    // Salto variable: mientras se mantiene la tecla y se sube, la gravedad es menor (con un tiempo máximo)
    if (next.vy < 0 && input.jumpHeld && next.jumpHoldTime < MAX_JUMP_HOLD) {
      gravity *= HOLD_GRAVITY_FACTOR
      next.jumpHoldTime += dt
    }
    if (wantsDuck) gravity *= FAST_FALL_FACTOR
    // Integración exacta para gravedad constante: la altura del salto no depende de los Hz del monitor
    next.y += next.vy * dt + 0.5 * gravity * dt * dt
    next.vy += gravity * dt

    // Techo: el Pokémon nunca sale por arriba de la pantalla
    if (next.y - next.height < 4) {
      next.y = next.height + 4
      next.vy = Math.max(next.vy, 0)
    }

    if (next.y >= GROUND_Y) {
      next.y = GROUND_Y
      next.vy = 0
      next.onGround = true
      next.jumpsUsed = 0
    }
  }

  next.ducking = wantsDuck && next.onGround
  // El rebote de carrera va más rápido cuanto mayor es la velocidad del juego
  next.runPhase = (next.runPhase + dt * speed * 0.045) % Math.PI
  return next
}

/** Desplazamiento vertical del rebote que simula la carrera (solo en el suelo). */
export function runBob(player: Player, running: boolean): number {
  if (!player.onGround || !running) return 0
  return -Math.abs(Math.sin(player.runPhase)) * (player.ducking ? 1.5 : 3)
}

/** Tamaño del sprite recortado ajustado a la caja máxima, conservando la proporción. */
export function fitPlayerSize(spriteWidth: number, spriteHeight: number): { width: number; height: number } {
  if (spriteWidth <= 0 || spriteHeight <= 0) return { width: 52, height: 52 }
  const scale = Math.min(PLAYER_MAX_HEIGHT / spriteHeight, PLAYER_MAX_WIDTH / spriteWidth)
  return { width: spriteWidth * scale, height: spriteHeight * scale }
}
