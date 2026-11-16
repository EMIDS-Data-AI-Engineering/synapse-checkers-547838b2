import { describe, expect, it } from 'vitest'

async function loadPointToSquare() {
  const loaders = import.meta.glob('./pointToSquare.ts')
  const module = (await loaders['./pointToSquare.ts']()) as typeof import('./pointToSquare')
  return module.pointToSquare
}

const CELL = 50
const BOARD_EDGE = CELL * 8
const boardRect = { left: 100, top: 200, width: BOARD_EDGE, height: BOARD_EDGE } as DOMRect
const at = (x: number, y: number) => ({ x: boardRect.left + x, y: boardRect.top + y })

describe('pointToSquare', () => {
  it('maps a point inside the board to the square under it', async () => {
    const pointToSquare = await loadPointToSquare()

    expect(pointToSquare(at(3 * CELL + 25, 5 * CELL + 25), boardRect)).toEqual({ row: 5, column: 3 })
  })

  it('maps the top-left corner and the last inner pixel of the bottom-right corner', async () => {
    const pointToSquare = await loadPointToSquare()

    expect(pointToSquare(at(0, 0), boardRect)).toEqual({ row: 0, column: 0 })
    expect(pointToSquare(at(BOARD_EDGE - 1, BOARD_EDGE - 1), boardRect)).toEqual({ row: 7, column: 7 })
  })

  it('returns undefined for a point outside the board', async () => {
    const pointToSquare = await loadPointToSquare()
    const outside = [at(-1, 100), at(100, -1), at(BOARD_EDGE, 100), at(100, BOARD_EDGE)]

    outside.forEach((point) => expect(pointToSquare(point, boardRect)).toBeUndefined())
  })
})
