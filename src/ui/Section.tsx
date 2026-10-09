import type { Card } from '@/domain/card'
import { cn } from '@/lib/utils'
import { CardTile } from '@/ui/CardTile'
import { GapTile } from '@/ui/GapTile'

export type SectionEntry = {
  code: string
  card?: Card
  count: number
}

type SectionProps = {
  title: string
  onlyLeft: SectionEntry[]
  onlyRight: SectionEntry[]
  common: SectionEntry[]
  leftGaps?: number
  rightGaps?: number
  hasHorizontalCards?: boolean
}

export function Section({
  title,
  onlyLeft,
  onlyRight,
  common,
  leftGaps = 0,
  rightGaps = 0,
  hasHorizontalCards = false,
}: SectionProps) {
  const sideWidthClass = hasHorizontalCards
    ? 'max-w-[calc(var(--card-width)*1.4*var(--columns)+var(--card-gap)*(var(--columns)-1))]'
    : 'max-w-[calc(var(--card-width)*var(--columns)+var(--card-gap)*(var(--columns)-1))]'

  return (
    <section className="@container">
      <div className="flex flex-col gap-6 [--card-gap:1.5rem] [--columns:1] [--divider-gap:1rem] @[45rem]:[--columns:2] @[45rem]:[--divider-gap:2rem] @[65rem]:[--columns:3] @[65rem]:[--divider-gap:3rem] @[85rem]:[--columns:4] @[85rem]:[--divider-gap:4rem] [--card-width:clamp(6rem,calc(((100cqw-var(--divider-gap)*2-8px)/2-(var(--columns)-1)*var(--card-gap))/var(--columns)),13rem)]">
        <h2 className="border-b-4 border-gold/80 pb-3 text-center text-3xl font-bold tracking-tight text-gold md:text-left">{title}</h2>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-(--divider-gap)">
          <div className={cn('ml-auto flex w-full flex-wrap content-start justify-end gap-6', sideWidthClass)}>
            {onlyLeft.map((entry) => (
              <CardTile key={entry.code} {...entry} side="left" />
            ))}
            {Array.from({ length: leftGaps }, (_, index) => (
              <GapTile key={`gap-${index}`} side="left" isHorizontal={hasHorizontalCards} />
            ))}
          </div>

          <div className="w-1 rounded-full bg-gold/80" />

          <div className={cn('flex w-full flex-wrap content-start justify-start gap-6', sideWidthClass)}>
            {onlyRight.map((entry) => (
              <CardTile key={entry.code} {...entry} side="right" />
            ))}
            {Array.from({ length: rightGaps }, (_, index) => (
              <GapTile key={`gap-${index}`} side="right" isHorizontal={hasHorizontalCards} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-6">
          {common.map((entry) => (
            <CardTile key={entry.code} {...entry} />
          ))}
        </div>
      </div>
    </section>
  )
}
