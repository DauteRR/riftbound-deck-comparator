import { describe, expect, it } from 'vitest'
import cardsJson from '@/data/cards.json'
import type { Card } from '@/domain/card'
import { createCardCatalog } from '@/domain/cards'
import { decodeDeckCode } from '@/parsing/deckCode'
import { parseDeckText } from '@/parsing/textParser'
import {
  DECK_WITH_NEEKO,
  REKSAI_DECK_CODE,
  VEX_DECK_CODE,
  VEX_DECK_TEXT,
} from '@/parsing/testDecks'
import { buildSearch, readDecksFromSearch } from '@/url'

const catalog = createCardCatalog(cardsJson as Card[])

const vexDeck = decodeDeckCode(VEX_DECK_CODE, catalog)
const reksaiDeck = decodeDeckCode(REKSAI_DECK_CODE, catalog)

describe('buildSearch', () => {
  it('puts the first deck in left and the second in right', () => {
    const params = new URLSearchParams(buildSearch(vexDeck, reksaiDeck))

    expect(decodeDeckCode(params.get('left')!, catalog)).toEqual(vexDeck)
    expect(decodeDeckCode(params.get('right')!, catalog)).toEqual(reksaiDeck)
  })

  it('starts with a question mark', () => {
    expect(buildSearch(vexDeck, reksaiDeck).startsWith('?left=')).toBe(true)
  })

  it('writes a deck read from text as a deck code', () => {
    const textDeck = parseDeckText(VEX_DECK_TEXT, catalog)

    const params = new URLSearchParams(buildSearch(textDeck, reksaiDeck))

    expect(params.get('left')).toMatch(/^[A-Z2-7]+$/)
  })

  it('leaves out unknown cards that are only a written name', () => {
    const withUnknown = parseDeckText('MainDeck:\n3 Defy\n2 Made Up Card', catalog)
    const withoutUnknown = parseDeckText('MainDeck:\n3 Defy', catalog)

    expect(buildSearch(withUnknown, reksaiDeck)).toBe(buildSearch(withoutUnknown, reksaiDeck))
  })

  it('keeps unknown cards that have a card code', () => {
    const emptyCatalog = createCardCatalog([])
    const deck = decodeDeckCode(VEX_DECK_CODE, emptyCatalog)

    const params = new URLSearchParams(buildSearch(deck, reksaiDeck))

    expect(decodeDeckCode(params.get('left')!, catalog)).toEqual(vexDeck)
  })
})

describe('readDecksFromSearch', () => {
  it('reads both decks from left and right', () => {
    const search = `?left=${VEX_DECK_CODE}&right=${DECK_WITH_NEEKO}`

    const decks = readDecksFromSearch(search, catalog)

    expect(decks?.deckA).toEqual(decodeDeckCode(VEX_DECK_CODE, catalog))
    expect(decks?.deckB).toEqual(decodeDeckCode(DECK_WITH_NEEKO, catalog))
  })

  it('reads the search without the question mark', () => {
    expect(readDecksFromSearch(`left=${VEX_DECK_CODE}&right=${VEX_DECK_CODE}`, catalog)).toBeDefined()
  })

  it('returns nothing when right is missing', () => {
    expect(readDecksFromSearch(`?left=${VEX_DECK_CODE}`, catalog)).toBeUndefined()
  })

  it('returns nothing when left is missing', () => {
    expect(readDecksFromSearch(`?right=${VEX_DECK_CODE}`, catalog)).toBeUndefined()
  })

  it('returns nothing when there is no search', () => {
    expect(readDecksFromSearch('', catalog)).toBeUndefined()
  })

  it('returns nothing when a deck is empty', () => {
    expect(readDecksFromSearch(`?left=&right=${VEX_DECK_CODE}`, catalog)).toBeUndefined()
  })

  it('ignores other parameters', () => {
    const search = `?x=1&left=${VEX_DECK_CODE}&right=${REKSAI_DECK_CODE}`

    expect(readDecksFromSearch(search, catalog)?.deckB).toEqual(reksaiDeck)
  })
})

describe('building and reading back', () => {
  it('gives back the same two decks', () => {
    const decks = readDecksFromSearch(buildSearch(vexDeck, reksaiDeck), catalog)

    expect(decks).toEqual({ deckA: vexDeck, deckB: reksaiDeck })
  })

  it('keeps the additional legends of a deck', () => {
    const neekoDeck = decodeDeckCode(DECK_WITH_NEEKO, catalog)

    const decks = readDecksFromSearch(buildSearch(neekoDeck, vexDeck), catalog)

    expect(decks?.deckA.additionalLegends).toEqual(neekoDeck.additionalLegends)
  })
})
