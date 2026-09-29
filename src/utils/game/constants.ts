// Sistema de coordenadas lógico del juego. Todo se calcula en estas unidades y
// luego se escala al tamaño real del canvas, así la dificultad es la misma en
// cualquier pantalla. La proporción (≈1,7) coincide con la pantalla negra.
export const GAME_WIDTH = 600
export const GAME_HEIGHT = 352

/** Altura de la línea del suelo (los pies del Pokémon se apoyan aquí). */
export const GROUND_Y = 300

/** Posición horizontal fija del Pokémon. */
export const PLAYER_X = 56

/** Tamaño máximo con el que se dibuja el sprite recortado. */
export const PLAYER_MAX_WIDTH = 72
export const PLAYER_MAX_HEIGHT = 64

/** Límite de delta time: evita saltos enormes tras un tirón o al volver de otra pestaña. */
export const MAX_DELTA = 0.05

/** Puntos por unidad de distancia recorrida. */
export const SCORE_PER_UNIT = 0.025

/** Puntaje a partir del cual aparecen obstáculos voladores. */
export const FLYING_MIN_SCORE = 500

/** Tras un game over, tiempo durante el que se ignora el salto (evita reintentos accidentales). */
export const RETRY_DELAY = 0.4
