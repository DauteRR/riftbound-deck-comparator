import type { Card } from '@/domain/card'

export type CardCatalog = {
  findByCode: (code: string) => Card | undefined
  findBaseByName: (name: string) => Card | undefined
  cardKey: (code: string) => string
}

export function normalizeCardName(name: string): string {
  return name.trim().toLowerCase()
}

export function createCardCatalog(cards: Card[]): CardCatalog {
  const cardsByCode = new Map(cards.map((card) => [card.code, card]))
  const baseCardsByName = new Map<string, Card>()

  for (const card of cards) {
    const key = normalizeCardName(card.name)
    const current = baseCardsByName.get(key)

    if (!current || (current.isAlternate && !card.isAlternate)) {
      baseCardsByName.set(key, card)
    }
  }

  function findByCode(code: string) {
    return cardsByCode.get(code)
  }

  function findBaseByName(name: string) {
    return baseCardsByName.get(normalizeCardName(name))
  }

  function cardKey(code: string) {
    return findByCode(code)?.name ?? code
  }

  return { findByCode, findBaseByName, cardKey }
}
