import {
  getCodeFromDeck,
  getDeckFromCode,
  type Card as LibraryCard,
} from '@piltoverarchive/riftbound-deck-codes'
import { isCardCode } from '@/domain/cardCode'
import type { CardCatalog } from '@/domain/cards'
import { createEmptyDeck, type Deck, type DeckEntry } from '@/domain/deck'
import { addAdditionalLegend, placeByCardType } from '@/parsing/placeByCardType'

function toDeckEntry({ cardCode, count }: LibraryCard): DeckEntry {
  return { code: cardCode, count }
}

function toLibraryCard({ code, count }: DeckEntry): LibraryCard {
  return { cardCode: code, count }
}

function toSingleCopy(code: string): DeckEntry {
  return { code, count: 1 }
}

function removeOneCopy(entries: DeckEntry[], code: string): DeckEntry[] {
  return entries.flatMap((entry) => {
    if (entry.code !== code) return [entry]
    if (entry.count === 1) return []

    return [{ code, count: entry.count - 1 }]
  })
}

function addOneCopy(entries: DeckEntry[], code: string): DeckEntry[] {
  if (!entries.some((entry) => entry.code === code)) {
    return [...entries, toSingleCopy(code)]
  }

  return entries.map((entry) =>
    entry.code === code ? { code, count: entry.count + 1 } : entry,
  )
}

export function decodeDeckCode(code: string, catalog: CardCatalog): Deck {
  const decoded = getDeckFromCode(code, { signedSuffix: '*' })
  const deck = createEmptyDeck()

  for (const legendCode of decoded.additionalLegends ?? []) {
    addAdditionalLegend(deck, toSingleCopy(legendCode))
  }

  const mainArray = decoded.mainDeck.map(toDeckEntry)
  const cards = decoded.chosenChampion
    ? removeOneCopy(mainArray, decoded.chosenChampion)
    : mainArray

  for (const entry of cards) {
    placeByCardType(deck, entry, catalog)
  }

  deck.sideboard = decoded.sideboard.map(toDeckEntry)

  if (decoded.chosenChampion) {
    deck.champion = toSingleCopy(decoded.chosenChampion)
  }

  return deck
}

export function encodeDeckCode(deck: Deck): string {
  const main = deck.champion ? addOneCopy(deck.main, deck.champion.code) : deck.main

  const mainDeck = [
    ...(deck.legend ? [deck.legend] : []),
    ...main,
    ...deck.battlefields,
    ...deck.runes,
    ...deck.unknown.filter((entry) => isCardCode(entry.code)),
  ].map(toLibraryCard)

  return getCodeFromDeck(
    mainDeck,
    deck.sideboard.map(toLibraryCard),
    deck.champion?.code,
    deck.additionalLegends?.map((entry) => entry.code),
  )
}
