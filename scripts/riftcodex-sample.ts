import { mkdir, writeFile } from 'node:fs/promises'

const API = 'https://api.riftcodex.com'
const PAGE_SIZE = 100
const PER_GROUP = 2

type RawCard = {
  id: string
  riftbound_id: string
  classification: { type: string; supertype: string | null }
  set: { set_id: string }
  metadata: { alternate_art: boolean; overnumbered: boolean; signature: boolean }
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API}${path}`)
  if (!response.ok) throw new Error(`${path} -> HTTP ${response.status}`)
  return (await response.json()) as T
}

async function fetchAllCards(): Promise<RawCard[]> {
  const first = await getJson<{ items: RawCard[]; pages: number }>(`/cards?size=${PAGE_SIZE}&page=1`)
  const cards = [...first.items]
  for (let page = 2; page <= first.pages; page++) {
    const next = await getJson<{ items: RawCard[] }>(`/cards?size=${PAGE_SIZE}&page=${page}`)
    cards.push(...next.items)
  }
  return cards
}

function pickSample(cards: RawCard[]): RawCard[] {
  const groups: Array<[string, (card: RawCard) => boolean]> = [
    ...['Legend', 'Unit', 'Spell', 'Gear', 'Rune', 'Battlefield'].map(
      (type): [string, (card: RawCard) => boolean] => [`type ${type}`, (c) => c.classification.type === type],
    ),
    ...['Champion', 'Signature', 'Token', 'Basic'].map(
      (supertype): [string, (card: RawCard) => boolean] => [
        `supertype ${supertype}`,
        (c) => c.classification.supertype === supertype,
      ],
    ),
    ['alternate_art', (c) => c.metadata.alternate_art],
    ['overnumbered', (c) => c.metadata.overnumbered],
    ['signature', (c) => c.metadata.signature],
    ['promo set', (c) => ['PR', 'OPP', 'JDG'].includes(c.set.set_id)],
  ]
  const picked = new Map<string, RawCard>()
  for (const [, matches] of groups) {
    for (const card of cards.filter(matches).slice(0, PER_GROUP)) picked.set(card.id, card)
  }
  return [...picked.values()]
}

const [cards, sets, cardTypes] = await Promise.all([
  fetchAllCards(),
  getJson<unknown>('/sets'),
  getJson<unknown>('/index/card-types'),
])

const sample = pickSample(cards)
await mkdir('scripts/samples', { recursive: true })
await writeFile(
  'scripts/samples/riftcodex-sample.json',
  JSON.stringify({ fetchedAt: new Date().toISOString(), totalCards: cards.length, sets, cardTypes, cards: sample }, null, 2) +
    '\n',
)
console.log(`Fetched ${cards.length} cards, wrote ${sample.length} sample cards`)
