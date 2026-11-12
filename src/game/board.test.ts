import { describe, expect, it } from 'vitest'

const LAST_INDEX = 7
const EXPECTED_SQUARE_COUNT = 64

async function loadBoard() {
  const loaders = import.meta.glob('./board.ts')
  return (await loaders['./board.ts']()) as typeof import('./board')
}

describe('board', () => {
  it('boardSquares lists 64 unique squares covering every row and column from 0 to 7', async () => {
    const { boardSquares } = await loadBoard()
    const squares = boardSquares()
    const coordinates = new Set(squares.map(({ row, column }) => `${row},${column}`))

    expect(squares).toHaveLength(EXPECTED_SQUARE_COUNT)
    expect(coordinates.size).toBe(EXPECTED_SQUARE_COUNT)
    squares.forEach(({ row, column }) => {
      expect(row).toBeGreaterThanOrEqual(0)
      expect(row).toBeLessThanOrEqual(LAST_INDEX)
      expect(column).toBeGreaterThanOrEqual(0)
      expect(column).toBeLessThanOrEqual(LAST_INDEX)
    })
  })

  it('shadeOf gives neighbouring squares in a row or column opposite shades', async () => {
    const { shadeOf } = await loadBoard()

    for (let row = 0; row < LAST_INDEX; row++) {
      for (let column = 0; column < LAST_INDEX; column++) {
        expect(shadeOf(row, column)).not.toBe(shadeOf(row, column + 1))
        expect(shadeOf(row, column)).not.toBe(shadeOf(row + 1, column))
      }
    }
  })

  it('shadeOf makes the bottom-right square light for the player at the bottom', async () => {
    const { shadeOf } = await loadBoard()

    expect(shadeOf(LAST_INDEX, LAST_INDEX)).toBe('light')
  })

  it("shadeOf makes the top-left square light, the bottom-right corner from the opposite player's side", async () => {
    const { shadeOf } = await loadBoard()

    expect(shadeOf(0, 0)).toBe('light')
  })

  it('shadeOf refuses a row or column outside the board', async () => {
    const { shadeOf } = await loadBoard()

    expect(() => shadeOf(-1, 0)).toThrow()
    expect(() => shadeOf(0, -1)).toThrow()
    expect(() => shadeOf(LAST_INDEX + 1, 0)).toThrow()
    expect(() => shadeOf(0, LAST_INDEX + 1)).toThrow()
    expect(() => shadeOf(0.5, 0)).toThrow()
  })
})
