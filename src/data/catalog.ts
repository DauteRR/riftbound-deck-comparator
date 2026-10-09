import type { Card } from '@/domain/card'
import { createCardCatalog } from '@/domain/cards'
import cardsJson from '@/data/cards.json'

export const catalog = createCardCatalog(cardsJson as Card[])
