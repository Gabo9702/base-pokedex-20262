import { useEffect } from 'react'
import { getPokemonNames } from './api/pokeapi'
import { Pokedex } from './components/Pokedex'
import { Searcher } from './components/Searcher'
import { usePokedex } from './hooks/usePokedex'

function App() {
  const { state, entry, loading, error, search, step, random, close, finishTransition } =
    usePokedex()

  // Al montar la app se descarga (una sola vez, con caché) la lista de nombres para las sugerencias.
  useEffect(() => {
    getPokemonNames().catch(() => {
      // Si falla, el buscador funciona igual, solo que sin sugerencias.
    })
  }, [])

  // La Pokédex sigue montada mientras dura la animación de cierre ('closing').
  if (state === 'closed' || !entry) {
    return <Searcher loading={loading} error={error} onSearch={search} />
  }

  return (
    <Pokedex
      entry={entry}
      loading={loading}
      error={error}
      state={state}
      onClose={close}
      onTransitionDone={finishTransition}
      onStep={step}
      onRandom={random}
    />
  )
}

export default App
