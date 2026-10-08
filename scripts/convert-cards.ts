import type { Card, CardType } from '../src/domain/card.ts'
import { compareCardCodes, parseCardCode } from '../src/domain/cardCode.ts'
import type { Gallery, GalleryCard } from './fetch-gallery.ts'

const CARD_TYPES: CardType[] = ['Legend', 'Unit', 'Spell', 'Gear', 'Rune', 'Battlefield']

export type DiscardReason = 'withoutType' | 'token' | 'duplicate'

export type DiscardedCard = {
  code: string
  name: string
  imageUrl: string
  reason: DiscardReason
}

export type ConversionResult = {
  cards: Card[]
  discardedCards: DiscardedCard[]
}

type ConvertedCard = Omit<Card, 'isAlternate'>

const toCode = (galleryCard: GalleryCard) => galleryCard.publicCode.split('/')[0]

function toCardType(galleryCard: GalleryCard): CardType | undefined {
  const label = galleryCard.cardType.type[0]?.label
  if (label === undefined) return undefined

  const cardType = CARD_TYPES.find((type) => type === label)
  if (!cardType) throw new Error(`Unknown card type "${label}" in ${galleryCard.id}`)

  return cardType
}

function isToken(galleryCard: GalleryCard, type: CardType): boolean {
  const hasTokenId = /^[a-z]+-t\d+/.test(galleryCard.id)
  const isUnitOrGearWithoutEnergy = (type === 'Unit' || type === 'Gear') && !galleryCard.energy

  return hasTokenId || isUnitOrGearWithoutEnergy
}

function toDiscardedCard(galleryCard: GalleryCard, reason: DiscardReason): DiscardedCard {
  return {
    code: toCode(galleryCard),
    name: galleryCard.name,
    imageUrl: galleryCard.cardImage.url,
    reason,
  }
}

function buildName(galleryCard: GalleryCard, type: CardType): string {
  if (type === 'Legend') {
    const champion = galleryCard.tags?.tags.at(-1)
    return champion ? `${champion}, ${galleryCard.name}` : galleryCard.name
  }

  if (type === 'Unit' && galleryCard.subtitle) return `${galleryCard.name}, ${galleryCard.subtitle}`

  return galleryCard.name
}

function buildVariantFlags(code: string, collectorNumberMax: Map<string, number>) {
  const { set, prefix, number, variant } = parseCardCode(code)

  return {
    isOvernumbered: prefix === '' && number > (collectorNumberMax.get(set) ?? 0),
    isSigned: variant === '*',
    isSpecial: prefix === 'SP',
  }
}

function buildCost(galleryCard: GalleryCard): Card['cost'] {
  if (!galleryCard.energy) return undefined

  return { energy: galleryCard.energy.value.id, power: galleryCard.power?.value.id ?? 0 }
}

function groupByName(cards: ConvertedCard[]): Map<string, ConvertedCard[]> {
  const cardsByName = new Map<string, ConvertedCard[]>()

  for (const card of cards) {
    const printings = cardsByName.get(card.name) ?? []
    printings.push(card)
    cardsByName.set(card.name, printings)
  }

  return cardsByName
}

function findBaseCodes(cards: ConvertedCard[]): Set<string> {
  const baseCodes = new Set<string>()

  for (const printings of groupByName(cards).values()) {
    const sortedPrintings = printings.sort((a, b) => compareCardCodes(a.code, b.code))
    const baseCandidates = sortedPrintings.filter(
      (card) => parseCardCode(card.code).variant === '' && !card.isOvernumbered && !card.isSpecial,
    )

    baseCodes.add((baseCandidates[0] ?? sortedPrintings[0]).code)
  }

  return baseCodes
}

export function convertGalleryCards(gallery: Gallery): ConversionResult {
  const collectorNumberMax = new Map(gallery.sets.map((set) => [set.id, set.collectorNumberMax]))
  const seenIds = new Set<string>()
  const discardedCards: DiscardedCard[] = []
  const convertedCards: ConvertedCard[] = []

  for (const galleryCard of gallery.cards) {
    const type = toCardType(galleryCard)

    if (!type) {
      discardedCards.push(toDiscardedCard(galleryCard, 'withoutType'))
      continue
    }

    if (isToken(galleryCard, type)) {
      discardedCards.push(toDiscardedCard(galleryCard, 'token'))
      continue
    }

    if (seenIds.has(galleryCard.id)) {
      discardedCards.push(toDiscardedCard(galleryCard, 'duplicate'))
      continue
    }
    seenIds.add(galleryCard.id)

    const code = toCode(galleryCard)

    convertedCards.push({
      code,
      name: buildName(galleryCard, type),
      type,
      cost: buildCost(galleryCard),
      imageUrl: galleryCard.cardImage.url,
      ...buildVariantFlags(code, collectorNumberMax),
    })
  }

  const baseCodes = findBaseCodes(convertedCards)

  const cards = convertedCards
    .map((card) => ({ ...card, isAlternate: !baseCodes.has(card.code) }))
    .sort((a, b) => compareCardCodes(a.code, b.code))

  return { cards, discardedCards }
}
