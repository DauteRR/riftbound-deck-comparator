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
    ? 'max-w-[calc(var(--card-width)*1.4*4+var(--card-gap)*3)]'
    : 'max-w-[calc(var(--card-width)*4+var(--card-gap)*3)]'

  return (
    <section className="@container">
      <div className="flex flex-col gap-6 [--card-gap:1.5rem] [--card-width:clamp(6rem,calc((100cqw-8rem-8px)/8-var(--card-gap)*3/4),14rem)]">
        <h2 className="border-b-4 border-gold/80 pb-3 text-3xl text-gold font-bold tracking-tight">{title}</h2>

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-16">
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
