import { SET_MAP } from '@piltoverarchive/riftbound-deck-codes'

export type ParsedCardCode = {
  set: string
  prefix: string
  number: number
  variant: string
}

export function parseCardCode(code: string): ParsedCardCode {
  const match = code.match(/^([A-Z]+)-(R|SP)?(\d+)([a-z*]?)$/)
  if (!match) throw new Error(`Unexpected card code: ${code}`)

  const [, set, prefix = '', number, variant] = match
  if (!(set in SET_MAP)) throw new Error(`Unknown set "${set}" in ${code}`)

  return { set, prefix, number: Number(number), variant }
}

export function isCardCode(code: string): boolean {
  try {
    parseCardCode(code)
    return true
  } catch {
    return false
  }
}

export function compareCardCodes(first: string, second: string): number {
  const a = parseCardCode(first)
  const b = parseCardCode(second)

  return (
    SET_MAP[a.set] - SET_MAP[b.set] ||
    a.prefix.localeCompare(b.prefix) ||
    a.number - b.number ||
    a.variant.localeCompare(b.variant)
  )
}
