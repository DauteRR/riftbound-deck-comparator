import { SET_MAP } from '@piltoverarchive/riftbound-deck-codes'
import { describe, expect, it } from 'vitest'
import type { Card } from '@/domain/card'
import { findLatestSet } from '@/domain/sets'

function buildCard(code: string): Card {
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
  }
}

describe('findLatestSet', () => {
  it('returns the set that comes last in the library order', () => {
    const [olderSet, newerSet] = Object.keys(SET_MAP).sort((a, b) => SET_MAP[a] - SET_MAP[b])

    const cards = [
      buildCard(`${newerSet}-001`),
      buildCard(`${olderSet}-001`),
      buildCard(`${olderSet}-002a`),
    ]

    expect(findLatestSet(cards)).toBe(newerSet)
  })

  it('returns undefined without cards', () => {
    expect(findLatestSet([])).toBeUndefined()
  })
})
