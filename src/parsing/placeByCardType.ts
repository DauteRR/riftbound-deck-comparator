import type { CardCatalog } from '@/domain/cards'
import { addEntry, type Deck, type DeckEntry } from '@/domain/deck'

export function addAdditionalLegend(deck: Deck, entry: DeckEntry) {
  deck.additionalLegends ??= []
  addEntry(deck.additionalLegends, entry)
}

export function placeByCardType(deck: Deck, entry: DeckEntry, catalog: CardCatalog) {
  switch (catalog.findByCode(entry.code)?.type) {
    case 'Legend':
      if (deck.legend) {
        addAdditionalLegend(deck, entry)
      } else {
        deck.legend = { ...entry }
      }
      break
    case 'Battlefield':
      addEntry(deck.battlefields, entry)
      break
    case 'Rune':
      addEntry(deck.runes, entry)
      break
    case 'Unit':
    case 'Spell':
    case 'Gear':
      addEntry(deck.main, entry)
      break
    default:
      addEntry(deck.unknown, entry)
  }
}
