import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { checkerAt, startingCheckers, type Checker, type Side } from '../game/pieces'
import { FIRST_TO_MOVE, isMovableBy, moveChecker } from '../game/moves'
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

function squareLabel({ row, column, shade }: Square, checker?: Checker): string {
  const rowFromBottom = BOARD_SIZE - row
  const occupant = checker ? `, ${checker.side} checker` : ''
  return `Row ${rowFromBottom}, column ${column + 1}, ${shade} square${occupant}`
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
  isMovable: boolean
  dragOffset?: DragState['offset']
  onPointerDown: (event: PointerEvent) => void
}

function discClasses(side: Side, isMovable: boolean, isDragging: boolean): string {
  const cursor = isDragging ? 'cursor-grabbing pointer-events-none relative z-10 touch-none' : isMovable ? 'cursor-grab touch-none' : ''
  return `h-4/5 w-4/5 rounded-full border-2 border-square-light ${CHECKER_CLASS[side]} ${cursor}`
}

function CheckerDisc({ side, isMovable, dragOffset, onPointerDown }: CheckerDiscProps) {
  return (
    <span
      aria-hidden="true"
      data-checker={side}
      data-dragging={dragOffset ? 'true' : undefined}
      style={dragOffset ? { transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` } : undefined}
      className={discClasses(side, isMovable, Boolean(dragOffset))}
      onPointerDown={onPointerDown}
    />
  )
}

interface BoardSquareProps {
  square: Square
  checker?: Checker
  isFocusStop: boolean
  canMove: boolean
  dragOffset?: DragState['offset']
  onGrab: (origin: Position, event: PointerEvent) => void
}

function BoardSquare({ square, checker, isFocusStop, canMove, dragOffset, onGrab }: BoardSquareProps) {
  return (
    <div
      role="gridcell"
      tabIndex={isFocusStop ? 0 : -1}
      aria-label={squareLabel(square, checker)}
      data-row={square.row}
      data-column={square.column}
      data-shade={square.shade}
      className={`flex flex-1 items-center justify-center ${SHADE_CLASS[square.shade]}`}
    >
      {checker && (
        <CheckerDisc
          side={checker.side}
          isMovable={canMove && isMovableBy(checker, FIRST_TO_MOVE)}
          dragOffset={dragOffset}
          onPointerDown={(event) => onGrab(square, event)}
        />
      )}
    </div>
  )
}

export function Board({ canMove = false }: { canMove?: boolean }) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [checkers, setCheckers] = useState(startingCheckers)
  const getBoardRect = useCallback(() => gridRef.current?.getBoundingClientRect(), [])
  const applyMove = useCallback(
    (from: Position, to: Position) => setCheckers((current) => moveChecker(current, from, to)),
    [],
  )
  const { drag, startDrag } = useCheckerDrag({ checkers, canMove, getBoardRect, onMove: applyMove })
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
              canMove={canMove}
              dragOffset={drag?.origin.row === square.row && drag.origin.column === square.column ? drag.offset : undefined}
              onGrab={startDrag}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board
