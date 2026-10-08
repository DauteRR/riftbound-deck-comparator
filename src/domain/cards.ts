import type { Card } from '@/domain/card'

export type CardCatalog = {
  findByCode: (code: string) => Card | undefined
  cardKey: (code: string) => string
}

export function createCardCatalog(cards: Card[]): CardCatalog {
  const cardsByCode = new Map(cards.map((card) => [card.code, card]))

  function findByCode(code: string) {
    return cardsByCode.get(code)
  }

  function cardKey(code: string) {
    return findByCode(code)?.name ?? code
  }

  return { findByCode, cardKey }
}
