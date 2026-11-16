import { BOARD_SIZE, boardSquares, shadeOf, type Position } from './board'
import { checkerAt, type Checker, type Side } from './pieces'

/** Row 0 is the top of the board, so dark checkers advance toward smaller row numbers. */
const FORWARD_ROW_STEP: Record<Side, number> = { dark: -1, light: 1 }
const STEP_DISTANCE = 1

export function isMovableBy(checker: Checker, sideToMove: Side): boolean {
  return checker.side === sideToMove
}

function isOnBoard({ row, column }: Position): boolean {
  return [row, column].every((index) => Number.isInteger(index) && index >= 0 && index < BOARD_SIZE)
}

function isForwardDiagonalStep(from: Checker, to: Position): boolean {
  return (
    to.row - from.row === FORWARD_ROW_STEP[from.side] * STEP_DISTANCE &&
    Math.abs(to.column - from.column) === STEP_DISTANCE
  )
}

export function isLegalStep(checkers: Checker[], from: Position, to: Position): boolean {
  const mover = checkerAt(checkers, from)
  if (!mover || !isOnBoard(to)) return false
  return isForwardDiagonalStep(mover, to) && shadeOf(to.row, to.column) === 'dark' && !checkerAt(checkers, to)
}

export function moveChecker(checkers: Checker[], from: Position, to: Position): Checker[] {
  if (!isLegalStep(checkers, from, to)) {
    throw new RangeError(`Illegal move from ${from.row},${from.column} to ${to.row},${to.column}`)
  }
  return checkers.map((checker) => (checkerAt([checker], from) ? { ...checker, row: to.row, column: to.column } : checker))
}

export function legalDestinationsFor(checkers: Checker[], from: Position): Position[] {
  return boardSquares()
    .filter((square) => isLegalStep(checkers, from, square))
    .map(({ row, column }) => ({ row, column }))
}
