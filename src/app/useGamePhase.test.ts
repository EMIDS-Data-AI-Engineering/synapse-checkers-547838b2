import { describe, expect, it } from 'vitest'

const ONE_SECOND_MS = 1000

describe('useGamePhase', () => {
  it('reveal duration is under one second', async () => {
    const loaders = import.meta.glob('./useGamePhase.ts')
    const { REVEAL_DURATION_MS } = (await loaders['./useGamePhase.ts']()) as typeof import('./useGamePhase')

    expect(REVEAL_DURATION_MS).toBeGreaterThan(0)
    expect(REVEAL_DURATION_MS).toBeLessThan(ONE_SECOND_MS)
  })
})
