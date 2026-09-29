// Dibujo del juego en el canvas. Todas las coordenadas son lógicas: el llamador
// ya aplicó la transformación que escala GAME_WIDTH x GAME_HEIGHT al tamaño real.
import type { Cloud, GameState, GameTheme, Obstacle, Particle, Player, SpriteFrame } from '../../types/game'
import { playerBox } from './collisions'
import { GAME_HEIGHT, GAME_WIDTH, GROUND_Y } from './constants'
import { runBob } from './physics'

export interface HudInfo {
  record: number
  /** Pantalla táctil: los textos dicen "TOCA" en lugar de "↑". */
  touch: boolean
}

const FONT_FAMILY = "'VT323', ui-monospace, monospace"

/** Formato de marcador de 5 dígitos: 125 -> "00125". */
export function formatScore(score: number): string {
  return String(Math.min(Math.floor(score), 99999)).padStart(5, '0')
}

/** Parpadeo cuadrado: visible/oculto `perSecond` veces por segundo. */
function blinkOn(time: number, perSecond = 2): boolean {
  return Math.floor(time * perSecond * 2) % 2 === 0
}

function text(ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center') {
  ctx.font = `${size}px ${FONT_FAMILY}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(value, x, y)
}

// ---------- Escenario ----------

function drawCloud(ctx: CanvasRenderingContext2D, cloud: Cloud, color: string) {
  const { x, y, width } = cloud
  const h = width * 0.28
  ctx.fillStyle = color
  ctx.fillRect(x, y, width, h)
  ctx.fillRect(x + width * 0.2, y - h * 0.6, width * 0.45, h * 0.7)
  ctx.fillRect(x + width * 0.5, y - h * 0.35, width * 0.3, h * 0.4)
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle, theme: GameTheme) {
  const fade = 1 - particle.life / particle.maxLife
  ctx.fillStyle = particle.color
  ctx.strokeStyle = particle.color
  switch (theme.particle) {
    case 'bubbles':
      ctx.globalAlpha = 0.8 * fade
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.stroke()
      break
    case 'leaves':
      ctx.globalAlpha = Math.min(1, fade * 2)
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(particle.life * 3)
      ctx.fillRect(-particle.size, -particle.size / 2, particle.size * 2, particle.size)
      ctx.restore()
      break
    case 'stars':
      // Titilan: aparecen y desaparecen suavemente
      ctx.globalAlpha = Math.sin((particle.life / particle.maxLife) * Math.PI)
      ctx.fillRect(particle.x - particle.size, particle.y, particle.size * 2 + 1, 1)
      ctx.fillRect(particle.x, particle.y - particle.size, 1, particle.size * 2 + 1)
      break
    case 'sparks': {
      // Destello en zigzag, muy breve
      ctx.globalAlpha = fade
      ctx.lineWidth = 2
      const s = particle.size
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y - s)
      ctx.lineTo(particle.x - s * 0.4, particle.y)
      ctx.lineTo(particle.x + s * 0.3, particle.y)
      ctx.lineTo(particle.x - s * 0.1, particle.y + s)
      ctx.stroke()
      break
    }
    default: // brasas y nieve
      ctx.globalAlpha = theme.particle === 'embers' ? fade : 0.9
      ctx.fillRect(particle.x, particle.y, particle.size, particle.size)
  }
  ctx.globalAlpha = 1
}

function drawGround(ctx: CanvasRenderingContext2D, state: GameState, theme: GameTheme) {
  ctx.fillStyle = theme.ground
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, 2)
  ctx.fillStyle = theme.groundDetail
  for (const pebble of state.pebbles) {
    ctx.fillRect(pebble.x, pebble.y, pebble.width, 2)
  }
}

// ---------- Obstáculos ----------

function drawPokeBall(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  const line = Math.max(2, r * 0.18)
  // Mitad superior roja y mitad inferior blanca
  ctx.fillStyle = '#e3350d'
  ctx.beginPath()
  ctx.arc(cx, cy, r, Math.PI, 0)
  ctx.fill()
  ctx.fillStyle = '#f4f4f4'
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI)
  ctx.fill()
  // Contorno y línea central
  ctx.strokeStyle = '#111'
  ctx.lineWidth = line * 0.6
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#111'
  ctx.fillRect(cx - r, cy - line / 2, r * 2, line)
  // Botón central
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.34, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f4f4f4'
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.2, 0, Math.PI * 2)
  ctx.fill()
}

function drawRock(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const { x, y, width: w, height: h } = o
  ctx.fillStyle = '#7d7d86'
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x + w * 0.1, y + h * 0.35)
  ctx.lineTo(x + w * 0.4, y)
  ctx.lineTo(x + w * 0.75, y + h * 0.12)
  ctx.lineTo(x + w, y + h * 0.55)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
  ctx.fill()
  // Brillo en la cara superior
  ctx.fillStyle = '#a9a9b3'
  ctx.beginPath()
  ctx.moveTo(x + w * 0.18, y + h * 0.38)
  ctx.lineTo(x + w * 0.4, y + h * 0.1)
  ctx.lineTo(x + w * 0.55, y + h * 0.2)
  ctx.lineTo(x + w * 0.3, y + h * 0.5)
  ctx.closePath()
  ctx.fill()
}

function drawBush(ctx: CanvasRenderingContext2D, o: Obstacle) {
  const { x, y, width: w, height: h } = o
  const r = h * 0.42
  ctx.fillStyle = '#2f8a3a'
  ctx.fillRect(x + r * 0.4, y + h - r, w - r * 0.8, r)
  for (const [fx, fy, fr] of [
    [0.25, 0.62, 1],
    [0.5, 0.4, 1.15],
    [0.75, 0.62, 1],
  ] as const) {
    ctx.beginPath()
    ctx.arc(x + w * fx, y + h * fy, r * fr, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#4fbf55'
  ctx.beginPath()
  ctx.arc(x + w * 0.45, y + h * 0.32, r * 0.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawBird(ctx: CanvasRenderingContext2D, o: Obstacle, color: string) {
  const { x, y, width: w, height: h } = o
  const cy = y + h / 2
  const flap = Math.sin(o.phase) // -1..1: alas arriba o abajo
  ctx.fillStyle = color
  // Cuerpo y cabeza (mira hacia la izquierda, hacia el Pokémon)
  ctx.beginPath()
  ctx.ellipse(x + w * 0.55, cy, w * 0.3, h * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + w * 0.22, cy - h * 0.08, h * 0.17, 0, Math.PI * 2)
  ctx.fill()
  // Pico
  ctx.fillStyle = '#ffb300'
  ctx.beginPath()
  ctx.moveTo(x + w * 0.1, cy - h * 0.12)
  ctx.lineTo(x, cy - h * 0.02)
  ctx.lineTo(x + w * 0.1, cy)
  ctx.closePath()
  ctx.fill()
  // Ala que aletea
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + w * 0.4, cy)
  ctx.lineTo(x + w * 0.75, cy)
  ctx.lineTo(x + w * 0.62, cy - flap * h * 0.5)
  ctx.closePath()
  ctx.fill()
}

function drawObstacle(ctx: CanvasRenderingContext2D, o: Obstacle, theme: GameTheme) {
  switch (o.kind) {
    case 'pokeball':
      drawPokeBall(ctx, o.x + o.width / 2, o.y + o.height / 2, o.width / 2)
      break
    case 'flying-pokeball':
      // Flota: leve oscilación solo visual (la hitbox no se mueve)
      drawPokeBall(ctx, o.x + o.width / 2, o.y + o.height / 2 + Math.sin(o.phase) * 1.5, o.width / 2)
      break
    case 'rock':
      drawRock(ctx, o)
      break
    case 'bush':
      drawBush(ctx, o)
      break
    case 'bird':
      drawBird(ctx, o, theme.text)
      break
  }
}

// ---------- Pokémon ----------

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, sprite: SpriteFrame, running: boolean, theme: GameTheme) {
  const box = playerBox(player)
  const bottom = player.y + runBob(player, running)
  ctx.save()
  ctx.translate(box.x + box.width / 2, bottom)
  if (sprite.image) {
    // Los sprites frontales miran a la izquierda: se voltean para que corra hacia la derecha.
    // Agachado, la escala vertical ya viene reducida en box.height (se "aplasta").
    ctx.scale(-1, 1)
    ctx.drawImage(sprite.image, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -box.width / 2, -box.height, box.width, box.height)
  } else {
    // Sin sprite (o aún cargando): silueta simple
    ctx.fillStyle = theme.text
    ctx.fillRect(-box.width / 2, -box.height, box.width, box.height)
  }
  ctx.restore()
}

// ---------- Textos (marcador y pantallas) ----------

function drawHud(ctx: CanvasRenderingContext2D, state: GameState, theme: GameTheme, record: number) {
  const scoreVisible = state.flashTimer <= 0 || blinkOn(state.flashTimer, 4)
  text(ctx, `HI ${formatScore(record)}`, GAME_WIDTH - 96, 22, 22, theme.textDim, 'right')
  if (scoreVisible) text(ctx, formatScore(state.score), GAME_WIDTH - 16, 22, 22, theme.text, 'right')
}

function drawPanel(ctx: CanvasRenderingContext2D, y: number, height: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(GAME_WIDTH / 2 - 170, y, 340, height)
}

function drawOverlay(ctx: CanvasRenderingContext2D, state: GameState, theme: GameTheme, hud: HudInfo) {
  const action = hud.touch ? 'TOCA' : '↑'
  const center = GAME_WIDTH / 2
  switch (state.screen) {
    case 'start':
      if (blinkOn(state.clock, 1.2)) {
        text(ctx, hud.touch ? 'TOCA PARA EMPEZAR' : 'PRESIONA ↑ PARA EMPEZAR', center, 140, 30, theme.text)
      }
      break
    case 'paused':
      drawPanel(ctx, 100, 90)
      text(ctx, 'PAUSA', center, 130, 44, theme.text)
      text(ctx, `${action} PARA CONTINUAR`, center, 168, 22, theme.textDim)
      break
    case 'gameover':
      drawPanel(ctx, 62, 190)
      text(ctx, 'GAME OVER', center, 92, 48, theme.text)
      text(ctx, `PUNTAJE ${formatScore(state.score)}`, center, 132, 24, theme.text)
      text(ctx, `RÉCORD ${formatScore(Math.max(hud.record, state.score))}`, center, 158, 24, theme.textDim)
      if (state.newRecord && blinkOn(state.clock, 2.5)) text(ctx, '¡NUEVO RÉCORD!', center, 188, 28, theme.accent)
      text(ctx, `${action} PARA REINTENTAR`, center, 226, 22, theme.textDim)
      break
    case 'playing':
      break
  }
}

/** Dibuja un fotograma completo. */
export function drawGame(ctx: CanvasRenderingContext2D, state: GameState, theme: GameTheme, sprite: SpriteFrame, hud: HudInfo) {
  ctx.fillStyle = theme.background
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)
  ctx.imageSmoothingEnabled = false // estilo pixelado

  for (const cloud of state.clouds) drawCloud(ctx, cloud, theme.cloud)
  for (const particle of state.particles) drawParticle(ctx, particle, theme)
  drawGround(ctx, state, theme)
  for (const obstacle of state.obstacles) drawObstacle(ctx, obstacle, theme)
  drawPlayer(ctx, state.player, sprite, state.screen === 'playing', theme)
  drawHud(ctx, state, theme, hud.record)
  drawOverlay(ctx, state, theme, hud)
}
