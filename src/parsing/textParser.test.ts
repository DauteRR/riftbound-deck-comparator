import { describe, expect, it } from 'vitest'
import cardsJson from '@/data/cards.json'
import type { Card } from '@/domain/card'
import { createCardCatalog } from '@/domain/cards'
import type { Deck, DeckEntry } from '@/domain/deck'
import { decodeDeckCode } from '@/parsing/deckCode'
import {
  DECK_WITH_NEEKO,
  NEEKO_DECK_TEXT,
  REKSAI_DECK_CODE,
  REKSAI_DECK_TEXT,
  VEX_DECK_CODE,
  VEX_DECK_TEXT,
} from '@/parsing/testDecks'
import { parseDeckText } from '@/parsing/textParser'

const catalog = createCardCatalog(cardsJson as Card[])

const parse = (text: string) => parseDeckText(text, catalog)

function toNames(entries: DeckEntry[] = []) {
  return entries.map((entry) => `${entry.count} ${catalog.cardKey(entry.code)}`).sort()
}

function toNamedSections(deck: Deck) {
  return {
    legend: toNames(deck.legend && [deck.legend]),
    champion: toNames(deck.champion && [deck.champion]),
    main: toNames(deck.main),
    sideboard: toNames(deck.sideboard),
    battlefields: toNames(deck.battlefields),
    runes: toNames(deck.runes),
  }
}

describe('real decks', () => {
  it('reads the Vex deck like its deck code', () => {
    const fromText = parse(VEX_DECK_TEXT)
    const fromCode = decodeDeckCode(VEX_DECK_CODE, catalog)

    expect(toNamedSections(fromText)).toEqual(toNamedSections(fromCode))
    expect(fromText.unknown).toEqual([])
  })

  it("reads the Rek'Sai deck like its deck code", () => {
    const fromText = parse(REKSAI_DECK_TEXT)
    const fromCode = decodeDeckCode(REKSAI_DECK_CODE, catalog)

    expect(toNamedSections(fromText)).toEqual(toNamedSections(fromCode))
    expect(fromText.unknown).toEqual([])
  })

  it('reads the Neeko deck like its deck code, except for its runes', () => {
    const fromText = parse(NEEKO_DECK_TEXT)
    const fromCode = decodeDeckCode(DECK_WITH_NEEKO, catalog)
    const { runes: textRunes, ...textSections } = toNamedSections(fromText)
    const { runes: _codeRunes, ...codeSections } = toNamedSections(fromCode)

    expect(textSections).toEqual(codeSections)
    expect(textRunes).toEqual(['6 Body Rune', '6 Order Rune'])
    expect(fromText.unknown).toEqual([])
  })
})

describe('sections', () => {
  it('reads the Legend section', () => {
    expect(parse('Legend:\n1 Vex, Gloomist').legend).toEqual({ code: 'UNL-193', count: 1 })
  })

  it('reads the Champion section', () => {
    expect(parse('Champion:\n1 Vex, Apathetic').champion).toEqual({ code: 'UNL-150', count: 1 })
  })

  it('reads the MainDeck section', () => {
    expect(parse('MainDeck:\n3 Defy').main).toEqual([{ code: 'OGN-045', count: 3 }])
  })

  it('reads the Battlefields section', () => {
    expect(parse('Battlefields:\n1 Startipped Peak').battlefields).toEqual([
      { code: 'OGN-288', count: 1 },
    ])
  })

  it('reads the Runes section', () => {
    expect(parse('Runes:\n6 Calm Rune').runes).toEqual([{ code: 'OGN-042', count: 6 }])
  })

  it('reads the Sideboard section', () => {
    expect(parse('Sideboard:\n3 Not So Fast').sideboard).toEqual([{ code: 'SFD-045', count: 3 }])
  })
})

describe('cards', () => {
  it('resolves a name to the base printing of the card', () => {
    expect(parse('Runes:\n1 Body Rune').runes).toEqual([{ code: 'OGN-126', count: 1 }])
  })

  it('ignores the case of the name', () => {
    expect(parse('MainDeck:\n1 evelynn, in control').main).toEqual([
      { code: 'RAD-109', count: 1 },
    ])
  })

  it('adds up repeated lines of the same card', () => {
    expect(parse('MainDeck:\n1 Defy\n2 Defy').main).toEqual([{ code: 'OGN-045', count: 3 }])
  })

  it('puts an unknown name in unknown, using the name as code', () => {
    const deck = parse('MainDeck:\n3 Made Up Card')

    expect(deck.main).toEqual([])
    expect(deck.unknown).toEqual([{ code: 'Made Up Card', count: 3 }])
  })
})

describe('text layout', () => {
  it('ignores blank lines', () => {
    expect(parse('MainDeck:\n\n3 Defy\n\n').main).toEqual([{ code: 'OGN-045', count: 3 }])
  })

  it('ignores Windows line endings', () => {
    expect(parse('MainDeck:\r\n3 Defy\r\n').main).toEqual([{ code: 'OGN-045', count: 3 }])
  })

  it('ignores cards that come before any section', () => {
    expect(parse('3 Defy').main).toEqual([])
  })

  it('ignores cards under an unknown section', () => {
    expect(parse('Maybeboard:\n3 Defy').main).toEqual([])
  })

  it('returns an empty deck for empty text', () => {
    expect(parse('')).toEqual({ main: [], sideboard: [], battlefields: [], runes: [], unknown: [] })
  })
})
