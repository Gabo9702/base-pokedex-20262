import { useCallback, useEffect, useMemo, useRef, useState, type AnimationEvent } from 'react'
import { SECTIONS } from '../data/labels'
import type { PokedexEntry, PokedexState } from '../hooks/usePokedex'
import type { RunnerControls, RunnerStatus } from '../types/game'
import { capitalize, formatId } from '../utils/format'
import { formatScore } from '../utils/game/render'
import { gameSetupFor } from '../utils/game/setup'
import { DPad } from './DPad'
import { InfoScreen } from './InfoScreen'
import { GameStatusPanel } from './Pokedex/PokeRunner/GameStatusPanel'
import { PokeRunner } from './Pokedex/PokeRunner/PokeRunner'
import { TypeBadge } from './TypeBadge'
import './Pokedex.css'

interface PokedexProps {
  entry: PokedexEntry
  loading: boolean
  error: string | null
  /** Nunca 'closed': en ese estado la Pokédex está desmontada. */
  state: Exclude<PokedexState, 'closed'>
  /** Cierra la Pokédex con animación (botón cerrar y "Nueva búsqueda"). */
  onClose: () => void
  /** Se llama al terminar la animación de apertura o de cierre. */
  onTransitionDone: () => void
  onStep: (delta: 1 | -1) => void
  onRandom: () => void
}

function isTypingTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
}

/** Los nombres largos reducen el tamaño de letra para caber en el recuadro verde. */
function nameSizeClass(name: string): string {
  if (name.length > 15) return ' name-box__text--xlong'
  if (name.length > 11) return ' name-box__text--long'
  return ''
}

const INITIAL_RUNNER_STATUS: RunnerStatus = { screen: 'start', score: 0, record: 0, newRecord: false }

function isTouchScreen(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
}

export function Pokedex({
  entry,
  loading,
  error,
  state,
  onClose,
  onTransitionDone,
  onStep,
  onRandom,
}: PokedexProps) {
  const { pokemon } = entry
  // Mientras se abre o se cierra, todos los controles quedan deshabilitados (evita dobles clics).
  const busy = state === 'opening' || state === 'closing'
  const [section, setSection] = useState(0)
  // Guarda el id del Pokémon en versión shiny: al cambiar de Pokémon vuelve a la normal.
  const [shinyId, setShinyId] = useState<number | null>(null)
  const infoRef = useRef<HTMLDivElement>(null)

  // Minijuego PokeRunner: se guarda el id del Pokémon con el que se juega. Si cambia
  // el Pokémon o la Pokédex deja de estar abierta, el juego se cierra solo (se desmonta
  // PokeRunner y con él su bucle de animación y sus listeners).
  const [gameId, setGameId] = useState<number | null>(null)
  const gameOn = gameId === pokemon.id && state === 'open'
  const [runnerStatus, setRunnerStatus] = useState<RunnerStatus>(INITIAL_RUNNER_STATUS)
  // Transición de "encendido retro" de la pantalla: solo tras usar el botón JUGAR/SALIR
  const [screenFx, setScreenFx] = useState(false)
  const [touch] = useState(isTouchScreen)
  const runnerControls = useRef<RunnerControls | null>(null)
  const gameSetup = useMemo(() => gameSetupFor(pokemon), [pokemon])
  // Puente estable entre el D-pad y el juego montado (se lee el ref en el momento de pulsar)
  const dpadGameControls = useMemo<RunnerControls>(
    () => ({
      setJump: (pressed) => runnerControls.current?.setJump(pressed),
      setDuck: (pressed) => runnerControls.current?.setDuck(pressed),
      tapDuck: () => runnerControls.current?.tapDuck(),
    }),
    [],
  )

  const shiny = shinyId === pokemon.id
  const spriteSrc = (shiny && pokemon.sprites.front_shiny) || pokemon.sprites.front_default
  const mainType = pokemon.types[0]?.type.name
  const pokemonName = capitalize(pokemon.name)

  const toggleGame = () => {
    setScreenFx(true)
    setRunnerStatus(INITIAL_RUNNER_STATUS)
    setGameId(gameOn ? null : pokemon.id)
  }

  const exitGame = useCallback(() => {
    setScreenFx(true)
    setGameId(null)
  }, [])

  // Cambiar de Pokémon (RANDOM) cierra el juego de inmediato, sin esperar a que cargue el nuevo
  const handleRandom = () => {
    setGameId(null)
    onRandom()
  }

  const scrollInfo = useCallback((direction: 1 | -1) => {
    const el = infoRef.current
    if (el) el.scrollBy({ top: direction * el.clientHeight * 0.6, behavior: 'smooth' })
  }, [])

  // Atajos de teclado: ← → cambian de Pokémon, ↑ ↓ desplazan el texto, 0-9 eligen sección.
  // Durante el juego se desactivan: el teclado lo maneja PokeRunner.
  useEffect(() => {
    if (busy || gameOn) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || isTypingTarget(event.target)) return
      if (/^\d$/.test(event.key)) {
        setSection(Number(event.key))
        return
      }
      const actions: Record<string, () => void> = {
        ArrowLeft: () => onStep(-1),
        ArrowRight: () => onStep(1),
        ArrowUp: () => scrollInfo(-1),
        ArrowDown: () => scrollInfo(1),
      }
      const action = actions[event.key]
      if (action) {
        event.preventDefault()
        action()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [busy, gameOn, onStep, scrollInfo])

  // Solo cuenta el fin de la animación del propio escenario (las de los hijos también burbujean).
  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onTransitionDone()
  }

  return (
    <div className="pokedex-wrap">
      <div className="pokedex-toolbar">
        <button type="button" className="close-button" onClick={onClose} disabled={busy}>
          ✕ Cerrar Pokédex
        </button>
      </div>

      <div className={`pokedex pokedex--${state}`}>
        <div className="pokedex__stage" onAnimationEnd={handleAnimationEnd}>
          {/* ---------- Panel izquierdo ---------- */}
          <section className="panel panel--left" aria-label="Pantalla del Pokémon">
            <div className="panel__shadow" />
            <div className="panel__body">
              <div className="lens" aria-hidden="true" />
              <div className="lights" aria-hidden="true">
                <span className="light light--red" />
                <span className="light light--yellow" />
                <span className="light light--green" />
              </div>

              <button
                type="button"
                className="new-search-button"
                onClick={onClose}
                disabled={busy}
                aria-label="Nueva búsqueda"
              >
                <span>NUEVA BÚSQUEDA</span>
              </button>

              <div className="screen-frame">
                <div className="screen-dots" aria-hidden="true">
                  {/* El punto rojo parpadea mientras el juego está en uso */}
                  <span className={`dot dot--red${gameOn ? ' dot--blinking' : ''}`} />
                  <span className="dot dot--black" />
                </div>
                <div className="screen">
                  {/* La key reinicia la transición de encendido al entrar o salir del juego */}
                  <div
                    key={gameOn ? 'game' : 'sprite'}
                    className={`screen__content${screenFx ? ' screen__content--power' : ''}`}
                  >
                    {gameOn ? (
                      <PokeRunner
                        pokemonId={pokemon.id}
                        pokemonName={pokemon.name}
                        spriteUrl={spriteSrc}
                        setup={gameSetup}
                        controlsRef={runnerControls}
                        onStatusChange={setRunnerStatus}
                        onExit={exitGame}
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          className="screen__sprite"
                          onClick={() => setShinyId(shiny ? null : pokemon.id)}
                          disabled={busy}
                          aria-pressed={shiny}
                          aria-label={`Alternar entre versión normal y shiny de ${pokemonName}`}
                          title="Clic para alternar shiny"
                        >
                          {spriteSrc ? (
                            <img src={spriteSrc} alt={`Sprite de ${pokemonName}`} />
                          ) : (
                            <span className="screen__no-sprite">Sin sprite</span>
                          )}
                        </button>
                        {shiny && <span className="screen__shiny">★ Shiny</span>}
                      </>
                    )}
                  </div>
                  {gameOn ? (
                    // Durante el juego el número se reemplaza por el puntaje; la key hace
                    // parpadear el marcador cada vez que se pasa una centena.
                    <span
                      key={Math.floor(runnerStatus.score / 100)}
                      className={`screen__number screen__number--score${
                        runnerStatus.score >= 100 ? ' screen__number--flash' : ''
                      }`}
                      aria-label={`Puntaje ${runnerStatus.score}`}
                    >
                      {formatScore(runnerStatus.score)}
                    </span>
                  ) : (
                    <span className="screen__number">{formatId(pokemon.id)}</span>
                  )}
                  {loading && (
                    <span className="screen__loading" role="status">
                      Cargando…
                    </span>
                  )}
                </div>
              </div>

              {/* Botón rojo: JUGAR / SALIR del minijuego PokeRunner */}
              <button
                type="button"
                className={`action-button${gameOn ? ' is-active' : ''}`}
                onClick={toggleGame}
                disabled={busy}
                aria-pressed={gameOn}
                aria-label={gameOn ? 'Salir del juego' : `Jugar con ${pokemonName}`}
                title={gameOn ? 'Salir del juego (Esc)' : `▶ Jugar PokeRunner con ${pokemonName}`}
              >
                <span className="action-button__label" aria-hidden="true">
                  {gameOn ? 'Salir' : 'Jugar'}
                </span>
              </button>
              <span className="speaker" aria-hidden="true" />

              <div className="name-box">
                <span className={`name-box__text${nameSizeClass(pokemon.name)}`}>
                  {capitalize(pokemon.name)}
                </span>
              </div>

              <div className="dpad-slot">
                <DPad
                  onUp={() => scrollInfo(-1)}
                  onDown={() => scrollInfo(1)}
                  onLeft={() => onStep(-1)}
                  onRight={() => onStep(1)}
                  disabled={busy}
                  game={gameOn ? dpadGameControls : null}
                />
              </div>
            </div>
          </section>

          {/* ---------- Panel derecho (tapa que se despliega) ---------- */}
          <section className="panel panel--right" aria-label="Información del Pokémon">
            {/* Cara exterior de la tapa: es lo que se ve cuando está cerrada sobre el panel izquierdo */}
            <div className="panel__back" aria-hidden="true" />
            <div className="panel__shadow" />
            <div className="panel__body">
              <div className="info-frame">
                {/* La key reinicia el scroll al cambiar de sección o de Pokémon */}
                <div
                  className="info-screen"
                  ref={infoRef}
                  key={`${pokemon.id}-${gameOn ? 'game' : section}`}
                  tabIndex={0}
                  // El panel del juego cambia muy seguido (puntaje): no se anuncia en vivo
                  aria-live={gameOn ? 'off' : 'polite'}
                >
                  {gameOn ? (
                    <GameStatusPanel
                      pokemonName={pokemon.name}
                      setup={gameSetup}
                      status={runnerStatus}
                      touch={touch}
                    />
                  ) : error ? (
                    <p className="error-text">{error}</p>
                  ) : (
                    <InfoScreen entry={entry} section={section} />
                  )}
                </div>
              </div>

              {/* Durante la partida los botones 0–9 quedan deshabilitados (y atenuados) */}
              <div
                className={`keypad${gameOn ? ' keypad--locked' : ''}`}
                role="group"
                aria-label="Secciones de información"
              >
                {SECTIONS.map(({ title }, index) => (
                  <button
                    key={title}
                    type="button"
                    className={`keypad__button${section === index ? ' is-active' : ''}`}
                    onClick={() => setSection(index)}
                    disabled={busy || gameOn}
                    aria-pressed={section === index}
                    aria-label={`${index}: ${title}`}
                    title={title}
                  >
                    {index}
                  </button>
                ))}
              </div>

              <div className="type-box" title="Tipo principal">
                {mainType && (
                  <span className="type-box__badge">
                    <TypeBadge name={mainType} />
                  </span>
                )}
              </div>

              <button
                type="button"
                className="random-button"
                onClick={handleRandom}
                disabled={busy}
                title="Pokémon aleatorio"
              >
                <span>RANDOM</span>
              </button>
            </div>
          </section>

          {/* ---------- Bisagra ---------- */}
          <div className="hinge" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
}
