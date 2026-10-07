import { mkdir, writeFile } from 'node:fs/promises'

const GALLERY_URL = 'https://playriftbound.com/en-us/card-gallery/'
const RAW_OUTPUT_PATH = 'scripts/.cache/gallery-raw.json'

type GalleryBlade = {
  type: string
  sets?: unknown
  cards?: { items: unknown[] }
}

type NextData = {
  props: { pageProps: { page: { blades: GalleryBlade[] } } }
}

async function fetchGalleryBlade(): Promise<GalleryBlade> {
  const response = await fetch(GALLERY_URL)
  if (!response.ok) throw new Error(`${GALLERY_URL} -> HTTP ${response.status}`)
  const html = await response.text()
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)
  if (!match) throw new Error('__NEXT_DATA__ not found in gallery page')
  const nextData = JSON.parse(match[1]) as NextData
  const blade = nextData.props.pageProps.page.blades.find((candidate) => candidate.type === 'riftboundCardGallery')
  if (!blade?.cards) throw new Error('riftboundCardGallery blade not found')
  return blade
}

const blade = await fetchGalleryBlade()

await mkdir('scripts/.cache', { recursive: true })
await writeFile(
  RAW_OUTPUT_PATH,
  JSON.stringify({ fetchedAt: new Date().toISOString(), sets: blade.sets, cards: blade.cards?.items }, null, 2) + '\n',
)
console.log(`Downloaded ${blade.cards?.items.length} cards to ${RAW_OUTPUT_PATH}`)
