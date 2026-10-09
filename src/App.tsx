import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { catalog } from '@/data/catalog'
import { diffDecks, type SectionId } from '@/diff/diffDecks'
import type { Deck } from '@/domain/deck'
import { parseDeckInput } from '@/parsing/detect'
import { readDecksFromSearch } from '@/url'
import { DeckInputs } from '@/ui/DeckInputs'
import { Section } from '@/ui/Section'
import { toSectionProps } from '@/ui/sectionProps'

type ComparedDecks = { leftDeck: Deck; rightDeck: Deck }

const SECTION_TITLES: [SectionId, string][] = [
  ['legendAndChosen', 'Legend & Chosen'],
  ['main', 'Main deck'],
  ['sideboard', 'Sideboard'],
  ['battlefields', 'Battlefields'],
  ['runes', 'Runes'],
  ['unknown', 'Unknown cards'],
]

function readInitialDecks(): ComparedDecks | undefined {
  try {
    return readDecksFromSearch(window.location.search, catalog)
  } catch {
    return undefined
  }
}

function readInitialTexts() {
  const params = new URLSearchParams(window.location.search)

  return { left: params.get('left') ?? '', right: params.get('right') ?? '' }
}

function App() {
  const [comparedDecks, setComparedDecks] = useState(readInitialDecks)
  const [initialTexts] = useState(readInitialTexts)
  const [leftText, setLeftText] = useState(initialTexts.left)
  const [rightText, setRightText] = useState(initialTexts.right)
  const [error, setError] = useState<string>()

  const diff = useMemo(
    () => comparedDecks && diffDecks(comparedDecks.leftDeck, comparedDecks.rightDeck, catalog),
    [comparedDecks],
  )

  function compare() {
    try {
      setComparedDecks({
        leftDeck: parseDeckInput(leftText, catalog),
        rightDeck: parseDeckInput(rightText, catalog),
      })
      setError(undefined)
    } catch {
      setError('Could not read one of the decks. Check the deck code or the deck list.')
    }
  }

  return (
    <main className="min-h-svh">
      <header className="flex flex-col items-center gap-3 px-6 py-8">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-32" />
        <h1 className="text-center text-4xl font-bold tracking-tight text-gold">
          Riftbound Deck Comparator
        </h1>
      </header>

      <div className="mx-auto flex max-w-[120rem] flex-col gap-12 px-8 py-4">
        {diff ? (
          <div className="flex justify-center">
            <Button variant="outline" size="lg" onClick={() => setComparedDecks(undefined)}>
              Edit decks
            </Button>
          </div>
        ) : (
          <DeckInputs
            leftText={leftText}
            rightText={rightText}
            error={error}
            onLeftTextChange={setLeftText}
            onRightTextChange={setRightText}
            onCompare={compare}
          />
        )}

        {diff &&
          SECTION_TITLES.map(([id, title]) => ({ id, ...toSectionProps(title, diff[id], catalog) }))
            .filter(({ onlyLeft, onlyRight, common }) =>
              [onlyLeft, onlyRight, common].some((entries) => entries.length > 0),
            )
            .map(({ id, ...props }) => <Section key={id} {...props} />)}
      </div>
    </main>
  )
}

export default App
