import { describe, expect, it } from 'vitest'
import type { Checker } from './pieces'

async function loadTurn() {
  const loaders = import.meta.glob('./turn.ts')
  return (await loaders['./turn.ts']()) as typeof import('./turn')
}

const darkAt = (row: number, column: number): Checker => ({ row, column, side: 'dark' })
const ORIGIN = { row: 4, column: 3 }

describe('turn', () => {
  it('startingMatch gives the first move to the player', async () => {
    const { startingMatch, isPlayersTurn } = await loadTurn()

    expect(isPlayersTurn(startingMatch())).toBe(true)
  })

  it('opponentOf names the other side', async () => {
    const { opponentOf } = await loadTurn()

    expect(opponentOf('dark')).toBe('light')
    expect(opponentOf('light')).toBe('dark')
  })

  it('playStep moves the checker and hands the turn to the computer', async () => {
    const { playStep, isPlayersTurn } = await loadTurn()
    const match = { checkers: [darkAt(ORIGIN.row, ORIGIN.column)], sideToMove: 'dark' as const }

    const next = playStep(match, ORIGIN, { row: 3, column: 2 })

    expect(next.checkers).toEqual([darkAt(3, 2)])
    expect(isPlayersTurn(next)).toBe(false)
  })

  it.each([
    ['straight ahead', { row: 3, column: 3 }],
    ['sideways', { row: 4, column: 5 }],
    ['backward onto an empty dark square', { row: 5, column: 2 }],
  ])('playStep throws on a step %s and leaves the match unchanged', async (_label, target) => {
    const { playStep } = await loadTurn()
    const match = { checkers: [darkAt(ORIGIN.row, ORIGIN.column)], sideToMove: 'dark' as const }

    expect(() => playStep(match, ORIGIN, target)).toThrow(RangeError)
    expect(match).toEqual({ checkers: [darkAt(ORIGIN.row, ORIGIN.column)], sideToMove: 'dark' })
  })
})
