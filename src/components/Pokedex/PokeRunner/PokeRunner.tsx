import { useEffect, useRef, type RefObject } from 'react'
import { usePokeRunner } from '../../../hooks/usePokeRunner'
import type { GameScreen, GameSetup, RunnerControls, RunnerStatus } from '../../../types/game'
import { capitalize } from '../../../utils/format'
import './PokeRunner.css'

interface PokeRunnerProps {
  pokemonId: number
  pokemonName: string
  /** Sprite normal o shiny, según lo que muestre la Pokédex. */
  spriteUrl: string | null
  setup: GameSetup
  /** La Pokédex guarda aquí los controles para que el D-pad pueda saltar y agacharse. */
  controlsRef: RefObject<RunnerControls | null>
  onStatusChange: (status: RunnerStatus) => void
  onExit: () => void
}

/** Descripción accesible del estado del juego para el canvas (role="img"). */
function describe(screen: GameScreen, name: string, score: number, record: number): string {
  switch (screen) {
    case 'start':
      return `PokeRunner con ${name}: pantalla de inicio, récord ${record}`
    case 'playing':
      return `Juego en curso, puntaje ${score}`
    case 'paused':
      return `Juego en pausa, puntaje ${score}`
    case 'gameover':
      return `Game over, puntaje ${score}, récord ${record}`
  }
}

/**
 * Minijuego tipo "dinosaurio de Chrome" que ocupa la pantalla negra de la Pokédex.
 * Montarlo empieza el juego y desmontarlo libera todos sus recursos.
 */
export function PokeRunner({
  pokemonId,
  pokemonName,
  spriteUrl,
  setup,
  controlsRef,
  onStatusChange,
  onExit,
}: PokeRunnerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { screen, score, record, controls, pointerHandlers } = usePokeRunner({
    canvasRef,
    containerRef,
    pokemonId,
    spriteUrl,
    setup,
    onExit,
    onStatusChange,
  })

  // Expone los controles al D-pad mientras el juego está montado
  useEffect(() => {
    controlsRef.current = controls
    return () => {
      controlsRef.current = null
    }
  }, [controls, controlsRef])

  // El foco pasa al juego: la barra espaciadora ya no "pulsa" el botón JUGAR enfocado
  useEffect(() => {
    containerRef.current?.focus({ preventScroll: true })
  }, [])

  return (
    <div className="poke-runner" ref={containerRef} tabIndex={-1} {...pointerHandlers}>
      <canvas
        ref={canvasRef}
        className="poke-runner__canvas"
        role="img"
        aria-label={describe(screen, capitalize(pokemonName), score, record)}
      />
    </div>
  )
}
