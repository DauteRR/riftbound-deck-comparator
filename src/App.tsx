import { catalog } from '@/data/catalog'
import { diffDecks, type SectionId } from '@/diff/diffDecks'
import { decodeDeckCode } from '@/parsing/deckCode'
import { VEX_DECK_CODE } from '@/parsing/testDecks'
import { Section } from '@/ui/Section'
import { toSectionProps } from '@/ui/sectionProps'

const OTHER_VEX_DECK_CODE =
  'CMAAAAAAAAAQCAAAUYAQAAIBAAACUAAEAIAAALJ2AEBQBEIBAECAAJACAUACWYYEAMAAATNMAHDQCAIDACCQCAIEAA2QEBIAFRZAGBQAAAVTTLIBSYBJOAVAAIAQGABZAUCAAKUDAGIQDFQBYEAQCAIFAASQEAIAACUQCAIFAAUAEAIDAAWQEBAAQAAY6AIBAQAJMAI'

const SECTION_TITLES: [SectionId, string][] = [
  ['legendAndChosen', 'Legend & Chosen'],
  ['main', 'Main deck'],
  ['sideboard', 'Sideboard'],
  ['battlefields', 'Battlefields'],
  ['runes', 'Runes'],
]

const diff = diffDecks(
  decodeDeckCode(VEX_DECK_CODE, catalog),
  decodeDeckCode(OTHER_VEX_DECK_CODE, catalog),
  catalog,
)

function App() {
  return (
    <main className="min-h-svh">
      <header className="flex flex-col items-center gap-3 px-6 py-8">
        <img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt=""
          className="size-32"
        />
        <h1 className="text-4xl font-bold tracking-tight text-gold">Riftbound Deck Comparator</h1>
      </header>

      <div className="mx-auto max-w-[120rem] px-8 py-4">
        <div className="flex flex-col gap-12">
          {SECTION_TITLES.map(([id, title]) => ({ id, ...toSectionProps(title, diff[id], catalog) }))
            .filter(({ onlyLeft, onlyRight, common }) =>
              [onlyLeft, onlyRight, common].some((entries) => entries.length > 0),
            )
            .map(({ id, ...props }) => (
              <Section key={id} {...props} />
            ))}
        </div>
      </div>
    </main>
  )
}

export default App
