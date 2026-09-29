# Inventario para migración a React — Buscador de Pokémon

Estado actual: app vanilla JS (`index.html` + `script.js`), sin build tool, con Tailwind vía CDN y consumo directo de la PokeAPI (`https://pokeapi.co/api/v2/pokemon/`).

---

## 1. Elementos del DOM → Componentes React

| Elemento actual (HTML/JS) | Componente React propuesto | Notas |
|---|---|---|
| `<div class="w-full max-w-md ...">` (tarjeta contenedora) | `<App />` | Layout raíz, contiene título, buscador y resultado |
| `<h1>Buscador de Pokémon</h1>` | Parte de `<App />` o `<Header />` | Estático, no necesita componente propio salvo por prolijidad |
| `#pokemon-input` + `#search-btn` (bloque `.flex.gap-2`) | `<SearchBar />` | Recibe `value`, `onChange`, `onSubmit`, `disabled` como props |
| `#result-container` (contenedor dinámico) | `<ResultPanel />` (o renderizado condicional dentro de `<App />`) | Hoy mezcla 4 estados distintos vía `innerHTML`; en React conviene separarlos |
| Mensaje "Escribe un nombre o ID para buscar." | `<EmptyState />` | Estado inicial / input vacío |
| Mensaje "Buscando..." | `<LoadingState />` | Estado de carga |
| Mensaje de error "❌ Pokémon no encontrado..." | `<ErrorState message={...} />` | Estado de error |
| Bloque de resultado (imagen + nombre + ID + especie + tipos) | `<PokemonCard pokemon={...} />` | Salida de `renderPokemon()` |
| `<img src={sprite} />` | Parte de `<PokemonCard />`, con fallback a placeholder | `data.sprites.front_default \|\| placeholder` |
| Lista de tipos (`data.types.map(...)`) | Sub-componente opcional `<TypeBadge />` (uno por tipo) si se quiere estilizar cada tipo individualmente | Actualmente es un string unido con `, ` |

---

## 2. Funciones JS → Lógica React (hooks / handlers)

| Función actual | Equivalente en React | Notas |
|---|---|---|
| `searchPokemon()` | Handler `handleSearch` (o `useCallback`) que dispara el fetch | Debe manejar los mismos 3 estados: loading, success, error |
| Fetch a `pokemon/{query}` | Custom hook `usePokemonSearch()` o función en `api/pokeapi.js` | Centralizar llamadas a la API |
| Fetch a `data.species.url` (para el género/especie) | Parte del mismo hook o una segunda función `fetchSpecies(url)` | Falla silenciosa ya implementada (try/catch de respaldo) — mantener ese comportamiento |
| Lógica de "descartar respuestas obsoletas" (`currentRequestId`) | Reemplazable por `AbortController` en `useEffect`, o mantener patrón de ID de request dentro del hook | Importante para evitar condiciones de carrera con inputs rápidos |
| `renderPokemon(data, species)` | Se disuelve: los datos pasan a `<PokemonCard />` vía props/estado, no hay manipulación directa del DOM | React re-renderiza automáticamente |
| `searchBtn.disabled = true/false` | Estado `isLoading` (booleano) que controla el prop `disabled` del botón | |
| Listener de click (`searchBtn.addEventListener('click', ...)`) | `onClick` en `<SearchBar />` o `onSubmit` si se envuelve en `<form>` | Se recomienda usar `<form onSubmit>` para aprovechar accesibilidad/Enter nativo |
| Listener de tecla Enter (`input.addEventListener('keydown', ...)`) | Si se usa `<form>`, se resuelve automáticamente; si no, `onKeyDown` en el input | |

---

## 3. Estado (state) a modelar con `useState`/`useReducer`

| Variable actual | Estado React propuesto |
|---|---|
| `input.value` (valor del campo) | `const [query, setQuery] = useState('')` |
| Estado implícito por contenido de `resultContainer.innerHTML` | `const [status, setStatus] = useState('idle')` → `'idle' \| 'loading' \| 'success' \| 'error'` |
| `data` + `species` (resultado de la búsqueda) | `const [pokemon, setPokemon] = useState(null)` (objeto `{ id, name, sprite, species, types }`) |
| Mensaje de error | `const [errorMessage, setErrorMessage] = useState('')` |
| `currentRequestId` | Se puede reemplazar por `AbortController` guardado en `useRef`, o mantener el mismo patrón de ID en un `useRef` |
| `searchBtn.disabled` | Derivado de `status === 'loading'` (no necesita estado propio) |

> Alternativa: modelar todo con `useReducer` y acciones `SEARCH_START`, `SEARCH_SUCCESS`, `SEARCH_ERROR` para evitar estados inconsistentes (ej. `pokemon` con datos viejos mientras `status === 'error'`).

---

## 4. Integración con la API

- **Base URL:** `https://pokeapi.co/api/v2/pokemon/` — mover a constante en `src/api/pokeapi.js` o variable de entorno (`import.meta.env.VITE_POKEAPI_URL`).
- **Transformación de datos:** la lógica que extrae `species.genera` (buscando idioma `es`, con fallback a `en`) debe migrar tal cual a una función pura testeable, ej. `getSpeciesName(speciesData)`.
- **Manejo de errores:** hoy cualquier `!response.ok` se trata como "no encontrado" — mantener ese contrato o diferenciar 404 de errores de red/servidor si se quiere mejorar.
- **Cancelación de requests:** reemplazar el patrón manual de `requestId` por `AbortController` pasado a `fetch`, abortando en el cleanup de `useEffect` o al iniciar una nueva búsqueda.

---

## 5. Infraestructura / tooling necesario para la migración

- [ ] Elegir toolchain (recomendado: **Vite + React**, dado que es un proyecto pequeño sin SSR).
- [ ] Decidir gestor de estilos: mantener **Tailwind** (instalarlo como dependencia real en vez de CDN) o migrar a CSS Modules/otro.
- [ ] Estructura de carpetas sugerida:
  ```
  src/
    api/pokeapi.js
    components/
      SearchBar.jsx
      PokemonCard.jsx
      EmptyState.jsx
      LoadingState.jsx
      ErrorState.jsx
    hooks/
      usePokemonSearch.js
    App.jsx
    main.jsx
  ```
- [ ] Configurar `package.json`, scripts de build/dev, y linting (ESLint + reglas de React/hooks).
- [ ] Sustituir el `<script src="script.js">` global por el bundle generado por Vite.
- [ ] Revisar accesibilidad: labels para el input, `alt` en la imagen (ya existe), estados de foco (ya cubiertos por clases Tailwind existentes).
- [ ] Definir si se agregan tests (ej. Vitest + Testing Library) para `usePokemonSearch` y `getSpeciesName`.

---

## 6. Funcionalidad a preservar sin cambios de comportamiento

1. Búsqueda por nombre o ID (case-insensitive, trim de espacios).
2. Botón deshabilitado mientras carga.
3. Búsqueda también disparable con Enter.
4. Mensaje de "vacío" si se busca sin texto.
5. Fallback de imagen a placeholder si no hay sprite.
6. Fallback de "especie" al nombre técnico si falla el endpoint de species.
7. Descarte de respuestas de búsquedas obsoletas (evitar que una búsqueda vieja pise a una más reciente).
8. Mensaje de error genérico ante 404 u otros fallos.
