import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type RefObject,
} from 'react'
import type {
  GameInput,
  GameScreen,
  GameSetup,
  GameState,
  RunnerControls,
  RunnerStatus,
  SpriteFrame,
} from '../types/game'
import { GAME_HEIGHT, GAME_WIDTH, MAX_DELTA, RETRY_DELAY } from '../utils/game/constants'
import { createGameState, stepGame, withScreen } from '../utils/game/engine'
import { fitPlayerSize } from '../utils/game/physics'
import { readRecord, writeRecord } from '../utils/game/record'
import { drawGame } from '../utils/game/render'
import { EMPTY_SPRITE, loadSprite } from '../utils/game/sprite'

interface UsePokeRunnerOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>
  containerRef: RefObject<HTMLDivElement | null>
  pokemonId: number
  spriteUrl: string | null
  setup: GameSetup
  /** Escape: salir del juego. */
  onExit: () => void
  onStatusChange: (status: RunnerStatus) => void
}

/** Transformación de coordenadas lógicas a píxeles reales del canvas. */
interface Viewport {
  scale: number
  offsetX: number
  offsetY: number
}

/** Deslizar el dedo esta distancia (px CSS) hacia abajo cuenta como "agacharse". */
const SWIPE_DOWN_DISTANCE = 30
/** Duración del agachado por una pulsación corta. */
const DUCK_TAP_TIME = 0.45

const JUMP_KEYS = new Set(['ArrowUp', ' ', 'Spacebar'])

function matches(query: string): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia(query).matches
}

/**
 * Lógica del minijuego PokeRunner.
 *
 * - Posición, velocidad, obstáculos y puntaje viven en useRef (stateRef): el bucle
 *   de requestAnimationFrame los actualiza sin provocar re-renders.
 * - useState solo guarda la pantalla actual, el puntaje entero mostrado fuera del
 *   canvas y el récord.
 * - Cada efecto limpia lo suyo (rAF, listeners, ResizeObserver) al desmontarse,
 *   así que desmontar el componente libera todos los recursos del juego.
 */
export function usePokeRunner({
  canvasRef,
  containerRef,
  pokemonId,
  spriteUrl,
  setup,
  onExit,
  onStatusChange,
}: UsePokeRunnerOptions) {
  const { config, theme } = setup
  const [record, setRecord] = useState(() => readRecord(pokemonId))
  const [screen, setScreen] = useState<GameScreen>('start')
  const [score, setScore] = useState(0)
  const [newRecord, setNewRecord] = useState(false)
  // Sin partículas con prefers-reduced-motion; en pantallas táctiles los textos dicen "TOCA"
  const [reducedMotion] = useState(() => matches('(prefers-reduced-motion: reduce)'))
  const [touch] = useState(() => matches('(pointer: coarse)'))

  const stateRef = useRef<GameState | null>(null)
  const inputRef = useRef<GameInput>({ jumpHeld: false, jumpQueued: false, duckHeld: false, duckTimer: 0 })
  const spriteRef = useRef<SpriteFrame>(EMPTY_SPRITE)
  const recordRef = useRef(record)
  const viewRef = useRef<Viewport>({ scale: 1, offsetX: 0, offsetY: 0 })
  const pointerStartY = useRef<number | null>(null)

  /** Estado actual; se crea la primera vez que se necesita. */
  const currentState = useCallback((): GameState => {
    if (!stateRef.current) {
      const sprite = spriteRef.current
      const size = fitPlayerSize(sprite.sw, sprite.sh)
      stateRef.current = createGameState(size.width, size.height, config, Math.random)
    }
    return stateRef.current
  }, [config])

  // ---------- Acciones del jugador ----------

  const startRun = useCallback(() => {
    const sprite = spriteRef.current
    const size = fitPlayerSize(sprite.sw, sprite.sh)
    stateRef.current = createGameState(size.width, size.height, config, Math.random, 'playing')
    inputRef.current.jumpQueued = true // la misma pulsación que empieza la partida hace saltar
    setScreen('playing')
    setScore(0)
    setNewRecord(false)
  }, [config])

  const pressJump = useCallback(() => {
    const state = currentState()
    const input = inputRef.current
    input.jumpHeld = true
    switch (state.screen) {
      case 'start':
        startRun()
        break
      case 'gameover':
        if (state.screenTime >= RETRY_DELAY) startRun()
        break
      case 'paused':
        stateRef.current = withScreen(state, 'playing')
        setScreen('playing')
        break
      case 'playing':
        input.jumpQueued = true
        break
    }
  }, [currentState, startRun])

  const releaseJump = useCallback(() => {
    inputRef.current.jumpHeld = false
  }, [])

  const setDuck = useCallback((pressed: boolean) => {
    inputRef.current.duckHeld = pressed
  }, [])

  const controls = useMemo<RunnerControls>(
    () => ({
      setJump: (pressed) => (pressed ? pressJump() : releaseJump()),
      setDuck,
      tapDuck: () => {
        inputRef.current.duckTimer = DUCK_TAP_TIME
      },
    }),
    [pressJump, releaseJump, setDuck],
  )

  const exitGame = useEffectEvent(onExit)

  // ---------- Bucle principal (requestAnimationFrame + delta time) ----------

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let frameId = 0
    let last = performance.now()

    const tick = (now: number) => {
      // Delta time en segundos: la velocidad es la misma a 60 Hz, 120 Hz o 144 Hz
      const dt = Math.min(Math.max((now - last) / 1000, 0), MAX_DELTA)
      last = now

      const input = inputRef.current
      const prev = currentState()
      let next = stepGame(prev, input, dt, { config, theme, rng: Math.random, particles: !reducedMotion })
      input.jumpQueued = false
      input.duckTimer = Math.max(0, input.duckTimer - dt)

      if (prev.screen === 'playing' && next.screen === 'gameover') {
        const isRecord = next.score > recordRef.current
        if (isRecord) {
          recordRef.current = next.score
          writeRecord(pokemonId, next.score)
          setRecord(next.score)
        }
        next = { ...next, newRecord: isRecord }
        setNewRecord(isRecord)
        setScreen('gameover')
      }
      // Solo se actualiza el estado de React cuando cambia el puntaje entero
      if (next.score !== prev.score) setScore(next.score)
      stateRef.current = next

      // Fondo en todo el canvas y luego el área lógica escalada y centrada
      const view = viewRef.current
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = theme.background
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(view.scale, 0, 0, view.scale, view.offsetX, view.offsetY)
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, GAME_WIDTH, GAME_HEIGHT)
      ctx.clip()
      drawGame(ctx, next, theme, spriteRef.current, { record: recordRef.current, touch })
      ctx.restore()

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [canvasRef, config, theme, pokemonId, reducedMotion, touch, currentState])

  // ---------- Resolución nítida (devicePixelRatio) y adaptación al tamaño ----------

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      // clientWidth/Height: tamaño de maquetación, sin las transformaciones 3D de la Pokédex
      canvas.width = Math.max(1, Math.round(container.clientWidth * dpr))
      canvas.height = Math.max(1, Math.round(container.clientHeight * dpr))
      const scale = Math.min(canvas.width / GAME_WIDTH, canvas.height / GAME_HEIGHT)
      viewRef.current = {
        scale,
        offsetX: (canvas.width - GAME_WIDTH * scale) / 2,
        offsetY: (canvas.height - GAME_HEIGHT * scale) / 2,
      }
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [canvasRef, containerRef])

  // ---------- Sprite del Pokémon ----------

  useEffect(() => {
    spriteRef.current = EMPTY_SPRITE
    if (!spriteUrl) return
    let cancelled = false
    loadSprite(spriteUrl)
      .then((frame) => {
        if (cancelled) return
        spriteRef.current = frame
        // Ajusta el tamaño del Pokémon (y su hitbox) al sprite recortado
        const state = stateRef.current
        if (state) {
          stateRef.current = { ...state, player: { ...state.player, ...fitPlayerSize(frame.sw, frame.sh) } }
        }
      })
      .catch(() => {
        // Sin sprite se dibuja una silueta simple.
      })
    return () => {
      cancelled = true
    }
  }, [spriteUrl])

  // ---------- Teclado (solo mientras el juego está montado) ----------

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (JUMP_KEYS.has(event.key)) {
        event.preventDefault() // evita el desplazamiento de la página y "pulsar" el botón enfocado
        if (!event.repeat) pressJump()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setDuck(true)
      } else if (event.key === 'Escape') {
        event.preventDefault()
        exitGame()
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (JUMP_KEYS.has(event.key)) {
        event.preventDefault()
        releaseJump()
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setDuck(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [pressJump, releaseJump, setDuck])

  // ---------- Pausa automática al perder la pestaña ----------

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) return
      const input = inputRef.current
      input.jumpHeld = false
      input.duckHeld = false
      const state = stateRef.current
      if (state?.screen === 'playing') {
        stateRef.current = withScreen(state, 'paused')
        setScreen('paused')
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  // ---------- Estado hacia la Pokédex ----------

  useEffect(() => {
    onStatusChange({ screen, score, record, newRecord })
  }, [screen, score, record, newRecord, onStatusChange])

  // ---------- Táctil: tocar salta, deslizar hacia abajo agacha ----------

  const pointerHandlers = useMemo(
    () => ({
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        pointerStartY.current = event.clientY
        pressJump()
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        const start = pointerStartY.current
        if (start !== null && event.clientY - start > SWIPE_DOWN_DISTANCE) {
          releaseJump()
          setDuck(true)
        }
      },
      onPointerUp: () => {
        pointerStartY.current = null
        releaseJump()
        setDuck(false)
      },
      onPointerCancel: () => {
        pointerStartY.current = null
        releaseJump()
        setDuck(false)
      },
    }),
    [pressJump, releaseJump, setDuck],
  )

  return { screen, score, record, newRecord, controls, pointerHandlers }
}
