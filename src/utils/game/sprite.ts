// Carga del sprite del Pokémon como HTMLImageElement y recorte de su margen transparente.
import type { SpriteFrame } from '../../types/game'

export const EMPTY_SPRITE: SpriteFrame = { image: null, sx: 0, sy: 0, sw: 0, sh: 0 }

/**
 * Busca el rectángulo que contiene los píxeles opacos del sprite. Los sprites de
 * PokeAPI tienen mucho margen transparente; recortarlo permite que la hitbox
 * (80 % de la caja visual) se ajuste al cuerpo real del Pokémon.
 * Si el canvas queda "contaminado" (sin CORS) se usa la imagen completa.
 */
function opaqueBounds(image: HTMLImageElement): SpriteFrame {
  const full: SpriteFrame = { image, sx: 0, sy: 0, sw: image.naturalWidth, sh: image.naturalHeight }
  try {
    const canvas = document.createElement('canvas')
    canvas.width = image.naturalWidth
    canvas.height = image.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return full
    ctx.drawImage(image, 0, 0)
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height)

    let minX = width
    let minY = height
    let maxX = -1
    let maxY = -1
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (data[(y * width + x) * 4 + 3] > 16) {
          if (x < minX) minX = x
          if (x > maxX) maxX = x
          if (y < minY) minY = y
          if (y > maxY) maxY = y
        }
      }
    }
    if (maxX < 0) return full
    return { image, sx: minX, sy: minY, sw: maxX - minX + 1, sh: maxY - minY + 1 }
  } catch {
    return full
  }
}

/** Carga una imagen, con o sin CORS. */
function loadImage(url: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (cors) image.crossOrigin = 'anonymous'
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`No se pudo cargar el sprite: ${url}`))
    image.src = url
  })
}

/**
 * Carga el sprite con crossOrigin "anonymous" (necesario para leer sus píxeles y
 * recortarlo). Si el servidor no permitiera CORS, se reintenta sin él: la imagen
 * se puede dibujar igual, solo que sin recorte.
 */
export async function loadSprite(url: string): Promise<SpriteFrame> {
  try {
    return opaqueBounds(await loadImage(url, true))
  } catch {
    const image = await loadImage(url, false)
    return { image, sx: 0, sy: 0, sw: image.naturalWidth, sh: image.naturalHeight }
  }
}
