export type CardType = 'Legend' | 'Unit' | 'Spell' | 'Gear' | 'Rune' | 'Battlefield'

export type CardCost = {
  energy: number
  power: number
}

export type Card = {
  code: string
  name: string
  type: CardType
  cost?: CardCost
  isAlternate: boolean
  imageUrl: string
}
