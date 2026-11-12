import { describe, expect, it } from 'vitest'

const MINIMUM_TEXT_CONTRAST = 4.5
const MINIMUM_BOUNDARY_CONTRAST = 3

// import.meta.glob keeps this file loadable before the modules exist
const themeModules = import.meta.glob('./{tokens,contrast}.ts')

async function loadTheme() {
  const tokens = (await themeModules['./tokens.ts']()) as typeof import('./tokens')
  const { contrastRatio } = (await themeModules['./contrast.ts']()) as typeof import('./contrast')
  return { ...tokens, contrastRatio }
}

// tokens.ts must export `textColorPairs` and `boundaryColorPairs`:
// arrays of { name, foreground, background } using six digit hex colours.
describe('colour tokens', () => {
  it('every text colour meets 4.5:1 contrast against its background', async () => {
    const { textColorPairs, contrastRatio } = await loadTheme()

    expect(textColorPairs.length).toBeGreaterThan(0)
    for (const pair of textColorPairs) {
      expect(contrastRatio(pair.foreground, pair.background), pair.name).toBeGreaterThanOrEqual(MINIMUM_TEXT_CONTRAST)
    }
  })

  it('every border and focus colour meets 3:1 contrast against its background', async () => {
    const { boundaryColorPairs, contrastRatio } = await loadTheme()

    expect(boundaryColorPairs.length).toBeGreaterThan(0)
    for (const pair of boundaryColorPairs) {
      expect(contrastRatio(pair.foreground, pair.background), pair.name).toBeGreaterThanOrEqual(MINIMUM_BOUNDARY_CONTRAST)
    }
  })
})
