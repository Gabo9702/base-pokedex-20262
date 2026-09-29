import { useEffect, useState } from 'react'
import { errorMessage } from '../api/pokeapi'

export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T }

type Loader<T> = () => Promise<T>

interface Settled<T> {
  loader: Loader<T>
  state: Exclude<AsyncState<T>, { status: 'loading' }>
}

/**
 * Ejecuta `loader` cuando cambia su identidad (memorízalo con useCallback).
 * Mientras el resultado guardado no corresponda al loader actual el estado es "loading",
 * de modo que nunca se muestran datos de un Pokémon anterior.
 */
export function useAsync<T>(loader: Loader<T>): AsyncState<T> {
  const [settled, setSettled] = useState<Settled<T> | null>(null)

  useEffect(() => {
    let cancelled = false
    loader().then(
      (data) => {
        if (!cancelled) setSettled({ loader, state: { status: 'success', data } })
      },
      (error: unknown) => {
        if (!cancelled) {
          setSettled({ loader, state: { status: 'error', message: errorMessage(error) } })
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [loader])

  if (!settled || settled.loader !== loader) return { status: 'loading' }
  return settled.state
}
