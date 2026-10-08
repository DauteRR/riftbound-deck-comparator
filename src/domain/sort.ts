import type { Card, CardType } from '@/domain/card'
import { compareCardCodes } from '@/domain/cardCode'

const CARD_TYPE_ORDER: CardType[] = ['Legend', 'Unit', 'Spell', 'Gear', 'Rune', 'Battlefield']

function compareCosts(first: Card, second: Card): number {
  if (!first.cost || !second.cost) return 0

  return first.cost.energy - second.cost.energy || first.cost.power - second.cost.power
}

export function compareCards(first: Card, second: Card): number {
  return (
    CARD_TYPE_ORDER.indexOf(first.type) - CARD_TYPE_ORDER.indexOf(second.type) ||
    compareCosts(first, second) ||
    compareCardCodes(first.code, second.code)
  )
}

export function sortCards(cards: Card[]): Card[] {
  return [...cards].sort(compareCards)
}
