import { FALLBACK_TYPE, TYPE_INFO } from '../data/labels'
import { formatName } from '../utils/format'
import './TypeBadge.css'

interface TypeBadgeProps {
  name: string
}

export function TypeBadge({ name }: TypeBadgeProps) {
  const info = TYPE_INFO[name] ?? { ...FALLBACK_TYPE, label: formatName(name) }
  return (
    <span
      className={`type-badge${info.light ? ' type-badge--light' : ''}`}
      style={{ backgroundColor: info.color }}
    >
      {info.label}
    </span>
  )
}
