import { STAT_LABELS } from '../../data/labels'
import type { Pokemon } from '../../types/pokemon'
import { formatName } from '../../utils/format'

const MAX_STAT = 255

function barColor(value: number): string {
  // Del rojo (bajo) al verde (alto)
  const hue = Math.round(Math.min(value / 180, 1) * 120)
  return `hsl(${hue} 80% 50%)`
}

export function StatsSection({ pokemon }: { pokemon: Pokemon }) {
  const total = pokemon.stats.reduce((sum, { base_stat }) => sum + base_stat, 0)

  return (
    <ul className="stat-list">
      {pokemon.stats.map(({ stat, base_stat }) => (
        <li key={stat.name} className="stat-row">
          <span className="stat-row__label">{STAT_LABELS[stat.name] ?? formatName(stat.name)}</span>
          <span
            className="stat-row__track"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={MAX_STAT}
            aria-valuenow={base_stat}
          >
            <span
              className="stat-row__fill"
              style={{
                width: `${(base_stat / MAX_STAT) * 100}%`,
                backgroundColor: barColor(base_stat),
              }}
            />
          </span>
          <span className="stat-row__value">{base_stat}</span>
        </li>
      ))}
      <li className="stat-row stat-row--total">
        <span className="stat-row__label">Total</span>
        <span className="stat-row__track stat-row__track--empty" />
        <span className="stat-row__value">{total}</span>
      </li>
    </ul>
  )
}
