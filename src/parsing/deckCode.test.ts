import { getDeckFromCode } from '@piltoverarchive/riftbound-deck-codes'
import { describe, expect, it } from 'vitest'
import cardsJson from '@/data/cards.json'
import type { Card } from '@/domain/card'
import { createCardCatalog } from '@/domain/cards'
import { createEmptyDeck, type Deck } from '@/domain/deck'
import { decodeDeckCode, encodeDeckCode } from '@/parsing/deckCode'
import { DECK_WITH_NEEKO, REKSAI_DECK_CODE, VEX_DECK_CODE } from '@/parsing/testDecks'

const catalog = createCardCatalog(cardsJson as Card[])

function countCopies(entries: Deck['main']) {
  return entries.reduce((total, entry) => total + entry.count, 0)
}

function sortEntries(deck: Deck): Deck {
  const sort = (entries: Deck['main']) =>
    [...entries].sort((a, b) => a.code.localeCompare(b.code))

  return {
    ...deck,
    main: sort(deck.main),
    sideboard: sort(deck.sideboard),
    battlefields: sort(deck.battlefields),
    runes: sort(deck.runes),
    unknown: sort(deck.unknown),
  }
}

describe('decodeDeckCode', () => {
  const deck = decodeDeckCode(VEX_DECK_CODE, catalog)

  it('finds the legend', () => {
    expect(deck.legend).toEqual({ code: 'UNL-232', count: 1 })
  })

  it('splits the cards of the main array by card type', () => {
    expect(deck.battlefields.map((entry) => entry.code).sort()).toEqual([
      'OGN-279',
      'OGN-288',
      'UNL-207',
    ])
    expect(deck.runes).toEqual([
      { code: 'OGN-042', count: 6 },
      { code: 'OGN-166', count: 6 },
    ])
    expect(deck.main).toHaveLength(16)
    expect(deck.main).toContainEqual({ code: 'OGN-045', count: 3 })
  })

  it('keeps the sideboard apart', () => {
    expect(deck.sideboard).toContainEqual({ code: 'SFD-045', count: 3 })
    expect(deck.sideboard).toHaveLength(4)
  })

  it('reads the chosen champion apart from the main deck', () => {
    expect(deck.champion).toEqual({ code: 'UNL-150', count: 1 })
    expect(deck.main.some((entry) => entry.code === 'UNL-150')).toBe(false)
    expect(countCopies(deck.main)).toBe(39)
  })

  it('has no additional legends or unknown cards', () => {
    expect(deck.additionalLegends).toBeUndefined()
    expect(deck.unknown).toEqual([])
  })

  it('puts cards missing from the catalog in unknown', () => {
    const emptyCatalog = createCardCatalog([])

    const unknownDeck = decodeDeckCode(VEX_DECK_CODE, emptyCatalog)

    expect(unknownDeck.legend).toBeUndefined()
    expect(unknownDeck.main).toEqual([])
    expect(unknownDeck.champion).toEqual({ code: 'UNL-150', count: 1 })
    expect(unknownDeck.unknown).toHaveLength(22)
    expect(unknownDeck.sideboard).toHaveLength(4)
  })
})

describe('encodeDeckCode', () => {
  it.each([
    ['Vex', VEX_DECK_CODE],
    ['Rek\'Sai', REKSAI_DECK_CODE],
    ['Neeko', DECK_WITH_NEEKO],
  ])('decodes the re-encoded %s deck to the same deck', (_name, code) => {
    const deck = decodeDeckCode(code, catalog)

    const roundTrip = decodeDeckCode(encodeDeckCode(deck), catalog)

    expect(sortEntries(roundTrip)).toEqual(sortEntries(deck))
  })

  it('keeps signed variants with the asterisk suffix', () => {
    const signedCard = (cardsJson as Card[]).find(
      (card) => card.isSigned && card.type === 'Unit',
    )!
    const deck: Deck = {
      ...createEmptyDeck(),
      main: [{ code: signedCard.code, count: 1 }],
    }

    const roundTrip = decodeDeckCode(encodeDeckCode(deck), catalog)

    expect(roundTrip.main).toEqual([{ code: signedCard.code, count: 1 }])
  })
})

describe('a deck whose chosen champion has another printing in the main deck', () => {
  const deck = decodeDeckCode(REKSAI_DECK_CODE, catalog)

  it('reads the chosen champion apart from the main deck', () => {
    expect(deck.champion).toEqual({ code: 'SFD-029a', count: 1 })
    expect(deck.main.some((entry) => entry.code === 'SFD-029a')).toBe(false)
    expect(countCopies(deck.main)).toBe(39)
  })

  it('keeps the other printing of the champion in the main deck', () => {
    expect(deck.main).toContainEqual({ code: 'SFD-029', count: 1 })
    expect(catalog.findByCode('SFD-029a')?.isAlternate).toBe(true)
    expect(catalog.cardKey('SFD-029')).toBe(catalog.cardKey('SFD-029a'))
  })

  it('writes both printings into the main array when encoding', () => {
    const encodedMain = getDeckFromCode(encodeDeckCode(deck), {
      signedSuffix: '*',
    }).mainDeck

    expect(encodedMain).toContainEqual({ cardCode: 'SFD-029a', count: 1 })
    expect(encodedMain).toContainEqual({ cardCode: 'SFD-029', count: 1 })
  })
})

describe('a deck code with additional legends', () => {
  const deck = decodeDeckCode(DECK_WITH_NEEKO, catalog)

  it('reads the starting legend apart from the additional ones', () => {
    expect(deck.legend).toEqual({ code: 'SFD-205', count: 1 })
    expect(deck.additionalLegends?.map((entry) => entry.code)).not.toContain('SFD-205')
  })

  it('keeps the additional legends in the order they were encoded', () => {
    expect(deck.additionalLegends).toEqual([
      { code: 'SFD-193', count: 1 },
      { code: 'VEN-151', count: 1 },
      { code: 'SFD-189', count: 1 },
    ])
  })

  it('does not mix the additional legends with the main deck', () => {
    const mainCodes = deck.main.map((entry) => entry.code)

    expect(mainCodes).not.toContain('SFD-193')
    expect(mainCodes).not.toContain('VEN-151')
    expect(mainCodes).not.toContain('SFD-189')
  })

  it('encodes the additional legends in the same order', () => {
    const encoded = getDeckFromCode(encodeDeckCode(deck), { signedSuffix: '*' })

    expect(encoded.additionalLegends).toEqual(['SFD-193', 'VEN-151', 'SFD-189'])
  })
})
