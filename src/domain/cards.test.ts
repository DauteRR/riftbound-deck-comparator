import { describe, expect, it } from 'vitest'
import type { Card } from '@/domain/card'
import { createCardCatalog } from '@/domain/cards'

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
  buildCard({ code: 'OGN-126', name: 'Body Rune', type: 'Rune', cost: undefined }),
  buildCard({
    code: 'OGN-126a',
    name: 'Body Rune',
    type: 'Rune',
    cost: undefined,
    isAlternate: true,
  }),
  buildCard({
    code: 'SFD-227*',
    name: 'Body Rune',
    type: 'Rune',
    cost: undefined,
    isAlternate: true,
    isSigned: true,
  }),
  buildCard({ code: 'OGN-001', name: 'Blazing Scorcher' }),
])

describe('findByCode', () => {
  it('returns the card with that exact code', () => {
    expect(catalog.findByCode('OGN-126a')?.code).toBe('OGN-126a')
  })

  it('returns undefined for a code that is not in the catalog', () => {
    expect(catalog.findByCode('XXX-999')).toBeUndefined()
  })
})

describe('cardKey', () => {
  it('gives every variant of a card the same key', () => {
    const keys = ['OGN-126', 'OGN-126a', 'SFD-227*'].map(catalog.cardKey)

    expect(keys).toEqual(['Body Rune', 'Body Rune', 'Body Rune'])
  })

  it('keeps different cards apart', () => {
    expect(catalog.cardKey('OGN-001')).not.toBe(catalog.cardKey('OGN-126'))
  })

  it('falls back to the code for unknown cards', () => {
    expect(catalog.cardKey('XXX-999')).toBe('XXX-999')
  })
})

describe('findBaseByName', () => {
  it('returns the base printing of a card', () => {
    expect(catalog.findBaseByName('Body Rune')?.code).toBe('OGN-126')
  })

  it('returns the base printing even when a variant is listed first', () => {
    const variantFirst = createCardCatalog([
      buildCard({ code: 'OGN-126a', name: 'Body Rune', isAlternate: true }),
      buildCard({ code: 'OGN-126', name: 'Body Rune' }),
    ])

    expect(variantFirst.findBaseByName('Body Rune')?.code).toBe('OGN-126')
  })

  it('ignores case', () => {
    expect(catalog.findBaseByName('bODY rUNE')?.code).toBe('OGN-126')
  })

  it('returns undefined for an unknown name', () => {
    expect(catalog.findBaseByName('Nonexistent Card')).toBeUndefined()
  })
})
