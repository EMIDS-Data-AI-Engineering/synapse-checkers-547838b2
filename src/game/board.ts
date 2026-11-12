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

const ARROW_STEPS: Record<string, Position> = {
  ArrowUp: { row: -1, column: 0 },
  ArrowDown: { row: 1, column: 0 },
  ArrowLeft: { row: 0, column: -1 },
  ArrowRight: { row: 0, column: 1 },
}

function clampToBoard(index: number): number {
  return Math.min(BOARD_SIZE - 1, Math.max(0, index))
}

/** Position one arrow-key step from `from`, staying on the board; null for any other key. */
export function stepFrom(from: Position, key: string): Position | null {
  const step = ARROW_STEPS[key]
  if (!step) return null
  return { row: clampToBoard(from.row + step.row), column: clampToBoard(from.column + step.column) }
}
