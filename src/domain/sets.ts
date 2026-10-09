import { SET_MAP } from '@piltoverarchive/riftbound-deck-codes'
import type { Card } from '@/domain/card'
import { parseCardCode } from '@/domain/cardCode'

export function findLatestSet(cards: Card[]): string | undefined {
  let latestSet: string | undefined

  for (const card of cards) {
    const { set } = parseCardCode(card.code)

    if (latestSet === undefined || SET_MAP[set] > SET_MAP[latestSet]) {
      latestSet = set
    }
  }

  return latestSet
}
