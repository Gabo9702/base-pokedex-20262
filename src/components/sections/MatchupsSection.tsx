import { useCallback } from 'react'
import { getTypeData } from '../../api/pokeapi'
import { useAsync } from '../../hooks/useAsync'
import type { Pokemon } from '../../types/pokemon'
import { calculateMatchups, MULTIPLIER_LABELS, MULTIPLIERS } from '../../utils/typeChart'
import { TypeBadge } from '../TypeBadge'
import { SectionStatus } from './SectionStatus'

export function MatchupsSection({ pokemon }: { pokemon: Pokemon }) {
  const typeKey = pokemon.types.map(({ type }) => type.name).join('/')
  const load = useCallback(async () => {
    const typeData = await Promise.all(typeKey.split('/').map(getTypeData))
    return calculateMatchups(typeData)
  }, [typeKey])
  const state = useAsync(load)

  return (
    <SectionStatus state={state}>
      {(matchups) => (
        <div className="matchups">
          {MULTIPLIERS.filter((multiplier) => matchups[multiplier].length > 0).map((multiplier) => (
            <div key={multiplier} className="matchups__group">
              <span className="matchups__factor">{MULTIPLIER_LABELS[multiplier]}</span>
              <span className="badge-row">
                {matchups[multiplier].map((name) => (
                  <TypeBadge key={name} name={name} />
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionStatus>
  )
}
