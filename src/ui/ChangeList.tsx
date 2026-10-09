import { groupChangesBySection, type ChangeList as ChangeListData } from '@/diff/changeList'
import type { CardCatalog } from '@/domain/cards'
import { SECTION_TITLE_BY_ID } from '@/ui/sectionTitles'

type ChangeListProps = {
  changes: ChangeListData
  catalog: CardCatalog
}

export function ChangeList({ changes, catalog }: ChangeListProps) {
  const nameOf = (code: string) => catalog.findByCode(code)?.name ?? code
  const sectionChanges = groupChangesBySection(changes)

  return (
    <section className="flex flex-col gap-6">
      <div className="border-b-4 border-gold/80" />

      {sectionChanges.length === 0 ? (
        <p className="text-center text-xl">The decks are identical.</p>
      ) : (
        <>
          <p className="text-center text-xl">
            To get the right deck starting from the left deck, make the following changes:
          </p>

          <div className="flex flex-wrap justify-center gap-x-16 gap-y-8">
            {sectionChanges.map(({ section, remove, move, add }) => (
              <div key={section} className="flex w-80 max-w-full flex-col gap-3 text-center">
                <h3 className="text-2xl font-bold text-gold">{SECTION_TITLE_BY_ID[section]}</h3>

                <ul className="flex flex-col gap-2 text-lg">
                  {remove.map(({ code, count }) => (
                    <li key={`remove-${code}`}>
                      <span className="font-bold text-side-left">Remove</span>{' '}
                      <strong>{count}x</strong> {nameOf(code)}
                    </li>
                  ))}
                  {move.map(({ code, count, to }) => (
                    <li key={`move-${code}-${to}`}>
                      <span className="font-bold text-gold">Move</span> <strong>{count}x</strong>{' '}
                      {nameOf(code)} to {SECTION_TITLE_BY_ID[to]}
                    </li>
                  ))}
                  {add.map(({ code, count }) => (
                    <li key={`add-${code}`}>
                      <span className="font-bold text-side-right">Add</span>{' '}
                      <strong>{count}x</strong> {nameOf(code)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
