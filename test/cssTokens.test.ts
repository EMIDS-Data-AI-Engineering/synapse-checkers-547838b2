import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { colors } from '../src/theme/colors'

const stylesheet = readFileSync(resolve(process.cwd(), 'src/styles/index.css'), 'utf8')

function declaredToken(name: string): string | undefined {
  return stylesheet.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1].toLowerCase()
}

describe('stylesheet colour tokens', () => {
  it.each([
    ['ink', colors.text],
    ['paper', colors.background],
    ['accent', colors.accent],
    ['square-dark', (colors as Record<string, string>).squareDark],
    ['square-light', (colors as Record<string, string>).squareLight],
  ])('keeps --color-%s equal to the contrast-checked token', (name, expected) => {
    expect(expected).toBeDefined()
    expect(declaredToken(name)).toBe(expected)
  })
})
