import { mkdir, writeFile } from 'node:fs/promises'
import { convertGalleryCards, type DiscardReason } from './convert-cards.ts'
import { fetchGallery } from './fetch-gallery.ts'

const OUTPUT_DIRECTORY = 'src/data'
const OUTPUT_PATH = `${OUTPUT_DIRECTORY}/cards.json`

const gallery = await fetchGallery()
const { cards, discardedCards } = convertGalleryCards(gallery)

await mkdir(OUTPUT_DIRECTORY, { recursive: true })
await writeFile(OUTPUT_PATH, `[\n${cards.map((card) => JSON.stringify(card)).join(',\n')}\n]\n`)

const countDiscarded = (reason: DiscardReason) => discardedCards.filter((card) => card.reason === reason).length

console.log(
  `Dropped: ${countDiscarded('withoutType')} without type, ${countDiscarded('token')} tokens, ${countDiscarded('duplicate')} duplicated ids`,
)
console.log(`Wrote ${cards.length} cards to ${OUTPUT_PATH}`)
