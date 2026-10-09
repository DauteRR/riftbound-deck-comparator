import type { CardCatalog } from '@/domain/cards'
import type { Deck } from '@/domain/deck'
import { encodeDeckCode } from '@/parsing/deckCode'
import { parseDeckInput } from '@/parsing/detect'

export function buildSearch(deckA: Deck, deckB: Deck): string {
  const params = new URLSearchParams({
    left: encodeDeckCode(deckA),
    right: encodeDeckCode(deckB),
  })

  return `?${params}`
}

export function readDecksFromSearch(
  search: string,
  catalog: CardCatalog,
): { deckA: Deck; deckB: Deck } | undefined {
  const params = new URLSearchParams(search)
  const left = params.get('left')
  const right = params.get('right')

  if (!left || !right) return undefined

  return {
    deckA: parseDeckInput(left, catalog),
    deckB: parseDeckInput(right, catalog),
  }
}
