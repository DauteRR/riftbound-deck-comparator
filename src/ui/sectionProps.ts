import type { CardCatalog } from '@/domain/cards'
import type { DeckEntry } from '@/domain/deck'
import type { SectionDiff } from '@/diff/diffDecks'
import type { SectionEntry } from '@/ui/Section'

function toSectionEntries(entries: DeckEntry[], catalog: CardCatalog): SectionEntry[] {
  return entries.map(({ code, count }) => ({ code, card: catalog.findByCode(code), count }))
}

export function toSectionProps(title: string, diff: SectionDiff, catalog: CardCatalog) {
  return {
    title,
    onlyLeft: toSectionEntries(diff.onlyLeft, catalog),
    onlyRight: toSectionEntries(diff.onlyRight, catalog),
    common: toSectionEntries(diff.common, catalog),
    leftGaps: diff.leftGaps,
    rightGaps: diff.rightGaps,
    hasHorizontalCards: diff.id === 'battlefields',
    hideSingleCommonBadges: diff.id === 'legendAndChosen' || diff.id === 'additionalLegends',
  }
}
