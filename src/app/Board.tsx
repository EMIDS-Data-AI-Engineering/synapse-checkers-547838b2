import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { checkerAt, type Checker, type Side } from '../game/pieces'
import { PLAYER_SIDE } from '../game/matchUp'
import { isMovableBy, legalDestinationsFor } from '../game/moves'
import { isPlayersTurn, playStep, startingMatch, type MatchState } from '../game/turn'
import { TurnIndicator } from './TurnIndicator'
import { useCheckerDrag, type DragState } from './useCheckerDrag'
import { BOARD_SIZE, boardSquares, neighbourOf, type Direction, type Position, type Shade, type Square } from '../game/board'

const SHADE_CLASS: Record<Shade, string> = {
  dark: 'bg-square-dark',
  light: 'bg-square-light',
}

function rowsOf(squares: Square[]): Square[][] {
  return Array.from({ length: BOARD_SIZE }, (_, row) => squares.filter((square) => square.row === row))
}

const CHECKER_CLASS: Record<Side, string> = {
  dark: 'bg-checker-dark',
  light: 'bg-checker-light',
}

const DESTINATION_CLASS: Record<'true' | 'false', string> = {
  true: 'ring-4 ring-inset ring-legal-move',
  false: '',
}

function squareLabel({ row, column, shade }: Square, checker?: Checker, isLegalDestination = false): string {
  const rowFromBottom = BOARD_SIZE - row
  const occupant = checker ? `, ${checker.side} checker` : ''
  const destination = isLegalDestination ? ', legal move' : ''
  return `Row ${rowFromBottom}, column ${column + 1}, ${shade} square${occupant}${destination}`
}

function isSamePosition(first: Position, second: Position): boolean {
  return first.row === second.row && first.column === second.column
}

const DIRECTION_BY_KEY: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
}

const FIRST_SQUARE: Position = { row: 0, column: 0 }

interface CheckerDiscProps {
  side: Side
  dragOffset?: DragState['offset']
}

function squareClasses(shade: Shade, isMovable: boolean): string {
  const grabCue = isMovable ? 'cursor-grab touch-none' : ''
  return `flex flex-1 items-center justify-center ${SHADE_CLASS[shade]} ${grabCue}`.trim()
}

function discClasses(side: Side, isDragging: boolean): string {
  const cursor = isDragging ? 'cursor-grabbing pointer-events-none relative z-10 touch-none' : ''
  return `h-4/5 w-4/5 rounded-full border-2 border-square-light ${CHECKER_CLASS[side]} ${cursor}`
}

function CheckerDisc({ side, dragOffset }: CheckerDiscProps) {
  return (
    <span
      aria-hidden="true"
      data-checker={side}
      data-dragging={dragOffset ? 'true' : undefined}
      style={dragOffset ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` } : undefined}
      className={discClasses(side, Boolean(dragOffset))}
    />
  )
}

interface BoardSquareProps {
  square: Square
  checker?: Checker
  isFocusStop: boolean
  canMove: boolean
  isLegalDestination: boolean
  dragOffset?: DragState['offset']
  onGrab: (origin: Position, event: PointerEvent) => void
}

function BoardSquare({ square, checker, isFocusStop, canMove, isLegalDestination, dragOffset, onGrab }: BoardSquareProps) {
  const isMovable = Boolean(checker) && canMove && isMovableBy(checker!, PLAYER_SIDE)
  return (
    <div
      role="gridcell"
      tabIndex={isFocusStop ? 0 : -1}
      aria-label={squareLabel(square, checker, isLegalDestination)}
      data-row={square.row}
      data-column={square.column}
      data-shade={square.shade}
      data-legal-destination={isLegalDestination ? 'true' : undefined}
      className={`${squareClasses(square.shade, isMovable)} ${DESTINATION_CLASS[`${isLegalDestination}`]}`}
      onPointerDown={(event) => onGrab(square, event)}
    >
      {checker && <CheckerDisc side={checker.side} dragOffset={dragOffset} />}
    </div>
  )
}

interface BoardProps {
  canMove?: boolean
  initialMatch?: MatchState
}

export function Board({ canMove = false, initialMatch }: BoardProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [match, setMatch] = useState(() => initialMatch ?? startingMatch())
  const { checkers } = match
  const getBoardRect = useCallback(() => gridRef.current?.getBoundingClientRect(), [])
  const applyMove = useCallback(
    (from: Position, to: Position) => setMatch((current) => playStep(current, from, to)),
    [],
  )
  const { drag, startDrag } = useCheckerDrag({ checkers, canMove: canMove && isPlayersTurn(match), getBoardRect, onMove: applyMove })
  const legalDestinations = drag ? legalDestinationsFor(checkers, drag.origin) : []
  const [focusStop, setFocusStop] = useState<Position>(FIRST_SQUARE)

  function moveFocus(event: KeyboardEvent) {
    const direction = DIRECTION_BY_KEY[event.key]
    if (!direction) return
    const next = neighbourOf(focusStop, direction)
    event.preventDefault()
    setFocusStop(next)
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-row="${next.row}"][data-column="${next.column}"]`)
      ?.focus()
  }

  return (
    <>
    <div
      ref={gridRef}
      onKeyDown={moveFocus}
      role="grid"
      aria-label="Checkers board"
      className="mx-auto flex aspect-square w-full max-w-[min(36rem,80dvh)] flex-col border-2 border-ink"
    >
      {rowsOf(boardSquares()).map((squares) => (
        <div role="row" key={squares[0].row} className="flex flex-1">
          {squares.map((square) => (
            <BoardSquare
              key={square.column}
              square={square}
              checker={checkerAt(checkers, square)}
              isFocusStop={square.row === focusStop.row && square.column === focusStop.column}
              canMove={canMove && isPlayersTurn(match)}
              isLegalDestination={legalDestinations.some((destination) => isSamePosition(destination, square))}
              dragOffset={drag?.origin.row === square.row && drag.origin.column === square.column ? drag.offset : undefined}
              onGrab={startDrag}
            />
          ))}
        </div>
      ))}
    </div>
    <TurnIndicator sideToMove={match.sideToMove} />
    </>
  )
}

export default Board
