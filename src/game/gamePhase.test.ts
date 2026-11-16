import { describe, expect, it } from 'vitest'

async function loadNextPhase() {
  const loaders = import.meta.glob('./gamePhase.ts')
  const module = (await loaders['./gamePhase.ts']()) as typeof import('./gamePhase')
  return module.nextPhase
}

describe('game phase', () => {
  it('moves from awaiting-start to revealing on start', async () => {
    const nextPhase = await loadNextPhase()
    expect(nextPhase('awaiting-start', 'start')).toBe('revealing')
  })

  it('moves from revealing to playing on reveal-complete', async () => {
    const nextPhase = await loadNextPhase()
    expect(nextPhase('revealing', 'reveal-complete')).toBe('playing')
  })

  it('ignores start once revealing or playing', async () => {
    const nextPhase = await loadNextPhase()
    expect(nextPhase('revealing', 'start')).toBe('revealing')
    expect(nextPhase('playing', 'start')).toBe('playing')
  })

  it('ignores reveal-complete while awaiting start', async () => {
    const nextPhase = await loadNextPhase()
    expect(nextPhase('awaiting-start', 'reveal-complete')).toBe('awaiting-start')
  })
})
