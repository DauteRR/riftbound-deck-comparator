import type { Card } from '@/domain/card'
import { cn } from '@/lib/utils'

export type TileSide = 'left' | 'right'

type CardTileProps = {
  card: Card
  count: number
  side?: TileSide
}

const thumbnailParams = 'w=320&fm=webp&q=70'

function thumbnailUrl(imageUrl: string) {
  const separator = imageUrl.includes('?') ? '&' : '?'
  return `${imageUrl}${separator}${thumbnailParams}`
}

export function CardTile({ card, count, side }: CardTileProps) {
  const isHorizontal = card.type === 'Battlefield'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border-2 border-transparent',
        isHorizontal
          ? 'aspect-[1039/744] w-[calc(var(--card-width)*1.4)]'
          : 'aspect-[744/1039] w-(--card-width)',
        side === 'left' && 'border-side-left',
        side === 'right' && 'border-side-right',
      )}
    >
      <img
        src={thumbnailUrl(card.imageUrl)}
        alt={card.name}
        loading="lazy"
        className="size-full object-cover"
      />

      <span
        className={cn(
          'absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md px-3 py-1.5 text-xl leading-none font-bold',
          side === 'left' && 'bg-side-left text-side-left-deep',
          side === 'right' && 'bg-side-right text-side-right-deep',
          !side && 'bg-side-right-light text-side-right-deep',
        )}
      >
        x{count}
      </span>
    </div>
  )
}
