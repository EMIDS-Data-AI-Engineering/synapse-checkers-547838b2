export const BOARD_SIZE = 8

export type Shade = 'dark' | 'light'

export interface Square {
  row: number
  column: number
  shade: Shade
}

function assertOnBoard(index: number, label: string): void {
  if (!Number.isInteger(index) || index < 0 || index >= BOARD_SIZE) {
    throw new RangeError(`${label} ${index} is outside the ${BOARD_SIZE}x${BOARD_SIZE} board`)
  }
}

/** Row 0 is the top of the board in the human player's view; a square is light when row + column is even. */
export function shadeOf(row: number, column: number): Shade {
  assertOnBoard(row, 'row')
  assertOnBoard(column, 'column')
  return (row + column) % 2 === 0 ? 'light' : 'dark'
}

export function boardSquares(): Square[] {
  return Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
    const row = Math.floor(index / BOARD_SIZE)
    const column = index % BOARD_SIZE
    return { row, column, shade: shadeOf(row, column) }
  })
}
