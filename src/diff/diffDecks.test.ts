import { describe, expect, it } from 'vitest'
import type { Card } from '@/domain/card'
import { createCardCatalog } from '@/domain/cards'
import { createEmptyDeck } from '@/domain/deck'
import { diffDecks } from '@/diff/diffDecks'

function buildCard(overrides: Partial<Card>): Card {
  return {
    code: 'OGN-001',
    name: 'Blazing Scorcher',
    type: 'Unit',
    cost: { energy: 5, power: 0 },
    isAlternate: false,
    isOvernumbered: false,
    isSigned: false,
    isSpecial: false,
    imageUrl: 'https://example.com/card.png',
    ...overrides,
  }
}

const catalog = createCardCatalog([
  buildCard({ code: 'OGN-001', name: 'Blazing Scorcher', cost: { energy: 5, power: 0 } }),
  buildCard({
    code: 'OGN-001a',
    name: 'Blazing Scorcher',
    isAlternate: true,
    cost: { energy: 5, power: 0 },
  }),
  buildCard({ code: 'OGN-002', name: 'Cheap Unit', cost: { energy: 1, power: 0 } }),
  buildCard({ code: 'OGN-003', name: 'Other Unit', cost: { energy: 3, power: 0 } }),
  buildCard({ code: 'OGN-100', name: 'Some Legend', type: 'Legend', cost: undefined }),
  buildCard({ code: 'OGN-101', name: 'Other Legend', type: 'Legend', cost: undefined }),
  buildCard({ code: 'OGN-200', name: 'Some Champion' }),
])

describe('diffDecks', () => {
  it('splits copies into common and the side with more', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.main = [{ code: 'OGN-002', count: 1 }]
    right.main = [{ code: 'OGN-002', count: 2 }]

    const { main } = diffDecks(left, right, catalog)

    expect(main.common).toEqual([{ code: 'OGN-002', count: 1 }])
    expect(main.onlyRight).toEqual([{ code: 'OGN-002', count: 1 }])
    expect(main.onlyLeft).toEqual([])
  })

  it('puts cards present on one side only in that side', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.main = [{ code: 'OGN-002', count: 3 }]
    right.main = [{ code: 'OGN-003', count: 2 }]

    const { main } = diffDecks(left, right, catalog)

    expect(main.onlyLeft).toEqual([{ code: 'OGN-002', count: 3 }])
    expect(main.onlyRight).toEqual([{ code: 'OGN-003', count: 2 }])
    expect(main.common).toEqual([])
  })

  it('treats art variants as the same card and shows left art in common', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.main = [{ code: 'OGN-001a', count: 2 }]
    right.main = [{ code: 'OGN-001', count: 2 }]

    const { main } = diffDecks(left, right, catalog)

    expect(main.common).toEqual([{ code: 'OGN-001a', count: 2 }])
    expect(main.onlyLeft).toEqual([])
    expect(main.onlyRight).toEqual([])
  })

  it('sums variants of the same card within one side', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.main = [
      { code: 'OGN-001', count: 1 },
      { code: 'OGN-001a', count: 2 },
    ]
    right.main = [{ code: 'OGN-001', count: 1 }]

    const { main } = diffDecks(left, right, catalog)

    expect(main.common).toEqual([{ code: 'OGN-001a', count: 1 }])
    expect(main.onlyLeft).toEqual([{ code: 'OGN-001a', count: 2 }])
  })

  it('shows each side its own art in differences', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.main = [{ code: 'OGN-001a', count: 3 }]
    right.main = [{ code: 'OGN-001', count: 1 }]

    const { main } = diffDecks(left, right, catalog)

    expect(main.onlyLeft).toEqual([{ code: 'OGN-001a', count: 2 }])
  })

  it('sorts entries by card order and unknown cards last', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.main = [
      { code: 'ZZZ-999', count: 1 },
      { code: 'OGN-003', count: 1 },
      { code: 'OGN-002', count: 1 },
    ]

    const { main } = diffDecks(left, right, catalog)

    expect(main.onlyLeft.map((entry) => entry.code)).toEqual(['OGN-002', 'OGN-003', 'ZZZ-999'])
  })

  it('merges legend, additional legends and champion in one section', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.legend = { code: 'OGN-100', count: 1 }
    left.champion = { code: 'OGN-200', count: 1 }
    right.legend = { code: 'OGN-101', count: 1 }
    right.additionalLegends = [{ code: 'OGN-100', count: 1 }]
    right.champion = { code: 'OGN-200', count: 1 }

    const { legendAndChosen } = diffDecks(left, right, catalog)

    expect(legendAndChosen.common.map((entry) => entry.code)).toEqual(['OGN-100', 'OGN-200'])
    expect(legendAndChosen.onlyRight).toEqual([{ code: 'OGN-101', count: 1 }])
    expect(legendAndChosen.leftGaps).toBe(0)
    expect(legendAndChosen.rightGaps).toBe(0)
  })

  it('reports gaps in fixed-size sections', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.legend = { code: 'OGN-100', count: 1 }
    left.battlefields = [{ code: 'OGN-002', count: 1 }]
    left.runes = [{ code: 'OGN-003', count: 12 }]
    right.champion = { code: 'OGN-200', count: 1 }
    right.battlefields = [{ code: 'OGN-002', count: 3 }]
    right.runes = [{ code: 'OGN-003', count: 9 }]

    const diff = diffDecks(left, right, catalog)

    expect(diff.legendAndChosen.leftGaps).toBe(1)
    expect(diff.legendAndChosen.rightGaps).toBe(1)
    expect(diff.battlefields.leftGaps).toBe(2)
    expect(diff.battlefields.rightGaps).toBe(0)
    expect(diff.runes.leftGaps).toBe(0)
    expect(diff.runes.rightGaps).toBe(3)
  })

  it('does not report gaps in main, sideboard or unknown', () => {
    const diff = diffDecks(createEmptyDeck(), createEmptyDeck(), catalog)

    for (const id of ['main', 'sideboard', 'unknown'] as const) {
      expect(diff[id].leftGaps).toBe(0)
      expect(diff[id].rightGaps).toBe(0)
    }
  })

  it('sorts unknown cards from sets that do not exist yet', () => {
    const left = createEmptyDeck()
    left.unknown = [
      { code: 'XYZ-002', count: 1 },
      { code: 'XYZ-001', count: 1 },
      { code: 'Some Card Name', count: 1 },
    ]

    const { unknown } = diffDecks(left, createEmptyDeck(), catalog)

    expect(unknown.onlyLeft.map((entry) => entry.code)).toEqual([
      'Some Card Name',
      'XYZ-001',
      'XYZ-002',
    ])
  })

  it('compares unknown cards by code', () => {
    const left = createEmptyDeck()
    const right = createEmptyDeck()
    left.unknown = [{ code: 'RAD-001', count: 1 }]
    right.unknown = [
      { code: 'RAD-001', count: 1 },
      { code: 'RAD-002', count: 2 },
    ]

    const { unknown } = diffDecks(left, right, catalog)

    expect(unknown.common).toEqual([{ code: 'RAD-001', count: 1 }])
    expect(unknown.onlyRight).toEqual([{ code: 'RAD-002', count: 2 }])
  })
})
