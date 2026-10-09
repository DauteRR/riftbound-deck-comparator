import type { CardCatalog } from '@/domain/cards'
import type { Deck } from '@/domain/deck'
import { decodeDeckCode } from '@/parsing/deckCode'
import { parseDeckText } from '@/parsing/textParser'

const DECK_CODE = /^[A-Z2-7]+$/

export function parseDeckInput(input: string, catalog: CardCatalog): Deck {
  const trimmed = input.trim()

  return DECK_CODE.test(trimmed)
    ? decodeDeckCode(trimmed, catalog)
    : parseDeckText(trimmed, catalog)
}
