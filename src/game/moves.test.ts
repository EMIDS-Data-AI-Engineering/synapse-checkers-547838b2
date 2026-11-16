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
