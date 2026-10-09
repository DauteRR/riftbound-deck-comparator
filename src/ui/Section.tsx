import type { Card } from '@/domain/card'
import { CardTile } from '@/ui/CardTile'

export type SectionEntry = {
  card: Card
  count: number
}

type SectionProps = {
  title: string
  onlyLeft: SectionEntry[]
  onlyRight: SectionEntry[]
  common: SectionEntry[]
}

export function Section({ title, onlyLeft, onlyRight, common }: SectionProps) {
  return (
    <section className="flex flex-col gap-6 [--card-width:clamp(8rem,10vw,15rem)]">
      <h2 className="border-b-4 border-gold/80 pb-3 text-3xl text-gold font-bold tracking-tight">{title}</h2>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-6">
        <div className="flex flex-wrap content-start justify-end gap-4">
          {onlyLeft.map(({ card, count }) => (
            <CardTile key={card.code} card={card} count={count} side="left" />
          ))}
        </div>

        <div className="w-0.5 rounded-full bg-gold/80" />

        <div className="flex flex-wrap content-start justify-start gap-4">
          {onlyRight.map(({ card, count }) => (
            <CardTile key={card.code} card={card} count={count} side="right" />
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {common.map(({ card, count }) => (
          <CardTile key={card.code} card={card} count={count} />
        ))}
      </div>
    </section>
  )
}
