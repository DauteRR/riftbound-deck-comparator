import type { CardCatalog } from '@/domain/cards'
import type { DeckDiff, SectionId } from '@/diff/diffDecks'

export type RemoveChange = { code: string; count: number; section: SectionId }
export type AddChange = { code: string; count: number; section: SectionId }
export type MoveChange = { code: string; count: number; from: SectionId; to: SectionId }

export type ChangeList = {
  remove: RemoveChange[]
  move: MoveChange[]
  add: AddChange[]
}

type Surplus = { code: string; remaining: number; section: SectionId }

const SECTION_ORDER: SectionId[] = [
  'legendAndChosen',
  'main',
  'sideboard',
  'battlefields',
  'runes',
  'unknown',
]

function groupSurplusByCard(
  diff: DeckDiff,
  side: 'onlyLeft' | 'onlyRight',
  catalog: CardCatalog,
): Map<string, Surplus[]> {
  const groups = new Map<string, Surplus[]>()

  for (const section of SECTION_ORDER) {
    for (const entry of diff[section][side]) {
      const key = catalog.cardKey(entry.code)
      const surpluses = groups.get(key) ?? []
      surpluses.push({ code: entry.code, remaining: entry.count, section })
      groups.set(key, surpluses)
    }
  }

  return groups
}

function pairMoves(removals: Surplus[], additions: Surplus[]): MoveChange[] {
  const moves: MoveChange[] = []

  for (const removal of removals) {
    for (const addition of additions) {
      const count = Math.min(removal.remaining, addition.remaining)

      if (count === 0) continue

      moves.push({ code: removal.code, count, from: removal.section, to: addition.section })
      removal.remaining -= count
      addition.remaining -= count
    }
  }

  return moves
}

export function buildChangeList(diff: DeckDiff, catalog: CardCatalog): ChangeList {
  const removalsByCard = groupSurplusByCard(diff, 'onlyLeft', catalog)
  const additionsByCard = groupSurplusByCard(diff, 'onlyRight', catalog)
  const move: MoveChange[] = []

  for (const [key, removals] of removalsByCard) {
    move.push(...pairMoves(removals, additionsByCard.get(key) ?? []))
  }

  const remove = [...removalsByCard.values()]
    .flat()
    .filter((surplus) => surplus.remaining > 0)
    .map(({ code, remaining, section }) => ({ code, count: remaining, section }))
  const add = [...additionsByCard.values()]
    .flat()
    .filter((surplus) => surplus.remaining > 0)
    .map(({ code, remaining, section }) => ({ code, count: remaining, section }))

  return { remove, move, add }
}

export type SectionChanges = {
  section: SectionId
  remove: RemoveChange[]
  move: MoveChange[]
  add: AddChange[]
}

export function groupChangesBySection(changes: ChangeList): SectionChanges[] {
  return SECTION_ORDER.map((section) => ({
    section,
    remove: changes.remove.filter((change) => change.section === section),
    move: changes.move.filter((change) => change.from === section),
    add: changes.add.filter((change) => change.section === section),
  })).filter(({ remove, move, add }) => remove.length + move.length + add.length > 0)
}
