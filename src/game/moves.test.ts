import { describe, expect, it } from 'vitest'
import type { Checker } from './pieces'

async function loadMoves() {
  const loaders = import.meta.glob('./moves.ts')
  return (await loaders['./moves.ts']()) as typeof import('./moves')
}

const darkAt = (row: number, column: number): Checker => ({ row, column, side: 'dark' })
const lightAt = (row: number, column: number): Checker => ({ row, column, side: 'light' })
const ORIGIN = { row: 5, column: 2 }

describe('moves', () => {
  it('isMovableBy accepts a checker of the side to move and refuses the other side', async () => {
    const { isMovableBy } = await loadMoves()

    expect(isMovableBy(darkAt(5, 2), 'dark')).toBe(true)
    expect(isMovableBy(lightAt(2, 1), 'dark')).toBe(false)
  })

  it('isLegalStep accepts a single forward diagonal step onto an empty dark square', async () => {
    const { isLegalStep } = await loadMoves()
    const checkers = [darkAt(ORIGIN.row, ORIGIN.column)]

    expect(isLegalStep(checkers, ORIGIN, { row: 4, column: 1 })).toBe(true)
    expect(isLegalStep(checkers, ORIGIN, { row: 4, column: 3 })).toBe(true)
  })

  it('isLegalStep refuses backward, sideways, two-square, occupied and light-square destinations', async () => {
    const { isLegalStep } = await loadMoves()
    const checkers = [darkAt(ORIGIN.row, ORIGIN.column), lightAt(4, 3)]
    const refused = [
      { row: 6, column: 1 },
      { row: 6, column: 3 },
      { row: 5, column: 4 },
      { row: 5, column: 0 },
      { row: 3, column: 2 },
      { row: 3, column: 0 },
      { row: 4, column: 3 },
      { row: 4, column: 2 },
    ]

    refused.forEach((destination) => expect(isLegalStep(checkers, ORIGIN, destination)).toBe(false))
  })

  it('isLegalStep refuses a destination off the board and a start square with no checker', async () => {
    const { isLegalStep } = await loadMoves()

    expect(isLegalStep([darkAt(0, 1)], { row: 0, column: 1 }, { row: -1, column: 0 })).toBe(false)
    expect(isLegalStep([darkAt(4, 7)], { row: 4, column: 7 }, { row: 3, column: 8 })).toBe(false)
    expect(isLegalStep([], ORIGIN, { row: 4, column: 3 })).toBe(false)
  })

  it('moveChecker returns a new layout with the checker on its destination', async () => {
    const { moveChecker } = await loadMoves()
    const checkers = [darkAt(5, 2), darkAt(6, 3)]

    const moved = moveChecker(checkers, ORIGIN, { row: 4, column: 3 })

    expect(moved).toContainEqual(darkAt(4, 3))
    expect(moved).toContainEqual(darkAt(6, 3))
    expect(moved).not.toContainEqual(darkAt(5, 2))
    expect(moved).toHaveLength(2)
  })

  it('moveChecker leaves the original layout untouched', async () => {
    const { moveChecker } = await loadMoves()
    const checkers = [darkAt(5, 2)]

    const moved = moveChecker(checkers, ORIGIN, { row: 4, column: 1 })

    expect(moved).not.toBe(checkers)
    expect(checkers).toEqual([darkAt(5, 2)])
  })

  it('moveChecker throws on an illegal move', async () => {
    const { moveChecker } = await loadMoves()

    expect(() => moveChecker([darkAt(5, 2)], ORIGIN, { row: 6, column: 3 })).toThrow(RangeError)
  })

  it('legalDestinationsFor lists both forward diagonal empty dark squares', async () => {
    const { legalDestinationsFor } = await loadMoves()

    const destinations = legalDestinationsFor([darkAt(5, 2)], ORIGIN)

    expect(destinations).toHaveLength(2)
    expect(destinations).toEqual(expect.arrayContaining([{ row: 4, column: 1 }, { row: 4, column: 3 }]))
  })

  it('legalDestinationsFor lists only the on-board square from an edge column', async () => {
    const { legalDestinationsFor } = await loadMoves()

    expect(legalDestinationsFor([darkAt(5, 0)], { row: 5, column: 0 })).toEqual([{ row: 4, column: 1 }])
  })

  it('legalDestinationsFor returns no squares for a checker whose forward squares are occupied', async () => {
    const { legalDestinationsFor } = await loadMoves()
    const checkers = [darkAt(5, 2), darkAt(4, 1), lightAt(4, 3)]

    expect(legalDestinationsFor(checkers, ORIGIN)).toEqual([])
  })

  it('legalDestinationsFor returns no squares for an empty origin', async () => {
    const { legalDestinationsFor } = await loadMoves()

    expect(legalDestinationsFor([darkAt(5, 2)], { row: 3, column: 0 })).toEqual([])
  })

  it('legalDestinationsFor agrees with isLegalStep for every square', async () => {
    const { legalDestinationsFor, isLegalStep } = await loadMoves()
    const { boardSquares } = await import('./board')
    const checkers = [darkAt(5, 2), lightAt(4, 3)]

    const expected = boardSquares().filter((square) => isLegalStep(checkers, ORIGIN, square))

    expect(legalDestinationsFor(checkers, ORIGIN)).toEqual(expected.map(({ row, column }) => ({ row, column })))
  })
})

describe('isLegalJump', () => {
  const LANDING = { row: 3, column: 4 }
  const dark = darkAt(ORIGIN.row, ORIGIN.column)

  it('accepts a forward jump over an adjacent opponent onto an empty dark square', async () => {
    const { isLegalJump } = await loadMoves()

    expect(isLegalJump([dark, lightAt(4, 3)], ORIGIN, LANDING)).toBe(true)
  })

  it('refuses a jump over an empty square', async () => {
    const { isLegalJump } = await loadMoves()

    expect(isLegalJump([dark], ORIGIN, LANDING)).toBe(false)
  })

  it('refuses a jump over the mover\'s own checker', async () => {
    const { isLegalJump } = await loadMoves()

    expect(isLegalJump([dark, darkAt(4, 3)], ORIGIN, LANDING)).toBe(false)
  })

  it('refuses a jump onto an occupied square', async () => {
    const { isLegalJump } = await loadMoves()

    expect(isLegalJump([dark, lightAt(4, 3), lightAt(3, 4)], ORIGIN, LANDING)).toBe(false)
  })

  it('refuses a jump that would land off the board', async () => {
    const { isLegalJump } = await loadMoves()
    const edgeMover = darkAt(2, 1)

    expect(isLegalJump([edgeMover, lightAt(1, 0)], { row: 2, column: 1 }, { row: 0, column: -1 })).toBe(false)
  })

  it('refuses a backward jump by a regular checker', async () => {
    const { isLegalJump } = await loadMoves()

    expect(isLegalJump([dark, lightAt(6, 3)], ORIGIN, { row: 7, column: 4 })).toBe(false)
  })

  it('refuses a jump from a square holding no checker', async () => {
    const { isLegalJump } = await loadMoves()

    expect(isLegalJump([lightAt(4, 3)], ORIGIN, LANDING)).toBe(false)
  })
})

describe('isLegalMove', () => {
  it('accepts both a step and a jump and refuses anything else', async () => {
    const { isLegalMove } = await loadMoves()
    const checkers = [darkAt(ORIGIN.row, ORIGIN.column), lightAt(4, 3)]

    expect(isLegalMove(checkers, ORIGIN, { row: 4, column: 1 })).toBe(true)
    expect(isLegalMove(checkers, ORIGIN, { row: 3, column: 4 })).toBe(true)
    expect(isLegalMove(checkers, ORIGIN, { row: 4, column: 3 })).toBe(false)
  })
})

describe('moveChecker', () => {
  it('removes the jumped checker and relocates the mover on a jump', async () => {
    const { moveChecker } = await loadMoves()
    const bystander = lightAt(0, 1)
    const checkers = [darkAt(ORIGIN.row, ORIGIN.column), lightAt(4, 3), bystander]

    const next = moveChecker(checkers, ORIGIN, { row: 3, column: 4 })

    expect(next).toHaveLength(2)
    expect(next).toContainEqual(darkAt(3, 4))
    expect(next).toContainEqual(bystander)
    expect(next).not.toContainEqual(lightAt(4, 3))
  })

  it('legalDestinationsFor includes the landing square of a jump', async () => {
    const { legalDestinationsFor } = await loadMoves()
    const checkers = [darkAt(ORIGIN.row, ORIGIN.column), lightAt(4, 3)]

    expect(legalDestinationsFor(checkers, ORIGIN)).toContainEqual({ row: 3, column: 4 })
  })
})
