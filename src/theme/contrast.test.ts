import { describe, expect, it } from 'vitest'

// import.meta.glob keeps this file loadable before the module exists
const contrastModules = import.meta.glob('./contrast.ts')

async function loadContrastRatio() {
  const loaded = (await contrastModules['./contrast.ts']()) as typeof import('./contrast')
  return loaded.contrastRatio
}

describe('contrastRatio', () => {
  it('is 21 between black and white', async () => {
    const contrastRatio = await loadContrastRatio()

    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
  })

  it('is 1 between identical colours', async () => {
    const contrastRatio = await loadContrastRatio()

    expect(contrastRatio('#336699', '#336699')).toBeCloseTo(1, 5)
  })

  it('does not depend on argument order', async () => {
    const contrastRatio = await loadContrastRatio()

    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(contrastRatio('#ffffff', '#777777'), 10)
  })

  it('matches the known ratio of mid grey on white', async () => {
    const contrastRatio = await loadContrastRatio()

    expect(contrastRatio('#767676', '#ffffff')).toBeCloseTo(4.54, 2)
  })

  it('refuses a colour that is not a six digit hex value', async () => {
    const contrastRatio = await loadContrastRatio()

    expect(() => contrastRatio('red', '#ffffff')).toThrow()
    expect(() => contrastRatio('#fff', '#ffffff')).toThrow()
  })
})
