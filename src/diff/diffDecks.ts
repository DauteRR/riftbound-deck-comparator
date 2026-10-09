import type { CardCatalog } from '@/domain/cards'
import { compareCards } from '@/domain/sort'
import type { Deck, DeckEntry } from '@/domain/deck'

export type SectionId =
  | 'legendAndChosen'
  | 'main'
  | 'sideboard'
  | 'battlefields'
  | 'runes'
  | 'unknown'

export type SectionDiff = {
  id: SectionId
  onlyLeft: DeckEntry[]
  onlyRight: DeckEntry[]
  common: DeckEntry[]
  leftGaps: number
  rightGaps: number
}

export type DeckDiff = Record<SectionId, SectionDiff>

type SectionEntries = {
  entries: DeckEntry[]
  gaps: number
}

type CardGroup = {
  count: number
  representativeCode: string
  representativeCount: number
}

const BATTLEFIELDS_SIZE = 3
const RUNES_SIZE = 12

const SECTION_IDS: SectionId[] = [
  'legendAndChosen',
  'main',
  'sideboard',
  'battlefields',
  'runes',
  'unknown',
]

function countOf(entries: DeckEntry[]): number {
  return entries.reduce((total, entry) => total + entry.count, 0)
}

function missingFrom(expected: number, present: number): number {
  return Math.max(0, expected - present)
}

function legendAndChosenEntries(deck: Deck): SectionEntries {
  const entries = [deck.legend, ...(deck.additionalLegends ?? []), deck.champion].filter(
    (entry): entry is DeckEntry => entry !== undefined,
  )
  const gaps = (deck.legend ? 0 : 1) + (deck.champion ? 0 : 1)

  return { entries, gaps }
}

function sectionEntries(deck: Deck, id: SectionId): SectionEntries {
  switch (id) {
    case 'legendAndChosen':
      return legendAndChosenEntries(deck)
    case 'main':
      return { entries: deck.main, gaps: 0 }
    case 'sideboard':
      return { entries: deck.sideboard, gaps: 0 }
    case 'battlefields':
      return {
        entries: deck.battlefields,
        gaps: missingFrom(BATTLEFIELDS_SIZE, countOf(deck.battlefields)),
      }
    case 'runes':
      return { entries: deck.runes, gaps: missingFrom(RUNES_SIZE, countOf(deck.runes)) }
    case 'unknown':
      return { entries: deck.unknown, gaps: 0 }
  }
}

function groupByCard(entries: DeckEntry[], catalog: CardCatalog): Map<string, CardGroup> {
  const groups = new Map<string, CardGroup>()

  for (const entry of entries) {
    const key = catalog.cardKey(entry.code)
    const group = groups.get(key)

    if (!group) {
      groups.set(key, {
        count: entry.count,
        representativeCode: entry.code,
        representativeCount: entry.count,
      })
      continue
    }

    group.count += entry.count

    if (entry.count > group.representativeCount) {
      group.representativeCode = entry.code
      group.representativeCount = entry.count
    }
  }

  return groups
}

function compareEntries(catalog: CardCatalog) {
  return (first: DeckEntry, second: DeckEntry): number => {
    const firstCard = catalog.findByCode(first.code)
    const secondCard = catalog.findByCode(second.code)

    if (firstCard && secondCard) return compareCards(firstCard, secondCard)
    if (firstCard) return -1
    if (secondCard) return 1

    return first.code.localeCompare(second.code)
  }
}

function diffSection(id: SectionId, left: Deck, right: Deck, catalog: CardCatalog): SectionDiff {
  const leftSection = sectionEntries(left, id)
  const rightSection = sectionEntries(right, id)
  const leftGroups = groupByCard(leftSection.entries, catalog)
  const rightGroups = groupByCard(rightSection.entries, catalog)
  const onlyLeft: DeckEntry[] = []
  const onlyRight: DeckEntry[] = []
  const common: DeckEntry[] = []

  for (const key of new Set([...leftGroups.keys(), ...rightGroups.keys()])) {
    const leftGroup = leftGroups.get(key)
    const rightGroup = rightGroups.get(key)
    const leftCount = leftGroup?.count ?? 0
    const rightCount = rightGroup?.count ?? 0
    const commonCount = Math.min(leftCount, rightCount)

    if (leftGroup && commonCount > 0) {
      common.push({ code: leftGroup.representativeCode, count: commonCount })
    }

    if (leftGroup && leftCount > rightCount) {
      onlyLeft.push({ code: leftGroup.representativeCode, count: leftCount - rightCount })
    }

    if (rightGroup && rightCount > leftCount) {
      onlyRight.push({ code: rightGroup.representativeCode, count: rightCount - leftCount })
    }
  }

  const byCard = compareEntries(catalog)

  return {
    id,
    onlyLeft: onlyLeft.sort(byCard),
    onlyRight: onlyRight.sort(byCard),
    common: common.sort(byCard),
    leftGaps: leftSection.gaps,
    rightGaps: rightSection.gaps,
  }
}

export function diffDecks(left: Deck, right: Deck, catalog: CardCatalog): DeckDiff {
  return Object.fromEntries(
    SECTION_IDS.map((id) => [id, diffSection(id, left, right, catalog)]),
  ) as DeckDiff
}
