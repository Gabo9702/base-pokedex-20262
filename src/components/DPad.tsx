import type { MouseEvent } from 'react'
import type { RunnerControls } from '../types/game'
import './DPad.css'

interface DPadProps {
  onUp: () => void
  onDown: () => void
  onLeft: () => void
  onRight: () => void
  /** Deshabilita la cruceta (p. ej. durante la animación de apertura o cierre). */
  disabled?: boolean
  /**
   * Modo juego (PokeRunner): ▲ salta (mantener = salto más alto), ▼ agacha, y
   * ◀ ▶ quedan deshabilitadas para no cambiar de Pokémon por accidente.
   */
  game?: RunnerControls | null
}

/** Cruceta negra: izquierda/derecha cambian de Pokémon, arriba/abajo desplazan el texto. */
export function DPad({ onUp, onDown, onLeft, onRight, disabled = false, game = null }: DPadProps) {
  if (game) {
    // Con ratón o dedo se usa pointerdown/up (permite mantener pulsado). Un clic con
    // detail === 0 viene del teclado (Enter/Espacio sobre el botón): pulsación corta.
    const isKeyboardClick = (event: MouseEvent) => event.detail === 0
    return (
      <div className="dpad dpad--game" role="group" aria-label="Cruceta (modo juego)">
        <button
          type="button"
          disabled={disabled}
          className="dpad__arm dpad__arm--up"
          onPointerDown={() => game.setJump(true)}
          onPointerUp={() => game.setJump(false)}
          onPointerLeave={() => game.setJump(false)}
          onPointerCancel={() => game.setJump(false)}
          onClick={(event) => {
            if (!isKeyboardClick(event)) return
            game.setJump(true)
            game.setJump(false)
          }}
          aria-label="Saltar"
          title="Saltar"
        />
        <button type="button" disabled className="dpad__arm dpad__arm--left" aria-label="Pokémon anterior (deshabilitado durante el juego)" />
        <span className="dpad__center" aria-hidden="true" />
        <button type="button" disabled className="dpad__arm dpad__arm--right" aria-label="Pokémon siguiente (deshabilitado durante el juego)" />
        <button
          type="button"
          disabled={disabled}
          className="dpad__arm dpad__arm--down"
          onPointerDown={() => game.setDuck(true)}
          onPointerUp={() => game.setDuck(false)}
          onPointerLeave={() => game.setDuck(false)}
          onPointerCancel={() => game.setDuck(false)}
          onClick={(event) => {
            if (isKeyboardClick(event)) game.tapDuck()
          }}
          aria-label="Agacharse"
          title="Agacharse"
        />
      </div>
    )
  }

  return (
    <div className="dpad" role="group" aria-label="Cruceta">
      <button type="button" disabled={disabled} className="dpad__arm dpad__arm--up" onClick={onUp} aria-label="Desplazar texto hacia arriba" title="Texto ▲" />
      <button type="button" disabled={disabled} className="dpad__arm dpad__arm--left" onClick={onLeft} aria-label="Pokémon anterior" title="Anterior" />
      <span className="dpad__center" aria-hidden="true" />
      <button type="button" disabled={disabled} className="dpad__arm dpad__arm--right" onClick={onRight} aria-label="Pokémon siguiente" title="Siguiente" />
      <button type="button" disabled={disabled} className="dpad__arm dpad__arm--down" onClick={onDown} aria-label="Desplazar texto hacia abajo" title="Texto ▼" />
    </div>
  )
}
