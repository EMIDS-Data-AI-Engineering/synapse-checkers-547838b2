import { BOARD_SIZE, boardSquares, shadeOf, type Position } from './board'
import { checkerAt, opponentOf, type Checker, type Side } from './pieces'

/** Row 0 is the top of the board, so dark checkers advance toward smaller row numbers. */
const FORWARD_ROW_STEP: Record<Side, number> = { dark: -1, light: 1 }
const STEP_DISTANCE = 1
const JUMP_DISTANCE = 2

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

export function jumpedSquareOf(from: Position, to: Position): Position {
  return { row: (from.row + to.row) / 2, column: (from.column + to.column) / 2 }
}

function isForwardDiagonalJump(from: Checker, to: Position): boolean {
  return (
    to.row - from.row === FORWARD_ROW_STEP[from.side] * JUMP_DISTANCE &&
    Math.abs(to.column - from.column) === JUMP_DISTANCE
  )
}

export function isLegalJump(checkers: Checker[], from: Position, to: Position): boolean {
  const mover = checkerAt(checkers, from)
  if (!mover || !isOnBoard(to) || !isForwardDiagonalJump(mover, to)) return false
  const jumped = checkerAt(checkers, jumpedSquareOf(from, to))
  return shadeOf(to.row, to.column) === 'dark' && !checkerAt(checkers, to) && jumped?.side === opponentOf(mover.side)
}

export function isLegalMove(checkers: Checker[], from: Position, to: Position): boolean {
  return isLegalStep(checkers, from, to) || isLegalJump(checkers, from, to)
}

function isAt(checker: Checker, position: Position): boolean {
  return checker.row === position.row && checker.column === position.column
}

export function moveChecker(checkers: Checker[], from: Position, to: Position): Checker[] {
  if (!isLegalMove(checkers, from, to)) {
    throw new RangeError(`Illegal move from ${from.row},${from.column} to ${to.row},${to.column}`)
  }
  const captured = isLegalJump(checkers, from, to) ? jumpedSquareOf(from, to) : undefined
  return checkers
    .filter((checker) => !captured || !isAt(checker, captured))
    .map((checker) => (isAt(checker, from) ? { ...checker, row: to.row, column: to.column } : checker))
}

export function legalDestinationsFor(checkers: Checker[], from: Position): Position[] {
  return boardSquares()
    .filter((square) => isLegalMove(checkers, from, square))
    .map(({ row, column }) => ({ row, column }))
}
