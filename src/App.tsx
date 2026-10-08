import { Section } from '@/ui/Section'
import { sampleSection } from '@/ui/sampleSection'

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
        <Section {...sampleSection} />
      </div>
    </main>
  )
}

export default App
