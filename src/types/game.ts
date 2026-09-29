// Tipos del minijuego PokeRunner (estilo "dinosaurio de Chrome").
// Todas las medidas están en el sistema de coordenadas lógico del juego
// (GAME_WIDTH x GAME_HEIGHT, ver utils/game/constants.ts), no en píxeles reales.

/** Los 18 tipos de Pokémon (nombres tal como los devuelve PokeAPI). */
export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'electric'
  | 'grass'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy'

/** Partículas decorativas del escenario según el tipo principal. */
export type ParticleKind = 'embers' | 'bubbles' | 'leaves' | 'sparks' | 'snow' | 'stars' | 'none'

/** Paleta del escenario. El fondo siempre es oscuro, como la pantalla de la Pokédex. */
export interface GameTheme {
  /** Nombre corto del escenario (se muestra en el panel de estado). */
  name: string
  background: string
  ground: string
  groundDetail: string
  cloud: string
  text: string
  textDim: string
  /** Color de realce: "¡NUEVO RÉCORD!", destellos, etc. */
  accent: string
  particle: ParticleKind
  particleColors: readonly string[]
}

/** Pantallas del juego (todas se dibujan dentro del canvas). */
export type GameScreen = 'start' | 'playing' | 'paused' | 'gameover'

export interface Box {
  x: number
  y: number
  width: number
  height: number
}

export interface Player {
  x: number
  /** Posición de los pies (borde inferior); en el suelo vale GROUND_Y. */
  y: number
  /** Velocidad vertical (negativa = hacia arriba), en unidades/s. */
  vy: number
  /** Tamaño visual de pie (se ajusta al sprite recortado). */
  width: number
  height: number
  onGround: boolean
  ducking: boolean
  /** Saltos usados desde el último aterrizaje (2 = doble salto gastado). */
  jumpsUsed: number
  /** Tiempo que se lleva manteniendo el salto actual (salto variable). */
  jumpHoldTime: number
  /** Fase del rebote que simula la carrera. */
  runPhase: number
}

export type GroundObstacleKind = 'pokeball' | 'rock' | 'bush'
export type FlyingObstacleKind = 'flying-pokeball' | 'bird'
export type ObstacleKind = GroundObstacleKind | FlyingObstacleKind

export interface Obstacle {
  id: number
  kind: ObstacleKind
  /** Esquina superior izquierda de la caja visual. */
  x: number
  y: number
  width: number
  height: number
  /** Fase de animación (aleteo del pájaro, flotación de la Poké Ball). */
  phase: number
}

export interface Cloud {
  x: number
  y: number
  width: number
}

export interface Pebble {
  x: number
  y: number
  width: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
}

/** Entrada del jugador acumulada entre fotogramas (teclado, D-pad y táctil). */
export interface GameInput {
  jumpHeld: boolean
  /** Se pidió un salto desde el último fotograma. */
  jumpQueued: boolean
  duckHeld: boolean
  /** Agachado temporal (pulsación corta del D-pad con teclado). */
  duckTimer: number
}

/** Parámetros derivados de los datos del Pokémon. */
export interface GameConfig {
  baseSpeed: number
  maxSpeed: number
  canDoubleJump: boolean
}

/** Todo lo que el juego deriva de los datos del Pokémon (lo usan el juego y el panel de estado). */
export interface GameSetup {
  config: GameConfig
  theme: GameTheme
  /** Estadística base de Velocidad. */
  speedStat: number
  /** Motivo del doble salto ("tipo Volador", "habilidad Levitación") o null si no lo tiene. */
  doubleJumpReason: string | null
}

/** Sprite del Pokémon y el recorte de su parte opaca (sin el margen transparente). */
export interface SpriteFrame {
  image: HTMLImageElement | null
  sx: number
  sy: number
  sw: number
  sh: number
}

/** Lo que la Pokédex necesita saber del juego (puntaje en pantalla, panel de estado). */
export interface RunnerStatus {
  screen: GameScreen
  score: number
  record: number
  newRecord: boolean
}

/** Controles que la Pokédex (D-pad) envía al juego. */
export interface RunnerControls {
  /** Saltar mientras `pressed` sea true (salto variable). */
  setJump: (pressed: boolean) => void
  setDuck: (pressed: boolean) => void
  /** Agacharse un instante (pulsación de teclado sobre el D-pad). */
  tapDuck: () => void
}

/** Estado completo de una partida. Vive en un useRef: no provoca re-renders. */
export interface GameState {
  screen: GameScreen
  player: Player
  obstacles: Obstacle[]
  clouds: Cloud[]
  pebbles: Pebble[]
  particles: Particle[]
  speed: number
  /** Distancia recorrida en la partida actual. */
  distance: number
  score: number
  /** Distancia que falta para generar el siguiente grupo de obstáculos. */
  nextObstacleIn: number
  nextObstacleId: number
  /** Parpadeo del marcador al pasar cada centena. */
  flashTimer: number
  /** Reloj global (también corre en inicio, pausa y game over, para los parpadeos). */
  clock: number
  /** Tiempo desde el último cambio de pantalla. */
  screenTime: number
  newRecord: boolean
}
