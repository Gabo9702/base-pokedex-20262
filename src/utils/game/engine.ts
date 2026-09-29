// Avance de la simulación: combina física, obstáculos, escenario y colisiones.
// stepGame es pura: recibe el estado anterior y devuelve el siguiente.
import type { GameConfig, GameInput, GameScreen, GameState, GameTheme } from '../../types/game'
import { hasCollision } from './collisions'
import { GAME_WIDTH, SCORE_PER_UNIT } from './constants'
import { createObstacleGroup, groupWidth, moveObstacles, nextGap, type RandomFn } from './obstacles'
import { createPlayer, speedForScore, updatePlayer } from './physics'
import { createClouds, createPebbles, moveClouds, movePebbles, updateParticles } from './scenery'

/** Distancia hasta el primer obstáculo de cada partida. */
const FIRST_OBSTACLE_DISTANCE = 320
/** Duración del parpadeo del marcador al pasar cada centena. */
const SCORE_FLASH_TIME = 0.9

export function createGameState(
  playerWidth: number,
  playerHeight: number,
  config: GameConfig,
  rng: RandomFn,
  screen: GameScreen = 'start',
): GameState {
  return {
    screen,
    player: createPlayer(playerWidth, playerHeight),
    obstacles: [],
    clouds: createClouds(rng),
    pebbles: createPebbles(rng),
    particles: [],
    speed: config.baseSpeed,
    distance: 0,
    score: 0,
    nextObstacleIn: FIRST_OBSTACLE_DISTANCE,
    nextObstacleId: 1,
    flashTimer: 0,
    clock: 0,
    screenTime: 0,
    newRecord: false,
  }
}

export function withScreen(state: GameState, screen: GameScreen): GameState {
  return { ...state, screen, screenTime: 0 }
}

interface StepOptions {
  config: GameConfig
  theme: GameTheme
  rng: RandomFn
  /** false con prefers-reduced-motion: sin partículas. */
  particles: boolean
}

/** Avanza el juego `dt` segundos. Fuera de la pantalla "jugando" el mundo queda congelado. */
export function stepGame(state: GameState, input: GameInput, dt: number, options: StepOptions): GameState {
  const clock = state.clock + dt
  const screenTime = state.screenTime + dt
  if (state.screen !== 'playing') return { ...state, clock, screenTime }

  const { config, theme, rng } = options
  const speed = speedForScore(state.score, config)
  const dx = speed * dt

  const player = updatePlayer(state.player, input, dt, config, speed)

  // Obstáculos: se mueven y, cuando se recorrió el hueco, aparece un grupo nuevo por la derecha
  let obstacles = moveObstacles(state.obstacles, dx, dt)
  let nextObstacleIn = state.nextObstacleIn - dx
  let nextObstacleId = state.nextObstacleId
  if (nextObstacleIn <= 0) {
    const group = createObstacleGroup(state.score, GAME_WIDTH + 10, nextObstacleId, rng)
    obstacles = [...obstacles, ...group]
    nextObstacleId += group.length
    nextObstacleIn = groupWidth(group) + nextGap(speed, rng)
  }

  // Puntaje: sube con la distancia recorrida; cada 100 puntos el marcador parpadea
  const distance = state.distance + dx
  const score = Math.floor(distance * SCORE_PER_UNIT)
  const passedHundred = Math.floor(score / 100) > Math.floor(state.score / 100)
  const flashTimer = passedHundred ? SCORE_FLASH_TIME : Math.max(0, state.flashTimer - dt)

  const crashed = hasCollision(player, obstacles)

  return {
    ...state,
    screen: crashed ? 'gameover' : 'playing',
    screenTime: crashed ? 0 : screenTime,
    clock,
    player,
    obstacles,
    clouds: moveClouds(state.clouds, dx, rng),
    pebbles: movePebbles(state.pebbles, dx, rng),
    particles: options.particles ? updateParticles(state.particles, theme, dt, rng) : [],
    speed,
    distance,
    score,
    nextObstacleIn,
    nextObstacleId,
    flashTimer,
  }
}
