import type { CardCatalog } from '@/domain/cards'
import { addEntry, createEmptyDeck, type Deck, type DeckEntry } from '@/domain/deck'

const SECTION_PLACERS: Record<string, (deck: Deck, entry: DeckEntry) => void> = {
  Legend: (deck, entry) => {
    deck.legend = entry
  },
  Champion: (deck, entry) => {
    deck.champion = entry
  },
  MainDeck: (deck, entry) => addEntry(deck.main, entry),
  Battlefields: (deck, entry) => addEntry(deck.battlefields, entry),
  Runes: (deck, entry) => addEntry(deck.runes, entry),
  Sideboard: (deck, entry) => addEntry(deck.sideboard, entry),
}

const ENTRY_LINE = /^(\d+) (.+)$/

export function parseDeckText(text: string, catalog: CardCatalog): Deck {
  const deck = createEmptyDeck()
  let placeEntry: ((deck: Deck, entry: DeckEntry) => void) | undefined

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()

    if (line.endsWith(':')) {
      placeEntry = SECTION_PLACERS[line.slice(0, -1)]
      continue
    }

    const match = line.match(ENTRY_LINE)
    if (!match || !placeEntry) continue

    const count = Number(match[1])
    const name = match[2]
    const card = catalog.findBaseByName(name)

    if (card) {
      placeEntry(deck, { code: card.code, count })
    } else {
      addEntry(deck.unknown, { code: name, count })
    }
  }

  return deck
}
