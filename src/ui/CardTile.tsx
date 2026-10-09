import { useState } from 'react'
import type { Card } from '@/domain/card'
import { cn } from '@/lib/utils'
import { thumbnailUrl } from '@/ui/cardImage'
import { tileSizeClass } from '@/ui/tileSize'

export type TileSide = 'left' | 'right'

type CardTileProps = {
  code: string
  card?: Card
  count: number
  side?: TileSide
  showBadge?: boolean
}

const BADGE_PREFIX = { left: '−', right: '+' } as const

export function CardTile({ code, card, count, side, showBadge = true }: CardTileProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = card !== undefined && !imageFailed

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border-2 border-transparent',
        tileSizeClass(card?.type === 'Battlefield'),
        !showImage && 'flex items-center justify-center bg-muted p-3 text-center',
      )}
    >
      {showImage ? (
        <img
          src={thumbnailUrl(card.imageUrl)}
          alt={card.name}
          loading="lazy"
          onError={() => setImageFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="text-lg font-bold break-all text-foreground">{card?.name ?? code}</span>
      )}

      {showBadge && (
        <span
          className={cn(
            'absolute bottom-2 left-1/2 -translate-x-1/2 rounded-md px-3 py-1.5 text-xl leading-none font-bold',
            side === 'left' && 'bg-side-left text-side-left-deep',
            side === 'right' && 'bg-side-right text-side-right-deep',
            !side && 'bg-side-right-light text-side-right-deep',
          )}
        >
          {side ? `${BADGE_PREFIX[side]}${count}` : `x${count}`}
        </span>
      )}
    </div>
  )
}
