import { BOARD_SIZE, boardSquares, type Position } from './board'

export type Side = 'dark' | 'light'

export function opponentOf(side: Side): Side {
  return side === 'dark' ? 'light' : 'dark'
}

export interface Checker extends Position {
  side: Side
}

export const ROWS_PER_SIDE = 3

const FIRST_PLAYER_ROW = BOARD_SIZE - ROWS_PER_SIDE

/** Light checkers belong to the computer at the top; dark checkers to the player at the bottom. */
function sideOfRow(row: number): Side | undefined {
  if (row < ROWS_PER_SIDE) return 'light'
  if (row >= FIRST_PLAYER_ROW) return 'dark'
  return undefined
}

export function startingCheckers(): Checker[] {
  return boardSquares()
    .filter((square) => square.shade === 'dark')
    .flatMap(({ row, column }) => {
      const side = sideOfRow(row)
      return side ? [{ row, column, side }] : []
    })
}

export function checkerAt(checkers: Checker[], position: Position): Checker | undefined {
  return checkers.find((checker) => checker.row === position.row && checker.column === position.column)
}

export function liveCountOf(checkers: Checker[], side: Side): number {
  return checkers.filter((checker) => checker.side === side).length
}
