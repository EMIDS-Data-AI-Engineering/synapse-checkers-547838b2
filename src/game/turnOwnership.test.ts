import { describe, expect, it } from 'vitest'
import { playStep, type MatchState } from './turn'
import type { Checker } from './pieces'

const lightChecker: Checker = { row: 2, column: 1, side: 'light' }
const darkChecker: Checker = { row: 5, column: 2, side: 'dark' }

describe('turn ownership', () => {
  it('playStep refuses to move a checker of the side that is not to move', () => {
    const match: MatchState = { checkers: [lightChecker, darkChecker], sideToMove: 'dark' }

    expect(() => playStep(match, { row: 2, column: 1 }, { row: 3, column: 0 })).toThrow(RangeError)
  })

  it('playStep lets the side to move play its own checker', () => {
    const match: MatchState = { checkers: [lightChecker], sideToMove: 'light' }

    expect(playStep(match, { row: 2, column: 1 }, { row: 3, column: 0 }).sideToMove).toBe('dark')
  })
})
