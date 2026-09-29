import { useCallback } from 'react'
import { getEvolutionChain } from '../../api/pokeapi'
import { useAsync } from '../../hooks/useAsync'
import type { PokemonSpecies } from '../../types/pokemon'
import { flattenChain } from '../../utils/evolution'
import { capitalize } from '../../utils/format'
import { SectionStatus } from './SectionStatus'

export function EvolutionSection({ species }: { species: PokemonSpecies }) {
  const url = species.evolution_chain?.url ?? null
  const load = useCallback(
    () => (url ? getEvolutionChain(url) : Promise.resolve(null)),
    [url],
  )
  const state = useAsync(load)

  return (
    <SectionStatus state={state}>
      {(chain) => {
        const stages = chain ? flattenChain(chain.chain) : []
        if (stages.length <= 1) return <p>Este Pokémon no evoluciona.</p>

        return (
          <ul className="evo-list">
            {stages.map((stage) => (
              <li
                key={`${stage.depth}-${stage.name}`}
                className="evo-list__item"
                style={{ paddingLeft: `${stage.depth * 1.6}em` }}
              >
                <span
                  className={
                    stage.name === species.name ? 'evo-list__name is-current' : 'evo-list__name'
                  }
                >
                  {capitalize(stage.name)}
                </span>
                <span className="muted evo-list__method">
                  {stage.methods.length > 0 ? stage.methods.join(' / ') : 'Etapa inicial'}
                </span>
              </li>
            ))}
          </ul>
        )
      }}
    </SectionStatus>
  )
}
