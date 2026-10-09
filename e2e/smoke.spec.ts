import { expect, test, type Page } from '@playwright/test'
import { EXAMPLE_LEFT_DECK_CODE, EXAMPLE_RIGHT_DECK_CODE } from '../src/exampleDecks'

const TRANSPARENT_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

const EXPECTED_SECTIONS = ['Legend & Chosen', 'Main deck', 'Sideboard', 'Battlefields', 'Runes']

function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = []

  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  return errors
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', (route) =>
    route.request().resourceType() === 'image'
      ? route.fulfill({ contentType: 'image/png', body: TRANSPARENT_PIXEL })
      : route.continue(),
  )
})

test('loading the example shows every section and the change list', async ({ page }) => {
  const errors = collectConsoleErrors(page)

  await page.goto('/')
  await page.getByRole('button', { name: 'Load example' }).click()

  for (const title of EXPECTED_SECTIONS) {
    await expect(page.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible()
  }
  await expect(page.getByText('make the following changes')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Edit decks' })).toBeVisible()
  expect(errors).toEqual([])
})

test('opening a shared link shows the comparison directly', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  const params = new URLSearchParams({
    left: EXAMPLE_LEFT_DECK_CODE,
    right: EXAMPLE_RIGHT_DECK_CODE,
  })

  await page.goto(`/?${params}`)

  for (const title of EXPECTED_SECTIONS) {
    await expect(page.getByRole('heading', { level: 2, name: title, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('button', { name: 'Compare decks' })).toHaveCount(0)
  expect(errors).toEqual([])
})
