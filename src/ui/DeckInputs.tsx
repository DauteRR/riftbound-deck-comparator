import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type DeckInputsProps = {
  leftText: string
  rightText: string
  error?: string
  onLeftTextChange: (text: string) => void
  onRightTextChange: (text: string) => void
  onCompare: () => void
  onLoadExample: () => void
}

const PLACEHOLDER = 'Paste a deck code or a deck list'

export function DeckInputs({
  leftText,
  rightText,
  error,
  onLeftTextChange,
  onRightTextChange,
  onCompare,
  onLoadExample,
}: DeckInputsProps) {
  const canCompare = leftText.trim() !== '' && rightText.trim() !== ''

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-xl font-bold text-side-left">Left deck</span>
          <Textarea
            value={leftText}
            onChange={(event) => onLeftTextChange(event.target.value)}
            placeholder={PLACEHOLDER}
            className="min-h-48 border-side-left-muted"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-xl font-bold text-side-right">Right deck</span>
          <Textarea
            value={rightText}
            onChange={(event) => onRightTextChange(event.target.value)}
            placeholder={PLACEHOLDER}
            className="min-h-48 border-side-right-muted"
          />
        </label>
      </div>

      {error && <p className="text-destructive">{error}</p>}

      <div className="flex flex-wrap justify-center gap-4">
        <Button size="lg" disabled={!canCompare} onClick={onCompare}>
          Compare decks
        </Button>
        <Button variant="outline" size="lg" onClick={onLoadExample}>
          Load example
        </Button>
      </div>
    </div>
  )
}
