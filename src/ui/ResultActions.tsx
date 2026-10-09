import { useEffect, useState } from 'react'
import { ArrowLeftRight, Copy, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ResultActionsProps = {
  onEdit: () => void
  onSwap: () => void
  buildLink: () => string
}

const FEEDBACK_DURATION_MS = 2000

export function ResultActions({ onEdit, onSwap, buildLink }: ResultActionsProps) {
  const [copyFeedback, setCopyFeedback] = useState<string>()

  useEffect(() => {
    if (!copyFeedback) return

    const timeout = setTimeout(() => setCopyFeedback(undefined), FEEDBACK_DURATION_MS)

    return () => clearTimeout(timeout)
  }, [copyFeedback])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(buildLink())
      setCopyFeedback('Link copied')
    } catch {
      setCopyFeedback('Could not copy the link')
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Button variant="outline" size="lg" onClick={onEdit}>
        <Pencil />
        Edit decks
      </Button>
      <Button variant="outline" size="lg" onClick={onSwap}>
        <ArrowLeftRight />
        Swap left ↔ right
      </Button>
      <Button variant="outline" size="lg" onClick={copyLink}>
        <Copy />
        {copyFeedback ?? 'Copy link'}
      </Button>
    </div>
  )
}
