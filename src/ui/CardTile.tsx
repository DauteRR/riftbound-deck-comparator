import type { Card } from '@/domain/card'
import { cn } from '@/lib/utils'

export type TileSide = 'a' | 'b'

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
        side === 'a' && 'border-side-a',
        side === 'b' && 'border-side-b',
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
          side === 'a' && 'bg-side-a text-side-a-deep',
          side === 'b' && 'bg-side-b text-side-b-deep',
          !side && 'bg-side-b-light text-side-b-deep',
        )}
      >
        x{count}
      </span>
    </div>
  )
}
