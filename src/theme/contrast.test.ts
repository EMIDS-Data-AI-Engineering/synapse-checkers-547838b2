import { describe, expect, it } from 'vitest'

const AA_NORMAL_TEXT = 4.5
const AA_UI_BOUNDARY = 3

async function loadTheme() {
  const contrastLoaders = import.meta.glob('./contrast.ts')
  const colorLoaders = import.meta.glob('./colors.ts')
  const { contrastRatio } = (await contrastLoaders['./contrast.ts']()) as typeof import('./contrast')
  const { colors } = (await colorLoaders['./colors.ts']()) as typeof import('./colors')
  return { contrastRatio, colors }
}

describe('contrast', () => {
  it('gives black on white a ratio of 21', async () => {
    const { contrastRatio } = await loadTheme()
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('gives identical colours a ratio of 1', async () => {
    const { contrastRatio } = await loadTheme()
    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5)
  })

  it('meets WCAG AA for the shell text and background tokens', async () => {
    const { contrastRatio, colors } = await loadTheme()
    expect(contrastRatio(colors.text, colors.background)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT)
  })

  it('meets the UI boundary ratio for the accent against the background', async () => {
    const { contrastRatio, colors } = await loadTheme()
    expect(contrastRatio(colors.accent, colors.background)).toBeGreaterThanOrEqual(AA_UI_BOUNDARY)
  })

  it('distinguishes dark squares from light squares at the UI boundary ratio', async () => {
    const { contrastRatio, colors } = await loadTheme()
    const { squareDark, squareLight } = colors as unknown as Record<string, string | undefined>

    expect(squareDark).toBeDefined()
    expect(squareLight).toBeDefined()
    expect(contrastRatio(squareDark!, squareLight!)).toBeGreaterThanOrEqual(AA_UI_BOUNDARY)
  })
})
