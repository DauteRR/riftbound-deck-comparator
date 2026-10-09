import { useMemo, useState } from 'react'
import { catalog } from '@/data/catalog'
import { buildChangeList } from '@/diff/changeList'
import { diffDecks } from '@/diff/diffDecks'
import type { Deck } from '@/domain/deck'
import { parseDeckInput } from '@/parsing/detect'
import { EXAMPLE_LEFT_DECK_CODE, EXAMPLE_RIGHT_DECK_CODE } from '@/exampleDecks'
import { buildSearch, readDecksFromSearch } from '@/url'
import { ChangeList } from '@/ui/ChangeList'
import { DeckInputs } from '@/ui/DeckInputs'
import { Footer } from '@/ui/Footer'
import { ResultActions } from '@/ui/ResultActions'
import { Section } from '@/ui/Section'
import { SECTION_TITLES } from '@/ui/sectionTitles'
import { toSectionProps } from '@/ui/sectionProps'

type ComparedDecks = { leftDeck: Deck; rightDeck: Deck }

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

  function compare(left: string, right: string) {
    try {
      setComparedDecks({
        leftDeck: parseDeckInput(left, catalog),
        rightDeck: parseDeckInput(right, catalog),
      })
      setError(undefined)
    } catch {
      setError('Could not read one of the decks. Check the deck code or the deck list.')
    }
  }

  function loadExample() {
    setLeftText(EXAMPLE_LEFT_DECK_CODE)
    setRightText(EXAMPLE_RIGHT_DECK_CODE)
    compare(EXAMPLE_LEFT_DECK_CODE, EXAMPLE_RIGHT_DECK_CODE)
  }

  function swapDecks() {
    setLeftText(rightText)
    setRightText(leftText)
    setComparedDecks((current) =>
      current && { leftDeck: current.rightDeck, rightDeck: current.leftDeck },
    )
  }

  function buildLink() {
    if (!comparedDecks) return window.location.href

    const { origin, pathname } = window.location

    return `${origin}${pathname}${buildSearch(comparedDecks.leftDeck, comparedDecks.rightDeck)}`
  }

  return (
    <main className="flex min-h-svh flex-col">
      <header className="flex flex-col items-center gap-3 px-6 py-8">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="" className="size-32" />
        <h1 className="text-center text-4xl font-bold tracking-tight text-gold">
          Riftbound Deck Comparator
        </h1>
      </header>

      <div className="mx-auto flex w-full max-w-[120rem] flex-1 flex-col gap-12 px-8 py-4">
        {diff ? (
          <ResultActions
            onEdit={() => setComparedDecks(undefined)}
            onSwap={swapDecks}
            buildLink={buildLink}
          />
        ) : (
          <DeckInputs
            leftText={leftText}
            rightText={rightText}
            error={error}
            onLeftTextChange={setLeftText}
            onRightTextChange={setRightText}
            onCompare={() => compare(leftText, rightText)}
            onLoadExample={loadExample}
          />
        )}

        {diff &&
          SECTION_TITLES.map(([id, title]) => ({ id, ...toSectionProps(title, diff[id], catalog) }))
            .filter(({ onlyLeft, onlyRight, common }) =>
              [onlyLeft, onlyRight, common].some((entries) => entries.length > 0),
            )
            .map(({ id, ...props }) => <Section key={id} {...props} />)}

        {diff && <ChangeList changes={buildChangeList(diff, catalog)} catalog={catalog} />}
      </div>

      <Footer />
    </main>
  )
}

export default App
