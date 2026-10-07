import { mkdir, writeFile } from 'node:fs/promises'

const GALLERY_URL = 'https://playriftbound.com/en-us/card-gallery/'
const RAW_OUTPUT_DIRECTORY = 'scripts/.cache'
const RAW_OUTPUT_PATH = `${RAW_OUTPUT_DIRECTORY}/gallery-raw.json`

export type GalleryCard = {
  id: string
  name: string
  subtitle?: string
  publicCode: string
  set: { value: { id: string } }
  cardType: { type: Array<{ label: string }> }
  energy?: { value: { id: number } }
  power?: { value: { id: number } }
  tags?: { tags: string[] }
  cardImage: { url: string }
}

type GalleryBlade = {
  type: string
  sets?: unknown
  cards?: { items: GalleryCard[] }
}

type NextData = {
  props: { pageProps: { page: { blades: GalleryBlade[] } } }
}

type Gallery = {
  sets: unknown
  cards: GalleryCard[]
}

async function saveRawGallery(gallery: Gallery) {
  await mkdir(RAW_OUTPUT_DIRECTORY, { recursive: true })

  const rawGallery = { fetchedAt: new Date().toISOString(), ...gallery }
  await writeFile(RAW_OUTPUT_PATH, JSON.stringify(rawGallery, null, 2) + '\n')

  console.log(`Downloaded ${gallery.cards.length} cards to ${RAW_OUTPUT_PATH}`)
}

export async function fetchGallery(): Promise<Gallery> {
  const response = await fetch(GALLERY_URL)
  if (!response.ok) throw new Error(`${GALLERY_URL} -> HTTP ${response.status}`)

  const html = await response.text()
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)
  if (!match) throw new Error('__NEXT_DATA__ not found in gallery page')

  const nextData = JSON.parse(match[1]) as NextData
  const blade = nextData.props.pageProps.page.blades.find((candidate) => candidate.type === 'riftboundCardGallery')
  if (!blade?.cards) throw new Error('riftboundCardGallery blade not found')

  const gallery = { sets: blade.sets, cards: blade.cards.items }
  await saveRawGallery(gallery)

  return gallery
}
