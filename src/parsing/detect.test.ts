import { describe, expect, it } from 'vitest'
import cardsJson from '@/data/cards.json'
import type { Card } from '@/domain/card'
import { createCardCatalog } from '@/domain/cards'
import { decodeDeckCode } from '@/parsing/deckCode'
import { parseDeckInput } from '@/parsing/detect'
import { VEX_DECK_CODE, VEX_DECK_TEXT } from '@/parsing/testDecks'
import { parseDeckText } from '@/parsing/textParser'

const catalog = createCardCatalog(cardsJson as Card[])

describe('parseDeckInput', () => {
  it('reads a deck code', () => {
    expect(parseDeckInput(VEX_DECK_CODE, catalog)).toEqual(
      decodeDeckCode(VEX_DECK_CODE, catalog),
    )
  })

  it('reads a deck code surrounded by whitespace', () => {
    expect(parseDeckInput(`  \n${VEX_DECK_CODE}\n `, catalog)).toEqual(
      decodeDeckCode(VEX_DECK_CODE, catalog),
    )
  })

  it('reads a deck in text format', () => {
    expect(parseDeckInput(VEX_DECK_TEXT, catalog)).toEqual(
      parseDeckText(VEX_DECK_TEXT, catalog),
    )
  })

  it('reads a text with a single section header as text', () => {
    expect(parseDeckInput('Legend:', catalog).legend).toBeUndefined()
  })

  it('reads a single word that is not a deck code as text', () => {
    expect(parseDeckInput('Defy', catalog).unknown).toEqual([])
  })

  it('reads empty input as an empty deck', () => {
    expect(parseDeckInput('', catalog)).toEqual(parseDeckText('', catalog))
  })
})
