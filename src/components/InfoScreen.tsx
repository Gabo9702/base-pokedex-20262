import type { ReactNode } from 'react'
import { SECTIONS } from '../data/labels'
import type { PokedexEntry } from '../hooks/usePokedex'
import { AbilitiesSection } from './sections/AbilitiesSection'
import { DescriptionSection } from './sections/DescriptionSection'
import { EvolutionSection } from './sections/EvolutionSection'
import { MatchupsSection } from './sections/MatchupsSection'
import { MovesSection } from './sections/MovesSection'
import { PhysicalSection } from './sections/PhysicalSection'
import { SpeciesSection } from './sections/SpeciesSection'
import { SpritesSection } from './sections/SpritesSection'
import { StatsSection } from './sections/StatsSection'
import { TypesSection } from './sections/TypesSection'
import './sections/Sections.css'

interface InfoScreenProps {
  entry: PokedexEntry
  section: number
}

function renderSection(section: number, { pokemon, species }: PokedexEntry): ReactNode {
  switch (section) {
    case 0:
      return <DescriptionSection species={species} />
    case 1:
      return <TypesSection pokemon={pokemon} />
    case 2:
      return <StatsSection pokemon={pokemon} />
    case 3:
      return <AbilitiesSection pokemon={pokemon} />
    case 4:
      return <PhysicalSection pokemon={pokemon} />
    case 5:
      return <MovesSection pokemon={pokemon} />
    case 6:
      return <EvolutionSection species={species} />
    case 7:
      return <SpeciesSection species={species} />
    case 8:
      return <SpritesSection pokemon={pokemon} />
    case 9:
      return <MatchupsSection pokemon={pokemon} />
    default:
      return null
  }
}

export function InfoScreen({ entry, section }: InfoScreenProps) {
  return (
    <>
      <h2 className="info-title">
        {section} · {SECTIONS[section].title}
      </h2>
      {renderSection(section, entry)}
    </>
  )
}
