import { cn } from '@/lib/utils'
import type { TileSide } from '@/ui/CardTile'
import { tileSizeClass } from '@/ui/tileSize'

type GapTileProps = {
  side: TileSide
  isHorizontal: boolean
}

export function GapTile({ side, isHorizontal }: GapTileProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg border-2 border-dashed p-3 text-center text-lg font-bold',
        tileSizeClass(isHorizontal),
        side === 'left' && 'border-side-left text-side-left',
        side === 'right' && 'border-side-right text-side-right',
      )}
    >
      Missing card
    </div>
  )
}
