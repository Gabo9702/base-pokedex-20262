import type { ReactNode } from 'react'
import type { AsyncState } from '../../hooks/useAsync'

interface SectionStatusProps<T> {
  state: AsyncState<T>
  children: (data: T) => ReactNode
}

/** Muestra "cargando" / error o delega en `children` cuando los datos ya llegaron. */
export function SectionStatus<T>({ state, children }: SectionStatusProps<T>) {
  if (state.status === 'loading') return <p className="muted blink">Cargando…</p>
  if (state.status === 'error') return <p className="error-text">{state.message}</p>
  return <>{children(state.data)}</>
}
