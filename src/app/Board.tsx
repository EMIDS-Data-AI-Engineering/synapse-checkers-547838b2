import { useRef, useState, type KeyboardEvent } from 'react'
import { checkerAt, startingCheckers, type Checker, type Side } from '../game/pieces'
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

function CheckerDisc({ side }: { side: Side }) {
  return (
    <span
      aria-hidden="true"
      data-checker={side}
      className={`h-4/5 w-4/5 rounded-full border-2 border-square-light ${CHECKER_CLASS[side]}`}
    />
  )
}

function BoardSquare({ square, checker, isFocusStop }: { square: Square; checker?: Checker; isFocusStop: boolean }) {
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
      {checker && <CheckerDisc side={checker.side} />}
    </div>
  )
}

export function Board() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [checkers] = useState(startingCheckers)
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
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board
