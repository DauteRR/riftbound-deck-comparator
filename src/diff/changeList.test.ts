import { describe, expect, it } from 'vitest'
import type { Card } from '@/domain/card'
import { createCardCatalog } from '@/domain/cards'
import { createEmptyDeck } from '@/domain/deck'
import { buildChangeList, groupChangesBySection } from '@/diff/changeList'
import { diffDecks } from '@/diff/diffDecks'

function buildCard(code: string, name: string, overrides: Partial<Card> = {}): Card {
  return {
    code,
    name,
    type: 'Unit',
    cost: { energy: 1, power: 0 },
    isAlternate: false,
    isOvernumbered: false,
    isSigned: false,
    isSpecial: false,
    imageUrl: 'https://example.com/card.png',
    ...overrides,
  }
}

const catalog = createCardCatalog([
  buildCard('OGN-001', 'Alpha'),
  buildCard('OGN-001a', 'Alpha', { isAlternate: true }),
  buildCard('OGN-002', 'Beta'),
  buildCard('OGN-003', 'Gamma'),
])

function changesBetween(
  configureLeft: (deck: ReturnType<typeof createEmptyDeck>) => void,
  configureRight: (deck: ReturnType<typeof createEmptyDeck>) => void,
) {
  const left = createEmptyDeck()
  const right = createEmptyDeck()
  configureLeft(left)
  configureRight(right)

  return buildChangeList(diffDecks(left, right, catalog), catalog)
}

describe('buildChangeList', () => {
  it('is empty for identical decks', () => {
    const changes = changesBetween(
      (deck) => (deck.main = [{ code: 'OGN-001', count: 2 }]),
      (deck) => (deck.main = [{ code: 'OGN-001', count: 2 }]),
    )

    expect(changes).toEqual({ remove: [], move: [], add: [] })
  })

  it('removes what only left has and adds what only right has', () => {
    const changes = changesBetween(
      (deck) => (deck.main = [{ code: 'OGN-001', count: 3 }]),
      (deck) => (deck.main = [{ code: 'OGN-002', count: 2 }]),
    )

    expect(changes.remove).toEqual([{ code: 'OGN-001', count: 3, section: 'main' }])
    expect(changes.add).toEqual([{ code: 'OGN-002', count: 2, section: 'main' }])
    expect(changes.move).toEqual([])
  })

  it('moves a card from sideboard to main', () => {
    const changes = changesBetween(
      (deck) => (deck.sideboard = [{ code: 'OGN-001', count: 1 }]),
      (deck) => (deck.main = [{ code: 'OGN-001', count: 1 }]),
    )

    expect(changes.move).toEqual([{ code: 'OGN-001', count: 1, from: 'sideboard', to: 'main' }])
    expect(changes.remove).toEqual([])
    expect(changes.add).toEqual([])
  })

  it('moves part of the copies and removes the rest', () => {
    const changes = changesBetween(
      (deck) => (deck.sideboard = [{ code: 'OGN-001', count: 3 }]),
      (deck) => (deck.main = [{ code: 'OGN-001', count: 1 }]),
    )

    expect(changes.move).toEqual([{ code: 'OGN-001', count: 1, from: 'sideboard', to: 'main' }])
    expect(changes.remove).toEqual([{ code: 'OGN-001', count: 2, section: 'sideboard' }])
  })

  it('moves part of the copies and adds the rest', () => {
    const changes = changesBetween(
      (deck) => (deck.sideboard = [{ code: 'OGN-001', count: 1 }]),
      (deck) => (deck.main = [{ code: 'OGN-001', count: 3 }]),
    )

    expect(changes.move).toEqual([{ code: 'OGN-001', count: 1, from: 'sideboard', to: 'main' }])
    expect(changes.add).toEqual([{ code: 'OGN-001', count: 2, section: 'main' }])
  })

  it('moves across art variants', () => {
    const changes = changesBetween(
      (deck) => (deck.main = [{ code: 'OGN-001a', count: 1 }]),
      (deck) => (deck.sideboard = [{ code: 'OGN-001', count: 1 }]),
    )

    expect(changes.move).toEqual([{ code: 'OGN-001a', count: 1, from: 'main', to: 'sideboard' }])
  })

  it('turns a swapped split between sections into a single move', () => {
    const changes = changesBetween(
      (deck) => {
        deck.main = [{ code: 'OGN-001', count: 2 }]
        deck.sideboard = [{ code: 'OGN-001', count: 1 }]
      },
      (deck) => {
        deck.main = [{ code: 'OGN-001', count: 1 }]
        deck.sideboard = [{ code: 'OGN-001', count: 2 }]
      },
    )

    expect(changes.move).toEqual([{ code: 'OGN-001', count: 1, from: 'main', to: 'sideboard' }])
    expect(changes.remove).toEqual([])
    expect(changes.add).toEqual([])
  })

  it('includes legends and unknown cards but not gaps', () => {
    const changes = changesBetween(
      (deck) => {
        deck.legend = { code: 'OGN-003', count: 1 }
        deck.unknown = [{ code: 'RAD-001', count: 1 }]
      },
      () => {},
    )

    expect(changes.remove).toEqual([
      { code: 'OGN-003', count: 1, section: 'legendAndChosen' },
      { code: 'RAD-001', count: 1, section: 'unknown' },
    ])
    expect(changes.add).toEqual([])
  })
})

describe('groupChangesBySection', () => {
  it('groups changes by section in section order, moves under their origin', () => {
    const changes = changesBetween(
      (deck) => {
        deck.legend = { code: 'OGN-003', count: 1 }
        deck.main = [{ code: 'OGN-001', count: 2 }]
        deck.sideboard = [{ code: 'OGN-002', count: 1 }]
      },
      (deck) => {
        deck.main = [
          { code: 'OGN-002', count: 1 },
          { code: 'OGN-003', count: 1 },
        ]
        deck.sideboard = [{ code: 'OGN-001', count: 1 }]
      },
    )

    expect(groupChangesBySection(changes)).toEqual([
      {
        section: 'legendAndChosen',
        remove: [],
        move: [{ code: 'OGN-003', count: 1, from: 'legendAndChosen', to: 'main' }],
        add: [],
      },
      {
        section: 'main',
        remove: [{ code: 'OGN-001', count: 1, section: 'main' }],
        move: [{ code: 'OGN-001', count: 1, from: 'main', to: 'sideboard' }],
        add: [],
      },
      {
        section: 'sideboard',
        remove: [],
        move: [{ code: 'OGN-002', count: 1, from: 'sideboard', to: 'main' }],
        add: [],
      },
    ])
  })

  it('skips sections without changes', () => {
    const changes = changesBetween(
      () => {},
      (deck) => (deck.main = [{ code: 'OGN-001', count: 1 }]),
    )

    expect(groupChangesBySection(changes).map(({ section }) => section)).toEqual(['main'])
  })
})
