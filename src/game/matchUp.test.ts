import { describe, expect, it } from 'vitest'

async function loadMatchUp() {
  const loaders = import.meta.glob('./matchUp.ts')
  return (await loaders['./matchUp.ts']()) as typeof import('./matchUp')
}

describe('match up', () => {
  it('gives the player the dark pieces', async () => {
    const { PLAYER_SIDE } = await loadMatchUp()
    expect(PLAYER_SIDE).toBe('dark')
  })

  it('gives the computer the light pieces', async () => {
    const { COMPUTER_SIDE } = await loadMatchUp()
    expect(COMPUTER_SIDE).toBe('light')
  })

  it('lets dark move first', async () => {
    const { FIRST_TO_MOVE } = await loadMatchUp()
    expect(FIRST_TO_MOVE).toBe('dark')
  })

  it('gives the player and the computer different sides', async () => {
    const { PLAYER_SIDE, COMPUTER_SIDE } = await loadMatchUp()
    expect(PLAYER_SIDE).not.toBe(COMPUTER_SIDE)
  })
})
