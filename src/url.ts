import type { CardCatalog } from '@/domain/cards'
import type { Deck } from '@/domain/deck'
import { encodeDeckCode } from '@/parsing/deckCode'
import { parseDeckInput } from '@/parsing/detect'

export function buildSearch(leftDeck: Deck, rightDeck: Deck): string {
  const params = new URLSearchParams({
    left: encodeDeckCode(leftDeck),
    right: encodeDeckCode(rightDeck),
  })

  return `?${params}`
}

export function readDecksFromSearch(
  search: string,
  catalog: CardCatalog,
): { leftDeck: Deck; rightDeck: Deck } | undefined {
  const params = new URLSearchParams(search)
  const leftInput = params.get('left')
  const rightInput = params.get('right')

  if (!leftInput || !rightInput) return undefined

  return {
    leftDeck: parseDeckInput(leftInput, catalog),
    rightDeck: parseDeckInput(rightInput, catalog),
  }
}
