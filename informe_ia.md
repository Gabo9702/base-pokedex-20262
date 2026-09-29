# Informe de IA — Pokédex con React + TypeScript

## 1. Prompt utilizado

````markdown
# Prompt: Pokédex con React + TypeScript consumiendo PokeAPI

## Tarea previa obligatoria (informe de IA)
Abre el archivo `informe_ia.md` en la raíz del proyecto, borra absolutamente todo su contenido previo, y coloca únicamente este prompt actual junto con una descripción clara de las tecnologías, arnés (BMAD CLI) y skills de IA empleadas.

El informe debe incluir estas secciones:
1. **Prompt utilizado**: este prompt completo, sin modificaciones.
2. **Tecnologías**: React, TypeScript, HTML5, CSS3, Vite, Fetch API y PokeAPI (https://pokeapi.co/api/v2/), con una breve explicación del rol de cada una.
3. **Arnés de IA**: BMAD CLI (BMAD Method) ejecutado desde la terminal de Visual Studio Code. Explica qué es y cómo se usó.
4. **Skills / agentes de IA empleados**: lista los agentes o skills de BMAD que intervinieron (por ejemplo: analista, arquitecto, desarrollador, QA) y qué hizo cada uno en este proyecto.

## Objetivo
Crear una aplicación web tipo Pokédex que permita buscar Pokémon por **nombre** o por **número** usando la API pública PokeAPI.

## Stack técnico obligatorio
- React 18+ con **TypeScript** (modo `strict`).
- Proyecto creado con **Vite** (`npm create vite@latest -- --template react-ts`).
- **HTML y CSS puros** para el diseño (sin Tailwind, Bootstrap ni librerías de UI). Se permite CSS Modules o archivos `.css` por componente.
- Peticiones con `fetch` nativo (sin axios).
- Tipado completo de las respuestas de la API mediante interfaces en `src/types/pokemon.ts`.

## Flujo de la aplicación
1. **Pantalla inicial**: un buscador centrado con un campo de texto (placeholder: "Nombre o número del Pokémon") y un botón **Buscar**. Presionar Enter también debe buscar.
2. Normaliza la entrada: sin espacios sobrantes y en minúsculas.
3. Al buscar se muestra un indicador de carga. Si el Pokémon no existe, muestra un mensaje de error claro sin abrir la Pokédex.
4. Si se encuentra, **se abre la Pokédex** con una animación de apertura en la que la tapa derecha se despliega desde la bisagra central.
5. Debe haber un botón para cerrar la Pokédex y volver al buscador.

## Diseño de la Pokédex (réplica de la imagen de referencia)
Construye el diseño **solo con HTML y CSS**, sin imágenes de fondo. Es un dispositivo rojo (#D40F2B aprox.) con dos paneles unidos por una bisagra cilíndrica vertical y sombra oscura desplazada detrás de cada panel.

**Panel izquierdo:**
- Arriba a la izquierda, un círculo grande azul (#1E88D0) con borde gris claro. A su derecha, tres luces pequeñas: roja, amarilla y verde.
- El borde superior tiene un escalón diagonal característico.
- Una pantalla gris claro (#D6D6D6) con la esquina inferior izquierda cortada en diagonal (usa `clip-path`). Encima tiene dos puntos pequeños (rojo y negro).
- Dentro, una pantalla negra con esquinas redondeadas que muestra el **sprite del Pokémon** centrado (usa `image-rendering: pixelated`) y el **número** abajo a la izquierda en texto blanco.
- Bajo la pantalla, un botón circular rojo a la izquierda y tres líneas horizontales grises (rejilla de altavoz) a la derecha.
- Debajo, un recuadro verde (#4CAF50) con el **nombre del Pokémon** en texto blanco con la primera letra en mayúscula.
- Una cruceta (D-pad) negra a la derecha del recuadro verde.

**Panel derecho:**
- Su borde superior también tiene un escalón diagonal, reflejado respecto al izquierdo.
- Una pantalla negra de texto con scroll vertical que muestra la información de la sección activa.
- Una cuadrícula de **10 botones azules (#29A8F0)** numerados del 0 al 9, en 2 filas de 5 y separados por líneas negras.
- Abajo a la izquierda, un recuadro gris claro con una insignia del **tipo principal** del Pokémon.
- Abajo a la derecha, un botón circular amarillo pequeño con el texto **RANDOM**.

**Tipografía:** usa una fuente pixelada o monoespaciada estilo retro (por ejemplo "VT323" o "Press Start 2P" de Google Fonts) para todos los textos de las pantallas.

## Funcionalidad de los botones azules
Cada botón cambia el contenido de la pantalla de texto del panel derecho. El botón activo se resalta visualmente.

- **0 – Descripción**: la entrada de la Pokédex (`flavor_text_entries` de `/pokemon-species/{id}`). Prioriza el idioma español (`es`) y usa inglés (`en`) si no existe. Limpia los saltos de línea y caracteres especiales (`\n`, `\f`). Esta es la vista por defecto.
- **1 – Tipos**: los tipos del Pokémon mostrados como insignias de color según el tipo.
- **2 – Estadísticas base**: PS, Ataque, Defensa, At. Esp., Def. Esp. y Velocidad, con barras horizontales proporcionales (máximo 255).
- **3 – Habilidades**: lista de habilidades, indicando cuál es oculta.
- **4 – Datos físicos**: altura (convertida a metros), peso (convertido a kg) y experiencia base.
- **5 – Movimientos**: los primeros 15 movimientos, con opción de ver más dentro del scroll.
- **6 – Cadena evolutiva**: se obtiene desde `evolution_chain.url` de la especie. Muestra cada etapa con su nombre y método o nivel de evolución.
- **7 – Especie**: categoría (genus en español si existe), generación, hábitat, color y si es legendario o mítico.
- **8 – Sprites**: vista frontal y trasera, normal y shiny.
- **9 – Debilidades y resistencias**: calculadas a partir de `/type/{tipo}` con `damage_relations`, combinando multiplicadores si tiene dos tipos (x4, x2, x½, x¼, x0).

## Otros controles funcionales
- **D-pad izquierda / derecha**: Pokémon anterior / siguiente por número (rango 1 a 1025).
- **D-pad arriba / abajo**: desplaza el texto de la pantalla derecha.
- **Botón RANDOM**: carga un Pokémon aleatorio.
- **Clic en el sprite**: alterna entre la versión normal y la shiny.
````

## 2. Tecnologías

| Tecnología | Rol en el proyecto |
|---|---|
| **React 19** | Biblioteca de UI. La app se divide en componentes (`Searcher`, `Pokedex`, `DPad`, `InfoScreen`, una sección por botón azul) y hooks (`usePokedex`, `useAsync`) que manejan el estado. |
| **TypeScript (`strict: true`)** | Tipado estático. Todas las respuestas de la API están descritas con interfaces en `src/types/pokemon.ts` (`Pokemon`, `PokemonSpecies`, `EvolutionChain`, `PokemonTypeData`…). |
| **HTML5** | Estructura semántica y accesible: `<form>` para el buscador (Enter y «Buscar» comparten el mismo camino), `<button>`, `<section>`, roles ARIA (`status`, `alert`, `meter`) y `<dl>/<ul>` en las pantallas. |
| **CSS3** | Todo el diseño de la Pokédex es CSS puro, sin imágenes de fondo: `clip-path` (escalones diagonales y esquina cortada), gradientes (bisagra cilíndrica, luces, botones), `perspective` + `rotateY` (apertura de la tapa), `image-rendering: pixelated` y un archivo `.css` por componente. El dispositivo se dimensiona en `em`, de modo que escala completo con un solo `font-size`. Sin Tailwind ni librerías de UI. |
| **Vite 8** | Servidor de desarrollo con HMR y empaquetado de producción (plantilla `react-ts`). |
| **Fetch API** | Todas las peticiones usan `fetch` nativo (sin axios), con una pequeña caché de promesas en `src/api/pokeapi.ts`. |
| **PokeAPI** (`https://pokeapi.co/api/v2/`) | Fuente de datos: `/pokemon/{id\|nombre}`, `/pokemon-species/{id}`, `/evolution-chain/{id}` y `/type/{tipo}` (esta última para calcular debilidades y resistencias). |
| **VT323** (Google Fonts) | Fuente pixelada estilo retro para todos los textos. |
| **ESLint** (`typescript-eslint`, `react-hooks`) | Verificación estática del código. |

## 3. Arnés de IA

**BMAD CLI (BMAD Method)** es un método/framework de desarrollo asistido por IA que se instala en el proyecto (aquí en `_bmad/` y como skills en `.claude/skills/bmad-*`) y ofrece agentes con rol definido (analista, arquitecto, PM, UX, desarrollador…) y flujos de trabajo (PRD, arquitectura, épicas y historias, `bmad-build`, revisión de código, etc.).

**Cómo se usó en esta ejecución (descripción fiel):**

- BMAD está instalado en el repositorio y su configuración (`_bmad/config.toml`, proyecto «PokedexMejorada») corresponde a rondas de trabajo anteriores.
- Para esta tarea se intentó arrancar el flujo `bmad-build`, cuyo primer paso es renderizar el skill con `uv run … render_skill.py`. **`uv` no está instalado en este equipo** (`uv: command not found`), por lo que el skill indica detenerse y **no se pudo ejecutar el flujo de BMAD**.
- En consecuencia, el trabajo lo realizó directamente el asistente **Claude Code (modelo Claude Sonnet 5)** desde el terminal, leyendo y escribiendo archivos del proyecto y ejecutando comandos, **sin pasar por los agentes de BMAD**. No se generaron artefactos nuevos en `_bmad-output/`.
- Para que BMAD funcione de forma completa hay que instalar `uv` (https://docs.astral.sh/uv/) y volver a lanzar el skill.

## 4. Skills / agentes de IA empleados

### Agentes y skills de BMAD

Disponibles en el proyecto pero **no ejecutados** en esta ronda (ver sección 3): `bmad-agent-analyst` (Mary), `bmad-agent-architect` (Winston), `bmad-agent-dev` (Amelia), `bmad-agent-pm` (John), `bmad-agent-ux-designer` (Sally), `bmad-code-review`, `bmad-qa-generate-e2e-tests`, entre otros.

Único skill de BMAD invocado: **`bmad-build`** — se intentó y quedó detenido por la ausencia de `uv`.

### Trabajo realizado por Claude Code (sin agentes BMAD)

Las funciones que en BMAD corresponderían a distintos roles las cubrió el propio asistente:

- **Análisis / arquitectura**: análisis del prompt y del proyecto existente (que usaba Tailwind), y diseño de la estructura: `types/` → `api/` → `utils/` → `hooks/` → `components/`. Se retiró Tailwind (el enunciado exige CSS puro) y se activó `strict` en `tsconfig.app.json`.
- **Desarrollo**: implementación de buscador, Pokédex, animación de apertura/cierre, las 10 secciones, D-pad, RANDOM y alternancia shiny. Incluye extras: atajos de teclado (← → ↑ ↓ y 0-9), vuelta 1 ↔ 1025 en el D-pad y método evolutivo traducido al español.
- **QA / verificación**: `tsc -b` y `eslint` sin errores, `npm run build` correcto, y pruebas automatizadas en un navegador Chrome headless (controlado con `puppeteer-core`, instalado solo en un directorio temporal fuera del proyecto): búsqueda con Enter y con el botón, Pokémon inexistente, normalización de la entrada, las 10 secciones, D-pad, RANDOM, shiny, cierre, nombres largos y cálculo de multiplicadores (por ejemplo Gyarados: x4 Eléctrico, x0 Tierra). Se detectaron y corrigieron dos fallos durante esas pruebas (los `<button>` no heredaban `font-size`, lo que sacaba RANDOM del panel; y un método evolutivo repetido).
- **No verificado**: la extensión de Chrome de Claude no estaba conectada, por lo que las capturas se hicieron con Chrome headless a 1366×768; no se probó en móvil real ni en otros navegadores.

---
### Prompt 2 – Mejoras: fondo GIF, sugerencias de búsqueda, nueva búsqueda y animación de cierre (2026-09-28)

> Todo lo anterior en este archivo (secciones 1 a 4) corresponde al **Prompt 1** y se conserva tal cual, aunque no tiene el formato de entrada.

1. **Prompt utilizado**

````markdown
# Prompt: Mejoras a la Pokédex (fondo GIF, sugerencias de búsqueda, nueva búsqueda y animación de cierre)

## Tarea previa obligatoria (informe de IA)
Abre el archivo `informe_ia.md` en la raíz del proyecto. **No borres ni modifiques su contenido previo.** Agrega al final del archivo este prompt actual como una nueva entrada, junto con una descripción clara de las tecnologías, arnés (BMAD CLI) y skills de IA empleadas. Esta regla aplica para este y todos los prompts futuros: el informe debe conservar el historial completo de prompts en orden cronológico.

Cada nueva entrada debe tener este formato:

---
### Prompt N – [Título breve del prompt] (AAAA-MM-DD)
1. **Prompt utilizado**: este prompt completo, sin modificaciones.
2. **Tecnologías**: React, TypeScript, HTML5, CSS3, Vite, Fetch API y PokeAPI, con el rol de cada una en esta etapa.
3. **Arnés de IA**: BMAD CLI (BMAD Method) ejecutado desde la terminal de Visual Studio Code.
4. **Skills / agentes de IA empleados**: los agentes o skills de BMAD que intervinieron y qué hizo cada uno.

Reglas:
- `N` es el número consecutivo según las entradas que ya existan en el archivo.
- Si el archivo no existe, créalo con un encabezado `# Informe de uso de IA` y agrega la primera entrada.
- Si el archivo está vacío o solo contiene un prompt anterior sin el formato de entrada, consérvalo tal cual y agrega la nueva entrada debajo.

## Contexto
El proyecto ya existe: una Pokédex en React + TypeScript + CSS puro que consume PokeAPI, con un buscador inicial y una Pokédex que se abre con animación. **No reescribas el proyecto**. Modifica solo los archivos necesarios, respeta la arquitectura actual (`src/api`, `src/types`, `src/hooks`, `src/components`, `src/utils`) y mantén el tipado estricto sin `any`.

## Mejora 1: Imagen GIF de fondo
- Usa el archivo `fondo.gif` ubicado en la carpeta `public/` (ruta en código: `/fondo.gif`).
- Aplícalo como fondo de toda la aplicación, tanto en el buscador como con la Pokédex abierta.
- Debe cubrir toda la pantalla (`background-size: cover`, `background-position: center`, `background-attachment: fixed`, `min-height: 100vh`).
- Agrega una capa semitransparente oscura encima del GIF (pseudo-elemento `::before` o `div` overlay) para que el buscador y la Pokédex se lean bien.
- Si el GIF no carga, debe verse un color de fondo sólido de respaldo.
- Respeta `prefers-reduced-motion`: si el usuario lo tiene activado, reemplaza el GIF por el color sólido.

## Mejora 2: Lista de sugerencias al buscar por nombre
- Al montar la aplicación, obtén una sola vez la lista completa de nombres con `https://pokeapi.co/api/v2/pokemon?limit=1025` y guárdala en caché (en memoria y en `sessionStorage`) para no repetir la petición.
- Crea un hook `usePokemonSuggestions(query: string)` que:
  - Aplique **debounce de 250 ms** a la escritura.
  - Filtre primero los nombres que **empiezan** con el texto escrito y después los que lo **contienen**.
  - Devuelva máximo **8 sugerencias**.
  - No muestre sugerencias si la búsqueda es un número o tiene menos de 2 letras.
- Crea el componente `SearchSuggestions` como lista desplegable bajo el campo de texto. Cada sugerencia muestra:
  - El número del Pokémon (extraído de la URL del recurso) con formato `#025`.
  - El sprite pequeño (`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png`) con `loading="lazy"`.
  - El nombre con la primera letra en mayúscula y la parte coincidente resaltada en negrita.
- Interacción:
  - Clic en una sugerencia: busca ese Pokémon y abre la Pokédex directamente.
  - Flechas ↑ / ↓: navegan entre sugerencias (la activa se resalta).
  - Enter: busca la sugerencia activa o, si no hay ninguna, el texto escrito.
  - Escape o clic fuera: cierra la lista.
- Accesibilidad: usa `role="combobox"`, `role="listbox"`, `role="option"`, `aria-expanded` y `aria-activedescendant`.
- Si no hay coincidencias, muestra el texto "No se encontraron Pokémon".
- Estilo acorde a la Pokédex: fondo oscuro, fuente pixelada, borde rojo y scroll interno si hace falta.

## Mejora 3: Botón "Nueva búsqueda" dentro de la Pokédex
- Agrega un botón visible **"NUEVA BÚSQUEDA"** en la Pokédex, con estilo retro coherente con el diseño. Ubícalo en el panel izquierdo, junto a las luces superiores, o bajo el recuadro verde del nombre, sin romper la réplica del diseño original.
- Al presionarlo:
  1. Ejecuta la animación de cierre de la Pokédex (ver Mejora 4).
  2. Al terminar la animación, vuelve a la pantalla del buscador.
  3. Limpia el campo de texto y le da el foco automáticamente.
- Debe tener `aria-label="Nueva búsqueda"` y ser accesible con teclado.
- El botón de cerrar que ya existe debe usar el mismo flujo de cierre.

## Mejora 4: Animación de cierre de la Pokédex
- La animación de cierre debe ser el **reverso exacto** de la animación de apertura: la tapa derecha gira sobre la bisagra central hasta cerrarse sobre el panel izquierdo, y después el dispositivo completo se desvanece o se reduce.
- Usa la misma duración y curva (`transition-timing-function`) de la apertura para que se sienta simétrica.
- Implementación:
  - Maneja un estado tipado `type PokedexState = 'closed' | 'opening' | 'open' | 'closing'`.
  - Al cerrar, cambia a `'closing'`, aplica la clase CSS de cierre y **desmonta el componente solo cuando termine la animación** (escucha `onAnimationEnd` o `onTransitionEnd`; no uses `setTimeout` con tiempos fijos).
  - Mientras está en `'opening'` o `'closing'`, deshabilita los botones para evitar dobles clics.
- Usa `transform-style: preserve-3d`, `perspective` y `transform-origin` en el lado de la bisagra para que el giro se vea en 3D.
- Respeta `prefers-reduced-motion`: si está activo, cierra con un desvanecimiento simple y corto.

## Requisitos de calidad
- Sin `any`; todos los nuevos props, hooks y estados deben estar tipados.
- No romper las funcionalidades existentes (botones 0–9, D-pad, RANDOM, shiny).
- Código comentado en español.
- Actualiza el `README.md` con las nuevas funciones y con la indicación de colocar `fondo.gif` en `public/`.

## Entregables
1. Las cuatro mejoras funcionando con `npm run dev`.
2. `informe_ia.md` actualizado con la nueva entrada, conservando todas las anteriores.
3. `README.md` actualizado.
````

2. **Tecnologías**

| Tecnología | Rol en esta etapa |
|---|---|
| **React 19** | Nuevo componente `SearchSuggestions`; `Searcher` convertido en combobox (teclado, clic fuera, foco automático al volver) y botón **NUEVA BÚSQUEDA** en `Pokedex`. El evento `onAnimationEnd` marca el final de la apertura y del cierre. |
| **TypeScript (`strict`)** | Estado tipado `PokedexState = 'closed' \| 'opening' \| 'open' \| 'closing'`, tipos `PokemonListResponse` y `PokemonSuggestion`, hook `usePokemonSuggestions` con resultado tipado y un *type guard* que valida lo leído de `sessionStorage` sin `any`. |
| **HTML5** | Patrón combobox accesible: `role="combobox"`, `role="listbox"`, `role="option"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-selected`; `aria-label="Nueva búsqueda"`; `<img loading="lazy">` en los sprites de las sugerencias. |
| **CSS3** | Fondo `fondo.gif` (`cover`, `center`, `fixed`) con capa oscura `body::before` y color sólido de respaldo; giro 3D de la tapa con `perspective`, `transform-style: preserve-3d`, `transform-origin` en el eje de la bisagra, `backface-visibility` y una cara exterior de la tapa; el cierre reutiliza los mismos `@keyframes`, duración y curva con `animation-direction: reverse`; `@media (prefers-reduced-motion)` para el desvanecimiento corto y el fondo sin GIF. |
| **Vite 8** | Sirve `public/fondo.gif` en `/fondo.gif`; servidor de desarrollo y `npm run build` para verificar. |
| **Fetch API** | Una sola petición a `/pokemon?limit=1025`, con caché en memoria (promesa compartida) y en `sessionStorage`. |
| **PokeAPI** | Lista completa de nombres para las sugerencias (el número se extrae de la URL de cada recurso) y sprites de `raw.githubusercontent.com/PokeAPI/sprites`. |

3. **Arnés de IA**

**BMAD CLI (BMAD Method)** sigue instalado en el proyecto (`_bmad/` y skills `bmad-*` en `.claude/skills/`) para usarse desde la terminal de Visual Studio Code. Descripción fiel de esta ronda:

- El flujo de implementación de BMAD (`bmad-build`) necesita `uv` para renderizar el skill. Se volvió a comprobar que **`uv` no está instalado** (`uv: command not found`), así que el flujo no se pudo ejecutar y **no se lanzó ningún agente de BMAD**. No se generaron artefactos nuevos en `_bmad-output/`.
- El trabajo lo hizo directamente el asistente **Claude Code (modelo Claude Opus 5.5)** en la terminal, leyendo y editando archivos y ejecutando comandos.
- Para usar BMAD completo en próximas rondas hay que instalar `uv` (https://docs.astral.sh/uv/).

4. **Skills / agentes de IA empleados**

- **Agentes / skills de BMAD**: ninguno ejecutado en esta ronda (ver punto 3). Siguen disponibles `bmad-build`, `bmad-agent-dev` (Amelia), `bmad-agent-architect` (Winston), `bmad-agent-ux-designer` (Sally), `bmad-code-review` y `bmad-qa-generate-e2e-tests`, entre otros.
- **Claude Code (sin agentes BMAD)** cubrió los roles:
  - **Análisis / arquitectura**: lectura del proyecto y reparto de los cambios en la arquitectura existente: `types/` (nuevos tipos), `api/` (`getPokemonNames` con caché), `utils/` (`idFromResourceUrl`, `suggestionOptionId`), `hooks/` (`usePokemonSuggestions`, y `usePokedex` con `PokedexState`) y `components/` (`SearchSuggestions`, `Searcher`, `Pokedex`, `DPad`). Se eliminó el `setTimeout` de tiempo fijo que antes terminaba el cierre.
  - **Desarrollo**: las cuatro mejoras. La tapa gira ahora de 0° a -180° sobre el eje de la bisagra y queda exactamente encima del panel izquierdo mostrando su cara exterior; la apertura y el cierre comparten keyframes, duración (1,2 s) y curva.
  - **QA / verificación**: `tsc -b`, `eslint` y `npm run build` sin errores; pruebas en Chrome headless (`puppeteer-core` instalado solo en un directorio temporal fuera del proyecto): sugerencias («char» → primero los que empiezan por el texto y después Chimchar y Pecharunt), ↑/↓ con `aria-activedescendant`, Escape, clic fuera, «No se encontraron Pokémon», sin sugerencias para «25» ni para una sola letra, clic en sugerencia abre la Pokédex, controles deshabilitados durante `opening`, botones 0–9 y D-pad siguen funcionando, NUEVA BÚSQUEDA y Cerrar vuelven al buscador con el campo vacío y enfocado, Enter con texto escrito, y `prefers-reduced-motion` (sin GIF y cierre por desvanecimiento en unos 0,2 s). Se capturaron fotogramas congelados de la animación de cierre para comprobar el giro 3D.
  - **No verificado**: `public/fondo.gif` no existía en el proyecto durante esta ronda, así que solo se comprobó que el fondo apunta a `/fondo.gif` y que se ve el color de respaldo. No se probó en móvil real ni en otros navegadores.

---
### Prompt 3 – Minijuego PokeRunner (estilo "dinosaurio de Chrome") en la pantalla de la Pokédex (2026-09-28)

1. **Prompt utilizado**

````markdown
# Prompt: Minijuego estilo "dinosaurio de Chrome" dentro de la pantalla de la Pokédex

## Tarea previa obligatoria (informe de IA)
Abre el archivo `informe_ia.md` en la raíz del proyecto. **No borres ni modifiques su contenido previo.** Agrega al final del archivo este prompt actual como una nueva entrada, junto con una descripción clara de las tecnologías, arnés (BMAD CLI) y skills de IA empleadas. Esta regla aplica para este y todos los prompts futuros: el informe debe conservar el historial completo de prompts en orden cronológico.

Cada nueva entrada debe tener este formato:

---
### Prompt N – [Título breve del prompt] (AAAA-MM-DD)
1. **Prompt utilizado**: este prompt completo, sin modificaciones.
2. **Tecnologías**: React, TypeScript, HTML5 (Canvas API), CSS3, Vite, PokeAPI, `requestAnimationFrame` y `localStorage`, con el rol de cada una en esta etapa.
3. **Arnés de IA**: BMAD CLI (BMAD Method) ejecutado desde la terminal de Visual Studio Code.
4. **Skills / agentes de IA empleados**: los agentes o skills de BMAD que intervinieron y qué hizo cada uno.

Reglas:
- `N` es el número consecutivo según las entradas que ya existan en el archivo.
- Si el archivo no existe, créalo con un encabezado `# Informe de uso de IA` y agrega la primera entrada.
- Si el archivo está vacío o solo contiene un prompt anterior sin el formato de entrada, consérvalo tal cual y agrega la nueva entrada debajo.

## Contexto
El proyecto ya existe: una Pokédex en React + TypeScript + CSS puro que consume PokeAPI, con buscador con sugerencias, fondo GIF, botones 0–9, D-pad, botón RANDOM, sprite shiny, botón de nueva búsqueda y animaciones de apertura y cierre. **No reescribas el proyecto**. Modifica solo los archivos necesarios, respeta la arquitectura actual (`src/api`, `src/types`, `src/hooks`, `src/components`, `src/utils`) y mantén el tipado estricto sin `any`.

## Objetivo
Agregar un minijuego tipo "dinosaurio de Chrome sin internet" que se juegue **dentro de la pantalla negra del panel izquierdo**, como si fuera una función integrada del dispositivo. El personaje es el Pokémon que se está viendo en la Pokédex.

## Activación del juego
- El **botón circular rojo** que está debajo de la pantalla gris del panel izquierdo pasa a ser el botón **JUGAR / SALIR**. Agrégale `aria-label` dinámico ("Jugar con {nombre}" / "Salir del juego") y un pequeño texto o ícono indicativo al pasar el cursor (`title`).
- Al activarlo:
  - La pantalla negra cambia con una transición corta tipo "encendido de pantalla retro" (parpadeo o líneas de escaneo durante ~300 ms) y muestra el juego en lugar del sprite estático.
  - El número del Pokémon en la esquina inferior izquierda se reemplaza por el **puntaje actual**.
  - El punto rojo pequeño sobre la pantalla parpadea mientras el juego está activo, como indicador de "en uso".
- Al salir (mismo botón o tecla Escape), el juego se detiene, se libera el bucle de animación y la pantalla vuelve a mostrar el sprite y el número del Pokémon con la misma transición.
- Si el usuario cambia de Pokémon (D-pad, RANDOM, nueva búsqueda) o cierra la Pokédex, el juego se cierra automáticamente y libera todos sus recursos.

## Pantallas del juego (todas dentro del canvas)
1. **Inicio**: el Pokémon quieto sobre el suelo y el texto parpadeante "PRESIONA ↑ PARA EMPEZAR" en fuente pixelada. En pantallas táctiles: "TOCA PARA EMPEZAR".
2. **Jugando**: el Pokémon corre, aparecen obstáculos, el puntaje sube.
3. **Game Over**: el juego se congela, aparece "GAME OVER", el puntaje obtenido, el récord de ese Pokémon y "↑ PARA REINTENTAR". Si se supera el récord, mostrar "¡NUEVO RÉCORD!" parpadeando.

## Mecánica del juego
- Implementa el juego con **Canvas API** en un componente `PokeRunner` (`src/components/Pokedex/PokeRunner/`) y la lógica en un hook `usePokeRunner` (`src/hooks/usePokeRunner.ts`). Separa las funciones puras (física, colisiones, generación de obstáculos) en `src/utils/game/`.
- Bucle con `requestAnimationFrame` y **delta time** para que la velocidad sea igual en cualquier monitor (60 Hz, 120 Hz, etc.).
- Guarda posición, velocidad, obstáculos y puntaje en `useRef`, **no en `useState`**, para no provocar re-renders en cada frame. Usa `useState` solo para cambios de pantalla (inicio, jugando, game over) y el puntaje mostrado fuera del canvas.
- **Personaje**: dibuja el sprite del Pokémon (`sprites.front_default`, o el shiny si está activo) cargado como `HTMLImageElement` con `crossOrigin = "anonymous"`. Dibújalo mirando hacia la derecha (voltéalo horizontalmente con `ctx.scale(-1, 1)` si hace falta) con `imageSmoothingEnabled = false` para mantener el estilo pixelado. Como el sprite es estático, simula la carrera con un rebote vertical leve y constante mientras está en el suelo.
- **Salto** con gravedad realista: mantener presionada la tecla hace un salto más alto (salto variable, con un máximo).
- **Agacharse** (↓): el Pokémon se aplasta visualmente (escala vertical reducida) y su hitbox se reduce, para esquivar obstáculos voladores.
- **Obstáculos** dibujados con formas simples de canvas (sin imágenes externas):
  - Terrestres: Poké Balls (círculo rojo y blanco con línea y botón central), rocas y arbustos, de distintos tamaños, a veces en grupos de 2 o 3.
  - Voladores (aparecen a partir de 500 puntos): una Poké Ball flotante o un pájaro simple a diferentes alturas.
  - Distancia mínima entre obstáculos proporcional a la velocidad, para que siempre sea posible esquivarlos.
- **Colisiones** con hitboxes rectangulares reducidas (~80 % del tamaño visual del sprite, recortando el espacio transparente) para que se sientan justas.
- **Dificultad progresiva**: la velocidad aumenta gradualmente con el puntaje hasta un máximo.
- **Puntaje**: sube con la distancia recorrida. Cada 100 puntos el marcador parpadea brevemente. Muéstralo también dentro del canvas en la esquina superior derecha con formato de 5 dígitos (`00125`) y el récord a su lado (`HI 00980`).
- **Escenario**: línea de suelo con pequeñas piedras que se desplazan, nubes simples en parallax (más lentas que el suelo).

## Personalización según los datos del Pokémon
- **Velocidad inicial**: basada en la estadística base de Velocidad del Pokémon, mapeada a un rango razonable (ni muy lento ni injugable). Documenta la fórmula en un comentario.
- **Doble salto**: permitido si el Pokémon es de tipo **volador** o tiene la habilidad **levitate**.
- **Paleta del escenario según el tipo principal**, manteniendo el fondo oscuro de la pantalla:
  - Fuego: suelo rojizo y partículas de brasas.
  - Agua: suelo azul y burbujas.
  - Planta / Bicho: suelo verde y hojas.
  - Eléctrico: suelo amarillo y destellos ocasionales.
  - Hielo: suelo celeste y copos de nieve.
  - Fantasma / Siniestro / Psíquico: tonos morados y estrellas.
  - Roca / Tierra / Acero: tonos cafés o grises.
  - Otros tipos: estilo monocromo clásico (blanco y gris sobre negro).
  Define las paletas en un objeto tipado `Record<PokemonType, GameTheme>`.

## Controles
- **Teclado**: ↑ o barra espaciadora para saltar, ↓ para agacharse, Escape para salir. Evita el desplazamiento de la página con `preventDefault` mientras el juego está activo.
- **D-pad de la Pokédex**: mientras el juego está activo, la flecha arriba del D-pad salta y la flecha abajo agacha. Las flechas izquierda y derecha quedan deshabilitadas para no cambiar de Pokémon por accidente.
- **Táctil**: tocar la pantalla del juego salta. Deslizar hacia abajo agacha.
- Solo escucha eventos de teclado mientras el juego esté activo, y elimina los listeners al salir.

## Integración con el resto de la Pokédex
- Mientras se juega, la pantalla de texto del panel derecho muestra un panel de estado del juego: nombre del Pokémon, controles disponibles, récord personal y habilidades especiales activas (por ejemplo, "Doble salto: SÍ"). Al salir del juego vuelve a la sección que estaba seleccionada.
- Los botones 0–9 se deshabilitan visualmente durante la partida y vuelven a funcionar al salir.
- El récord se guarda en `localStorage` por Pokémon (clave `pokerunner:record:{id}`), con lectura y escritura dentro de `try/catch`.

## Tamaño y responsive
- El canvas ocupa exactamente el área interna de la pantalla negra, respetando sus esquinas redondeadas (`border-radius` y `overflow: hidden` en el contenedor).
- Ajusta la resolución del canvas con `devicePixelRatio` y un `ResizeObserver` para que se vea nítido y se adapte cuando la Pokédex cambie de tamaño.
- Toda la lógica del juego trabaja en un sistema de coordenadas lógico fijo (por ejemplo 600 × 300) escalado al tamaño real, para que la dificultad sea igual en cualquier pantalla.
- Si la pestaña pierde el foco (`visibilitychange`), pausa el juego automáticamente y muestra "PAUSA".

## Accesibilidad
- Respeta `prefers-reduced-motion`: desactiva el parpadeo de la transición de encendido y las partículas del escenario.
- El canvas debe tener `role="img"` y un `aria-label` que describa el estado ("Juego en curso, puntaje 350").

## Requisitos de calidad
- Sin `any`; todos los tipos del juego (`GameState`, `Obstacle`, `Player`, `GameTheme`) definidos en `src/types/game.ts`.
- Cancela siempre el `requestAnimationFrame` y elimina listeners en la limpieza de `useEffect` para evitar fugas de memoria.
- No romper ninguna funcionalidad existente (búsqueda, sugerencias, botones 0–9, D-pad, RANDOM, shiny, nueva búsqueda, animaciones de apertura y cierre).
- Código comentado en español.
- Actualiza el `README.md` con una sección "Minijuego PokeRunner" que explique cómo se activa y los controles.

## Entregables
1. Minijuego funcionando dentro de la pantalla de la Pokédex con `npm run dev`.
2. `informe_ia.md` actualizado con la nueva entrada, conservando todas las anteriores.
3. `README.md` actualizado.
````

2. **Tecnologías**

| Tecnología | Rol en esta etapa |
|---|---|
| **React 19** | Nuevo componente `PokeRunner` (se monta al jugar y se desmonta al salir, liberando todo) y `GameStatusPanel` para la pantalla de texto; el botón rojo pasa a ser un `<button>` JUGAR/SALIR; `DPad` gana un modo juego (▲ salta manteniendo pulsado, ▼ agacha, ◀ ▶ deshabilitadas). El hook `usePokeRunner` usa `useRef` para el estado de la partida, `useState` solo para pantalla, puntaje y récord, y `useEffectEvent` para la salida con Escape. |
| **TypeScript (`strict`)** | `src/types/game.ts` con `PokemonType`, `GameTheme`, `GameState`, `Player`, `Obstacle`, `GameInput`, `GameConfig`, `RunnerStatus`, `RunnerControls`, etc. Paletas en `Record<PokemonType, GameTheme>` con un *type guard* `isPokemonType`. Sin `any`. |
| **HTML5 – Canvas API** | Todo el juego se dibuja en un `<canvas>` (sprite volteado con `ctx.scale(-1, 1)` e `imageSmoothingEnabled = false`, obstáculos con formas simples, nubes, suelo, partículas y textos). El sprite se carga como `HTMLImageElement` con `crossOrigin = "anonymous"` y con `getImageData` se recorta su margen transparente para ajustar la hitbox. El canvas tiene `role="img"` y un `aria-label` que describe el estado. |
| **CSS3** | Transición de "encendido retro" de ~300 ms (parpadeo + líneas de escaneo), punto rojo parpadeante, botones 0–9 atenuados, etiqueta JUGAR/SALIR al pasar el cursor, parpadeo del marcador cada 100 puntos, contenedor con `border-radius` + `overflow: hidden` y `touch-action: none`; todo desactivado con `prefers-reduced-motion`. |
| **Vite 8** | Servidor de desarrollo y `npm run build`; en las pruebas también sirvió los módulos TS de `src/utils/game/` para probar las funciones puras en el navegador. |
| **PokeAPI** | Datos que personalizan el juego: estadística base de Velocidad (velocidad inicial), tipos (paleta y doble salto si es Volador), habilidades (doble salto con `levitate`) y sprites normal/shiny. |
| **`requestAnimationFrame`** | Bucle del juego con *delta time* limitado (máx. 50 ms): la simulación va igual a 60, 120 o 144 Hz. Se cancela en la limpieza del efecto. |
| **`localStorage`** | Récord por Pokémon (`pokerunner:record:{id}`), leído y escrito dentro de `try/catch`. |
| Otras APIs web | `ResizeObserver` + `devicePixelRatio` (canvas nítido y adaptable), `visibilitychange` (pausa automática), Pointer Events (toque y deslizamiento), `matchMedia` (`prefers-reduced-motion`, `pointer: coarse`). |

3. **Arnés de IA**

**BMAD CLI (BMAD Method)** sigue instalado en el proyecto (`_bmad/` y skills `bmad-*` en `.claude/skills/`) para usarse desde la terminal de Visual Studio Code. Descripción fiel de esta ronda:

- Se invocó el skill **`bmad-build`**, cuyo primer paso ejecuta `uv run … render_skill.py`. **`uv` sigue sin estar instalado** (`uv: command not found` en Bash y en PowerShell), así que el flujo de BMAD se detuvo en ese paso y **no se lanzó ningún agente de BMAD**. No se generaron artefactos nuevos en `_bmad-output/`.
- El trabajo lo hizo directamente el asistente **Claude Code (modelo Claude Opus 5.5)** en la terminal, leyendo y editando archivos y ejecutando comandos.
- Para usar BMAD completo en próximas rondas hay que instalar `uv` (https://docs.astral.sh/uv/).

4. **Skills / agentes de IA empleados**

- **Agentes / skills de BMAD**: solo se intentó `bmad-build` (detenido por falta de `uv`, ver punto 3). Ningún agente (Amelia, Winston, Sally, etc.) intervino.
- **Claude Code (sin agentes BMAD)** cubrió los roles:
  - **Análisis / arquitectura**: reparto del juego en la arquitectura existente: `types/game.ts`; funciones puras en `utils/game/` (`physics`, `collisions`, `obstacles`, `scenery`, `themes`, `setup`, `engine`, `render`, `sprite`, `record`, `constants`); hook `hooks/usePokeRunner.ts`; componentes en `components/Pokedex/PokeRunner/`. La Pokédex guarda el id del Pokémon con el que se juega, de modo que al cambiar de Pokémon o al cerrarse la Pokédex el juego se desmonta solo y libera el bucle y los listeners.
  - **Desarrollo**: minijuego completo según el prompt. Decisiones propias: sistema lógico de 600 × 352 (misma proporción que la pantalla); velocidad inicial `280 + t·140` u/s con `t = clamp((stat − 20) / 140, 0, 1)` y máxima = inicial + 300; hitbox al 80 % del área opaca del sprite; voladores a tres alturas (saltar, agacharse o pasar por debajo); integración exacta de la gravedad para que la altura del salto no dependa de los Hz; caída rápida con ↓ en el aire; si el sprite no permite CORS se dibuja sin recorte.
  - **QA / verificación**: `tsc -b`, `eslint` y `npm run build` sin errores. Pruebas en Chrome headless (`puppeteer-core` instalado solo en un directorio temporal fuera del proyecto), todas correctas: funciones puras (misma distancia y altura de salto a 60 y 144 Hz, salto variable 85 → 150, doble salto, voladores solo desde 500 puntos, velocidad acotada 280–420); botón rojo con `aria-label` dinámico; transición de encendido; punto rojo parpadeante; 0–9 y ◀ ▶ deshabilitados; número → puntaje `00000`; panel de estado; canvas a `devicePixelRatio` 2 y 3; game over y récord en `localStorage`; «¡NUEVO RÉCORD!» parpadeando; reintento con D-pad ▲; pausa con `visibilitychange` y reanudación tocando; Escape vuelve a la sección previa y los atajos ← → funcionan de nuevo; RANDOM y «Cerrar Pokédex» cierran el juego; Charizard (doble salto por tipo Volador, escenario Volcán), Gastly (Levitación, escenario Noche); `prefers-reduced-motion` sin transición; emulación móvil (tocar empieza, controles táctiles en el panel) y sin errores de consola. Se corrigieron dos detalles durante las pruebas: la altura del salto variaba ~3 unidades según los Hz (se cambió la integración) y un contorno amarillo de foco aparecía sobre el juego.
  - **No verificado**: no se probó en un móvil ni en un monitor de 120 Hz reales (solo emulación y pruebas de las funciones puras), ni en otros navegadores distintos de Chrome.

---
### Prompt 4 – Texto «Jugar» / «Salir» visible en el botón rojo (2026-09-28)

1. **Prompt utilizado**

````markdown
haz que el boton muestre "Jugar" o "Salir" según sea el caso
````

2. **Tecnologías (rol en esta etapa)**
- **React + TypeScript** (`src/components/Pokedex.tsx`): el botón rojo renderiza como contenido el texto «Jugar» o «Salir» según el estado `gameOn`.
- **CSS3** (`src/components/Pokedex.css`): se centra el texto dentro del botón circular y se elimina la etiqueta flotante (`::after` con `data-label`) que antes solo aparecía al pasar el cursor.

3. **Arnés de IA**
- Se trabajó desde **Claude Code** (CLI). No se ejecutó ningún flujo de **BMAD CLI** (cambio pequeño y directo; `uv` no está instalado, así que `bmad-build` no puede ejecutarse).

4. **Skills / agentes de IA empleados**
- **Claude Code (sin agentes BMAD)**: lectura del código, edición del componente y de los estilos, y verificación con `tsc`, `eslint` y `npm run build`.
