export type DeckEntry = {
  code: string
  count: number
}

export type Deck = {
  legend?: DeckEntry
  additionalLegends?: DeckEntry[]
  champion?: DeckEntry
  main: DeckEntry[]
  sideboard: DeckEntry[]
  battlefields: DeckEntry[]
  runes: DeckEntry[]
  unknown: DeckEntry[]
}

export function createEmptyDeck(): Deck {
  return {
    main: [],
    sideboard: [],
    battlefields: [],
    runes: [],
    unknown: [],
  }
}
