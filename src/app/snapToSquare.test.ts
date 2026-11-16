import { describe, expect, it } from 'vitest'

const CELL = 100
const SQUARE_BOARD = rectOf(0, 0, CELL * 8, CELL * 8)

function rectOf(left: number, top: number, width: number, height: number): DOMRect {
  return { left, top, width, height, right: left + width, bottom: top + height } as DOMRect
}

async function loadSnap() {
  const loaders = import.meta.glob('./snapToSquare.ts')
  return (await loaders['./snapToSquare.ts']()) as typeof import('./snapToSquare')
}

describe('snapTarget', () => {
  it('returns the square under the point when the point is inside a playable square', async () => {
    const { snapTarget } = await loadSnap()

    expect(snapTarget({ x: 390, y: 410 }, SQUARE_BOARD)).toEqual({ row: 4, column: 3 })
  })

  it('returns the nearest playable square when the point is over a light square', async () => {
    const { snapTarget } = await loadSnap()

    expect(snapTarget({ x: 270, y: 450 }, SQUARE_BOARD)).toEqual({ row: 4, column: 3 })
  })

  it('measures nearness in cell units on a board that is not square', async () => {
    const { snapTarget } = await loadSnap()
    const wideBoard = rectOf(0, 0, 800, 400)

    expect(snapTarget({ x: 225, y: 5 }, wideBoard)).toEqual({ row: 0, column: 1 })
  })

  it('returns undefined when two playable squares are equally near', async () => {
    const { snapTarget } = await loadSnap()

    expect(snapTarget({ x: 250, y: 450 }, SQUARE_BOARD)).toBeUndefined()
  })

  it('returns undefined for a point outside the board', async () => {
    const { snapTarget } = await loadSnap()

    expect(snapTarget({ x: -10, y: 150 }, SQUARE_BOARD)).toBeUndefined()
    expect(snapTarget({ x: 150, y: CELL * 8 }, SQUARE_BOARD)).toBeUndefined()
  })
})

describe('landingOffset', () => {
  it('returns the release point relative to the centre of the square', async () => {
    const { landingOffset } = await loadSnap()

    expect(landingOffset({ x: 270, y: 450 }, { row: 4, column: 3 }, SQUARE_BOARD)).toEqual({ x: -80, y: 0 })
  })

  it('accounts for the board position and a non-square board', async () => {
    const { landingOffset } = await loadSnap()
    const shiftedWideBoard = rectOf(10, 20, 800, 400)

    expect(landingOffset({ x: 235, y: 25 }, { row: 0, column: 1 }, shiftedWideBoard)).toEqual({ x: 75, y: -20 })
  })
})
