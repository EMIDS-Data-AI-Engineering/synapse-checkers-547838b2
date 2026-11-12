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

export interface Position {
  row: number
  column: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

const DIRECTION_STEPS: Record<Direction, Position> = {
  up: { row: -1, column: 0 },
  down: { row: 1, column: 0 },
  left: { row: 0, column: -1 },
  right: { row: 0, column: 1 },
}

function clampToBoard(index: number): number {
  return Math.min(BOARD_SIZE - 1, Math.max(0, index))
}

/** Position one step from `from` in `direction`, staying on the board. */
export function neighbourOf(from: Position, direction: Direction): Position {
  const step = DIRECTION_STEPS[direction]
  return { row: clampToBoard(from.row + step.row), column: clampToBoard(from.column + step.column) }
}
