import {
  getCodeFromDeck,
  getDeckFromCode,
  type Card as LibraryCard,
} from '@piltoverarchive/riftbound-deck-codes'
import type { CardCatalog } from '@/domain/cards'
import { createEmptyDeck, type Deck, type DeckEntry } from '@/domain/deck'

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
  const additionalLegends = (decoded.additionalLegends ?? []).map(toSingleCopy)

  const mainArray = decoded.mainDeck.map(toDeckEntry)
  const cards = decoded.chosenChampion
    ? removeOneCopy(mainArray, decoded.chosenChampion)
    : mainArray

  for (const entry of cards) {

    switch (catalog.findByCode(entry.code)?.type) {
      case 'Legend':
        if (deck.legend) {
          additionalLegends.push(entry)
        } else {
          deck.legend = entry
        }
        break
      case 'Battlefield':
        deck.battlefields.push(entry)
        break
      case 'Rune':
        deck.runes.push(entry)
        break
      case 'Unit':
      case 'Spell':
      case 'Gear':
        deck.main.push(entry)
        break
      default:
        deck.unknown.push(entry)
    }
  }

  deck.sideboard = decoded.sideboard.map(toDeckEntry)

  if (decoded.chosenChampion) {
    deck.champion = toSingleCopy(decoded.chosenChampion)
  }

  if (additionalLegends.length > 0) {
    deck.additionalLegends = additionalLegends
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
    ...deck.unknown,
  ].map(toLibraryCard)

  return getCodeFromDeck(
    mainDeck,
    deck.sideboard.map(toLibraryCard),
    deck.champion?.code,
    deck.additionalLegends?.map((entry) => entry.code),
  )
}
