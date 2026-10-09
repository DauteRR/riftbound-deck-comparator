import type { SectionId } from '@/diff/diffDecks'

export const SECTION_TITLES: [SectionId, string][] = [
  ['legendAndChosen', 'Legend & Chosen'],
  ['additionalLegends', 'Additional legends'],
  ['main', 'Main deck'],
  ['sideboard', 'Sideboard'],
  ['battlefields', 'Battlefields'],
  ['runes', 'Runes'],
  ['unknown', 'Unknown cards'],
]

export const SECTION_TITLE_BY_ID = Object.fromEntries(SECTION_TITLES) as Record<SectionId, string>
