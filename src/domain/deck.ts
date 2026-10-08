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

export function addEntry(entries: DeckEntry[], entry: DeckEntry) {
  const existing = entries.find((candidate) => candidate.code === entry.code)

  if (existing) {
    existing.count += entry.count
  } else {
    entries.push({ ...entry })
  }
}
