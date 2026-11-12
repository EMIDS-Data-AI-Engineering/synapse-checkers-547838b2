import { describe, expect, it } from 'vitest'

const BOARD_SIZE = 8
const LAST_INDEX = BOARD_SIZE - 1
const CHECKERS_PER_SIDE = 12
const COMPUTER_ROWS = [0, 1, 2]
const PLAYER_ROWS = [5, 6, 7]
const MIDDLE_ROWS = [3, 4]

async function loadPieces() {
  const loaders = import.meta.glob('./pieces.ts')
  return (await loaders['./pieces.ts']()) as typeof import('./pieces')
}

async function checkersOf(side: 'dark' | 'light') {
  const { startingCheckers } = await loadPieces()
  return startingCheckers().filter((checker) => checker.side === side)
}

function isDarkSquare(row: number, column: number) {
  return (row + column) % 2 === 1
}

describe('startingCheckers', () => {
  it('places exactly 12 dark and 12 light checkers', async () => {
    expect(await checkersOf('dark')).toHaveLength(CHECKERS_PER_SIDE)
    expect(await checkersOf('light')).toHaveLength(CHECKERS_PER_SIDE)
    const { startingCheckers } = await loadPieces()
    expect(startingCheckers()).toHaveLength(2 * CHECKERS_PER_SIDE)
  })

  it('puts every dark checker on a dark square of rows 5 to 7, closest to the player', async () => {
    const dark = await checkersOf('dark')
    expect(dark.length).toBeGreaterThan(0)
    dark.forEach((checker) => {
      expect(PLAYER_ROWS).toContain(checker.row)
      expect(isDarkSquare(checker.row, checker.column)).toBe(true)
    })
  })

  it('puts every light checker on a dark square of rows 0 to 2, closest to the computer', async () => {
    const light = await checkersOf('light')
    expect(light.length).toBeGreaterThan(0)
    light.forEach((checker) => {
      expect(COMPUTER_ROWS).toContain(checker.row)
      expect(isDarkSquare(checker.row, checker.column)).toBe(true)
    })
  })

  it('fills every dark square of the three rows on each side', async () => {
    const { startingCheckers, checkerAt } = await loadPieces()
    const checkers = startingCheckers()
    ;[...COMPUTER_ROWS, ...PLAYER_ROWS].forEach((row) => {
      for (let column = 0; column <= LAST_INDEX; column++) {
        const occupied = checkerAt(checkers, { row, column }) !== undefined
        expect(occupied).toBe(isDarkSquare(row, column))
      }
    })
  })

  it('leaves the middle two rows empty', async () => {
    const { startingCheckers } = await loadPieces()
    expect(startingCheckers().filter((checker) => MIDDLE_ROWS.includes(checker.row))).toEqual([])
  })

  it("leaves the player's bottom-right (7,7) and the computer's bottom-right (0,0) without a checker", async () => {
    const { startingCheckers, checkerAt } = await loadPieces()
    const checkers = startingCheckers()
    expect(checkerAt(checkers, { row: LAST_INDEX, column: LAST_INDEX })).toBeUndefined()
    expect(checkerAt(checkers, { row: 0, column: 0 })).toBeUndefined()
  })
})

describe('checkerAt', () => {
  it('returns undefined for an empty square', async () => {
    const { startingCheckers, checkerAt } = await loadPieces()
    expect(checkerAt(startingCheckers(), { row: 3, column: 0 })).toBeUndefined()
  })

  it('returns the checker standing on an occupied square', async () => {
    const { startingCheckers, checkerAt } = await loadPieces()
    expect(checkerAt(startingCheckers(), { row: 0, column: 1 })).toMatchObject({ side: 'light', row: 0, column: 1 })
    expect(checkerAt(startingCheckers(), { row: 7, column: 0 })).toMatchObject({ side: 'dark', row: 7, column: 0 })
  })
})
