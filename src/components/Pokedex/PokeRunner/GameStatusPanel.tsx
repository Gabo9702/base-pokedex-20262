import type { GameSetup, RunnerStatus } from '../../../types/game'
import { capitalize } from '../../../utils/format'
import { formatScore } from '../../../utils/game/render'

interface GameStatusPanelProps {
  pokemonName: string
  setup: GameSetup
  status: RunnerStatus
  /** Pantalla táctil: se muestran los controles táctiles primero. */
  touch: boolean
}

const SCREEN_LABELS: Record<RunnerStatus['screen'], string> = {
  start: 'Esperando inicio',
  playing: 'Jugando',
  paused: 'En pausa',
  gameover: 'Game over',
}

/** Panel de estado del juego en la pantalla de texto del panel derecho. */
export function GameStatusPanel({ pokemonName, setup, status, touch }: GameStatusPanelProps) {
  const { config, theme, speedStat, doubleJumpReason } = setup

  return (
    <>
      <h2 className="info-title">PokeRunner · {capitalize(pokemonName)}</h2>
      <ul className="game-status__list">
        <li>
          <span>Estado</span>
          <span className="game-status__value">{SCREEN_LABELS[status.screen]}</span>
        </li>
        <li>
          <span>Puntaje</span>
          <span className="game-status__value">{formatScore(status.score)}</span>
        </li>
        <li>
          <span>Récord personal</span>
          <span className="game-status__value">
            {formatScore(status.record)}
            {status.newRecord && ' ★'}
          </span>
        </li>
        <li>
          <span>Doble salto</span>
          <span className={`game-status__value${doubleJumpReason ? ' game-status__value--yes' : ''}`}>
            {doubleJumpReason ? `SÍ (${doubleJumpReason})` : 'NO'}
          </span>
        </li>
        <li>
          <span>Velocidad inicial</span>
          <span className="game-status__value">
            {Math.round(config.baseSpeed)} (stat {speedStat})
          </span>
        </li>
        <li>
          <span>Escenario</span>
          <span className="game-status__value">{theme.name}</span>
        </li>
      </ul>

      <h3 className="game-status__subtitle">Controles</h3>
      <ul className="plain-list">
        {touch && (
          <li>
            <span className="game-status__keys">Tocar</span> saltar ·{' '}
            <span className="game-status__keys">Deslizar ↓</span> agacharse
          </li>
        )}
        <li>
          <span className="game-status__keys">↑ / Espacio</span> saltar (mantén para saltar más alto)
        </li>
        <li>
          <span className="game-status__keys">↓</span> agacharse / caer rápido
        </li>
        <li>
          <span className="game-status__keys">D-pad ▲ ▼</span> saltar / agacharse
        </li>
        <li>
          <span className="game-status__keys">Esc</span> o botón rojo: salir
        </li>
      </ul>
    </>
  )
}
