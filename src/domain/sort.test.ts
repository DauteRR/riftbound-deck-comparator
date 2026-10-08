import { describe, expect, it } from 'vitest'
import type { Card } from '@/domain/card'
import { sortCards } from '@/domain/sort'

function buildCard(code: string, overrides: Partial<Card> = {}): Card {
  return {
    code,
    name: code,
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

function sortedCodes(cards: Card[]) {
  return sortCards(cards).map((card) => card.code)
}

describe('sortCards', () => {
  it('orders by card type first', () => {
    const cards = [
      buildCard('OGN-001', { type: 'Gear' }),
      buildCard('OGN-002', { type: 'Spell' }),
      buildCard('OGN-003', { type: 'Unit' }),
    ]

    expect(sortedCodes(cards)).toEqual(['OGN-003', 'OGN-002', 'OGN-001'])
  })

  it('orders by energy before power within a type', () => {
    const cards = [
      buildCard('OGN-001', { cost: { energy: 3, power: 0 } }),
      buildCard('OGN-002', { cost: { energy: 2, power: 2 } }),
      buildCard('OGN-003', { cost: { energy: 2, power: 1 } }),
    ]

    expect(sortedCodes(cards)).toEqual(['OGN-003', 'OGN-002', 'OGN-001'])
  })

  it('orders by set, oldest first, when costs are equal', () => {
    const cards = [buildCard('SFD-001'), buildCard('OGN-200'), buildCard('UNL-001')]

    expect(sortedCodes(cards)).toEqual(['OGN-200', 'SFD-001', 'UNL-001'])
  })

  it('orders by card number within a set', () => {
    const cards = [buildCard('OGN-100'), buildCard('OGN-020'), buildCard('OGN-003')]

    expect(sortedCodes(cards)).toEqual(['OGN-003', 'OGN-020', 'OGN-100'])
  })

  it('orders base printings before their variants', () => {
    const cards = [buildCard('OGN-001a'), buildCard('OGN-001')]

    expect(sortedCodes(cards)).toEqual(['OGN-001', 'OGN-001a'])
  })

  it('orders cards without cost only by set and number', () => {
    const cards = [
      buildCard('SFD-010', { type: 'Rune', cost: undefined }),
      buildCard('OGN-126', { type: 'Rune', cost: undefined }),
      buildCard('OGN-007', { type: 'Rune', cost: undefined }),
    ]

    expect(sortedCodes(cards)).toEqual(['OGN-007', 'OGN-126', 'SFD-010'])
  })

  it('does not mutate the input', () => {
    const cards = [buildCard('OGN-002'), buildCard('OGN-001')]

    sortCards(cards)

    expect(cards.map((card) => card.code)).toEqual(['OGN-002', 'OGN-001'])
  })
})
