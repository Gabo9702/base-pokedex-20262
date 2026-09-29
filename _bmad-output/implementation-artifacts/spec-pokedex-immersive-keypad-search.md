---
title: 'Immersive Pokédex keypad + capture-animation search flow'
type: 'feature'
created: '2026-09-21'
status: 'draft'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Pokédex only has a left-screen text `SearchForm`; the right half of `assets/pokedex.png` (LCD display + blue button grid) is unused background, and searching has no capture-style spectacle.

**Approach:** Add a numeric keypad + LCD readout absolutely positioned over the right panel of the Pokédex image. Typing digits and pressing Enter/Buscar zooms the left forest screen, plays a 2s pokeball capture animation, then fetches from PokeAPI (reusing the existing 2000ms-delay mechanism in `usePokemon`) and renders the result inside the zoomed screen. A reset button undoes the zoom and clears the keypad.

## Boundaries & Constraints

**Always:** Keypad is digits 0-9 only (per the explicit button list in the request) plus backspace and enter/search — do not add a letter/name input path. Reuse `usePokemon`'s existing `idle→loading→success/error` states and its built-in `SEARCH_DELAY_MS` (2000ms) timer as the capture-animation window; do not add a second parallel timer. All new positioned elements use percentage-based `style` objects measured against the 1345x960 `assets/pokedex.png`, following the existing pattern in `src/App.tsx`'s `SCREEN_STYLE`.

**Never:** Do not modify `assets/pokedex.png`. Do not change the PokeAPI request shape or `Pokemon` type. Do not add a state/animation library — plain CSS transitions/keyframes only, consistent with `LoadingPokeball`'s current `animate-spin`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Happy path | User taps `2`,`5`, Enter | LCD shows "25"; screen zooms; pokeball spins 2s then "opens"; Pikachu renders zoomed | N/A |
| Empty submit | Enter pressed with empty LCD | No zoom, no search triggered (mirrors current `usePokemon.search` no-op on blank query) | N/A |
| Not found | Digits resolve to unknown id, Enter | Zoom + capture play, then error message shown in zoomed screen | Reuses existing 404 message from `usePokemon` |
| Backspace | User taps borrar | Last LCD character removed; no search triggered | N/A |
| Reset after result | User taps "Nueva búsqueda" | Screen unzooms, LCD clears, keypad/idle state returns | N/A |

</frozen-after-approval>

## Code Map

- `src/App.tsx` -- has `SCREEN_STYLE` percent-coordinate pattern for the left screen over `assets/pokedex.png` (1345x960); add sibling `RIGHT panel` coordinates here, measured (see Design Notes for exact percentages) and pass a `zoomed` flag down to `PokedexScreen`.
- `src/components/PokedexScreen.tsx` -- currently switches on `usePokemon` status to render `SearchForm | LoadingPokeball | PokemonResult`; becomes the zoomable left-screen container (apply `scale-125 transition-transform duration-700` when zoomed) and drops `SearchForm` (keypad replaces it, lives outside this component in App).
- `src/components/SearchForm.tsx` -- delete; superseded by the new keypad component.
- `src/components/LoadingPokeball.tsx` -- rename to `src/components/PokeballCapture.tsx`; extend with a capture animation (throw/spin for the 2s delay window, then an "opening" flash) via new keyframes in `src/index.css`.
- `src/hooks/usePokemon.ts` -- no logic changes; `status==='loading'` for the full `SEARCH_DELAY_MS` window is already the capture-animation signal.
- `src/index.css` -- add `@keyframes` for pokeball spin/open flash (no animation library).
- New `src/components/PokedexKeypad.tsx` -- LCD display (shows live buffer) + 10 digit buttons (5x2 grid) + backspace + enter/buscar, absolutely positioned via measured percentages (Design Notes); owns the text-buffer state and calls `onSubmit(buffer)` / lets `App` own `zoomed` + call into `usePokemon`.
- `informe_ia.md` -- append a new dated prompt-log entry per existing format (do not rewrite prior entries).

## Tasks & Acceptance

**Execution:**
- [ ] `src/components/PokedexKeypad.tsx` -- new component: buffer state, LCD readout, 0-9/backspace/enter buttons at measured coordinates -- fulfills Objetivo 2 right-panel requirement
- [ ] `src/App.tsx` -- render `PokedexKeypad` beside `PokedexScreen`; lift `zoomed` state, set it true on submit / false on reset -- wires keypad to the zoom/capture flow
- [ ] `src/components/PokedexScreen.tsx` -- remove `SearchForm` usage; add zoom transform class bound to `zoomed` prop; keep `LoadingPokeball`→`PokeballCapture`/`PokemonResult`/error branches -- Objetivo 3 zoom + result rendering
- [ ] `src/components/PokeballCapture.tsx` (renamed) -- 2s throw+spin, then opening flash, matching the `loading` status duration -- Objetivo 3 capture animation
- [ ] `src/components/PokemonResult.tsx` -- keep sprite/name/id/species/types; ensure reset button stays visually discreet inside the now-zoomed screen -- Objetivo 3 reset requirement
- [ ] `src/index.css` -- add capture/flash `@keyframes` -- supports PokeballCapture
- [ ] delete `src/components/SearchForm.tsx` -- superseded
- [ ] `informe_ia.md` -- append this session's prompt + harness/skills + changes, following the existing entry format -- Objetivo 1

**Acceptance Criteria:**
- Given the LCD buffer has digits, when Enter/Buscar is pressed, then the left screen scales up over ~700ms and a pokeball capture animation plays for ~2s before the PokeAPI request resolves into a result or error.
- Given a result or error is shown, when the reset button is pressed, then the screen returns to unscaled, the LCD buffer clears, and the keypad is ready for new input.
- Given the LCD buffer is empty, when Enter/Buscar is pressed, then nothing happens (no zoom, no request).

## Implementation Notes

## Design Notes

Percentages measured against `assets/pokedex.png` (1345x960px, same basis as `SCREEN_STYLE`) via pixel color-sampling (dark LCD `rgb(8,64,53)`, keypad blue `rgb(34,196,234)`):

- LCD display: `left 60.8%, top 33.3%, width 31.2%, height 15.2%`
- Keypad grid bbox: `left 61.26%, top 52.92%, width 30.78%, height 11.67%` → split into 5 cols × 2 rows, cell size `~6.16% × ~5.84%`; label row 1 (top) `1 2 3 4 5`, row 2 (bottom) `6 7 8 9 0`.
- Bottom-left dark pill button (borrar): `left 60.74%, top 84.38%, width 14.13%, height 6.35%`
- Bottom-right dark pill button (buscar/enter): `left 78.07%, top 84.48%, width 13.98%, height 6.25%`

## Verification

**Commands:**
- `npx tsc -b` -- expected: no type errors
- `npm run lint` -- expected: no lint errors
- `npm run build` -- expected: production build succeeds

**Manual checks (if no CLI):**
- `npm run dev`, type a valid id (e.g. `25`) on the on-screen keypad, press Enter: confirm zoom, 2s capture animation, then Pikachu renders; press reset and confirm it returns to idle keypad-ready state; try an invalid id (e.g. `99999`) and confirm the error path also plays the zoom/capture before showing the error message.
