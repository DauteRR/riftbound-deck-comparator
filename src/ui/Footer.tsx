import cardsJson from '@/data/cards.json'
import type { Card } from '@/domain/card'
import { findLatestSet } from '@/domain/sets'

const latestSet = findLatestSet(cardsJson as Card[])

export function Footer() {
  return (
    <footer className="mt-16 flex flex-col items-center gap-2 border-t border-gold/80 px-8 py-8 text-center text-gold">
      <p className="max-w-3xl">
        Riftbound Deck Comparator was created under Riot Games' "Legal Jibber Jabber" policy using
        assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
      </p>
      {latestSet && <p>This app supports cards up to set {latestSet}.</p>}
    </footer>
  )
}
