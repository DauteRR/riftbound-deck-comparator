import cardsJson from '@/data/cards.json'
import type { Card } from '@/domain/card'
import type { SectionEntry } from '@/ui/Section'

const cards = cardsJson as Card[]

function entry(code: string, count: number): SectionEntry {
  const card = cards.find((candidate) => candidate.code === code)

  if (!card) {
    throw new Error(`Unknown sample card ${code}`)
  }

  return { card, count }
}

export const sampleSection = {
  title: 'Main deck',
  onlyA: [entry('OGN-001', 2), entry('OGN-002', 1), entry('OGN-003', 3)],
  onlyB: [entry('OGN-006', 1), entry('OGN-010', 2)],
  common: [
    entry('OGN-011', 3),
    entry('OGN-012', 3),
    entry('OGN-013', 2),
    entry('OGN-015', 1),
    entry('OGN-016', 3),
    entry('OGN-018', 2),
    entry('OGN-019', 3),
  ],
}
