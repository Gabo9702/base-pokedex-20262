# Pokédex — React + TypeScript + PokeAPI

Buscador de Pokémon por nombre o número, con una Pokédex construida solo con HTML y CSS.

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # tsc -b + vite build
npm run lint
```

### Fondo animado

Coloca tu GIF de fondo en **`public/fondo.gif`** (en el código se usa como `/fondo.gif`). Cubre toda la pantalla, tanto en el buscador como con la Pokédex abierta, con una capa oscura semitransparente encima para mantener la legibilidad. Si el archivo no existe o no carga, se ve un color sólido; con `prefers-reduced-motion` activado también se usa el color sólido en lugar del GIF.

## Estructura de `src/`

| Carpeta | Contenido |
|---|---|
| `types/pokemon.ts` | Interfaces de las respuestas de PokeAPI |
| `types/game.ts` | Tipos del minijuego (`GameState`, `Player`, `Obstacle`, `GameTheme`…) |
| `api/pokeapi.ts` | `fetch` nativo + caché de promesas; lista de nombres cacheada en memoria y `sessionStorage` |
| `hooks/` | `usePokedex` (búsqueda, navegación y estado `closed → opening → open → closing`), `usePokemonSuggestions` (sugerencias con debounce), `usePokeRunner` (bucle del minijuego) y `useAsync` |
| `utils/` | Formato de texto, tabla de tipos (debilidades) y cadena evolutiva |
| `utils/game/` | Funciones puras del minijuego: física, colisiones, obstáculos, escenario, paletas, récord, dibujo en canvas |
| `data/labels.ts` | Traducciones y colores de tipos |
| `components/` | `Searcher`, `SearchSuggestions`, `Pokedex`, `DPad`, `InfoScreen`, `sections/` (una por botón azul) y `Pokedex/PokeRunner/` (minijuego y su panel de estado) |

## Buscador con sugerencias

- Al escribir 2 letras o más aparece una lista de hasta 8 Pokémon (primero los que **empiezan** por el texto y luego los que lo **contienen**), con número `#025`, sprite y la coincidencia resaltada. No se muestran sugerencias para búsquedas numéricas.
- **Clic** en una sugerencia abre la Pokédex. **↑ / ↓** recorren la lista, **Enter** busca la sugerencia activa (o el texto escrito si no hay ninguna) y **Escape** o un clic fuera la cierran.
- La lista completa de nombres se descarga una sola vez al abrir la app y se guarda en `sessionStorage`.

## Controles

- Botones **0–9**: descripción, tipos, estadísticas, habilidades, datos físicos, movimientos, evolución, especie, sprites, debilidades.
- **D-pad** ◀ ▶ cambia de Pokémon (1–1025, con vuelta), ▲ ▼ desplaza el texto. **RANDOM**: Pokémon aleatorio. **Clic en el sprite**: normal ↔ shiny.
- Teclado: ← → ↑ ↓ y las teclas 0–9 hacen lo mismo.
- **NUEVA BÚSQUEDA** (panel izquierdo, bajo las luces) y **Cerrar Pokédex**: la tapa gira sobre la bisagra hasta cerrarse sobre el panel izquierdo (reverso exacto de la apertura), el dispositivo se desvanece y se vuelve al buscador con el campo vacío y enfocado. Durante la apertura y el cierre los controles se deshabilitan. Con `prefers-reduced-motion` se usa un desvanecimiento corto.

## Minijuego PokeRunner

Un juego estilo "dinosaurio de Chrome sin internet" que se juega dentro de la pantalla negra del panel izquierdo. El corredor es el Pokémon que se está viendo (en shiny si está activado).

**Cómo se activa**: pulsa el **botón circular rojo** bajo la pantalla (al pasar el cursor dice JUGAR). La pantalla se "enciende" con parpadeo y líneas de escaneo, el número del Pokémon pasa a ser el puntaje y el punto rojo sobre la pantalla parpadea. Para salir, vuelve a pulsar el botón rojo (SALIR) o **Escape**. El juego también se cierra solo si cambias de Pokémon (RANDOM) o cierras la Pokédex.

| Acción | Teclado | D-pad | Táctil |
|---|---|---|---|
| Empezar / saltar / reintentar | ↑ o Espacio (mantener = salto más alto) | ▲ | Tocar la pantalla |
| Agacharse (caer rápido en el aire) | ↓ | ▼ | Deslizar hacia abajo |
| Salir | Escape | — | Botón rojo |

- Durante la partida ◀ ▶ del D-pad y los botones 0–9 quedan deshabilitados, y la pantalla de texto de la derecha muestra el estado del juego (controles, récord, doble salto, velocidad y escenario). Al salir vuelve la sección que estaba elegida.
- **Obstáculos**: Poké Balls, rocas y arbustos (a veces en grupos de 2 o 3); desde 500 puntos también Poké Balls flotantes y pájaros a distintas alturas. La velocidad sube con el puntaje hasta un máximo.
- **Según el Pokémon**: la velocidad inicial depende de su estadística base de Velocidad (fórmula en `src/utils/game/physics.ts`); los de tipo Volador o con la habilidad Levitación tienen **doble salto**; la paleta del escenario depende del tipo principal (fuego, agua, planta/bicho, eléctrico, hielo, fantasma/siniestro/psíquico, roca/tierra/acero o monocromo clásico).
- El **récord** se guarda por Pokémon en `localStorage` (`pokerunner:record:{id}`).
- Si cambias de pestaña el juego se pone en **PAUSA**. Con `prefers-reduced-motion` no hay parpadeo de encendido ni partículas.

El registro de herramientas de IA empleadas está en [`informe_ia.md`](informe_ia.md).
