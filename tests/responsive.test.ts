import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const MINIMUM_VIEWPORT_WIDTH_PX = 320

function readProjectFile(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8')
}

function fixedPixelWidths(css: string): number[] {
  const declarations = css.matchAll(/(?<![-\w])(?:min-)?width\s*:\s*(\d+(?:\.\d+)?)px/g)
  return Array.from(declarations, (match) => Number(match[1]))
}

describe('responsive layout', () => {
  it('declares a device-width viewport meta tag', () => {
    const html = readProjectFile('index.html')

    expect(html).toMatch(/<meta[^>]+name=["']viewport["'][^>]+content=["'][^"']*width=device-width/)
  })

  it('uses no fixed width wider than the 320px minimum viewport', () => {
    const css = readProjectFile('src/app/app.css')

    const tooWide = fixedPixelWidths(css).filter((width) => width > MINIMUM_VIEWPORT_WIDTH_PX)
    expect(tooWide).toEqual([])
  })

  it('does not vertically centre a scrollable container', () => {
    const css = readProjectFile('src/app/app.css')

    expect(css).not.toMatch(/justify-content\s*:\s*center/)
  })
})
