import { useRef, useState, type KeyboardEvent } from 'react'
import { BOARD_SIZE, boardSquares, stepFrom, type Position, type Shade, type Square } from '../game/board'

const SHADE_CLASS: Record<Shade, string> = {
  dark: 'bg-square-dark',
  light: 'bg-square-light',
}

function rowsOf(squares: Square[]): Square[][] {
  return Array.from({ length: BOARD_SIZE }, (_, row) => squares.filter((square) => square.row === row))
}

function squareLabel({ row, column, shade }: Square): string {
  const rowFromBottom = BOARD_SIZE - row
  return `Row ${rowFromBottom}, column ${column + 1}, ${shade} square`
}

const FIRST_SQUARE: Position = { row: 0, column: 0 }

function BoardSquare({ square, isFocusStop }: { square: Square; isFocusStop: boolean }) {
  return (
    <div
      role="gridcell"
      tabIndex={isFocusStop ? 0 : -1}
      aria-label={squareLabel(square)}
      data-row={square.row}
      data-column={square.column}
      data-shade={square.shade}
      className={`flex-1 ${SHADE_CLASS[square.shade]}`}
    />
  )
}

export function Board() {
  const gridRef = useRef<HTMLDivElement>(null)
  const [focusStop, setFocusStop] = useState<Position>(FIRST_SQUARE)

  function moveFocus(event: KeyboardEvent) {
    const next = stepFrom(focusStop, event.key)
    if (!next) return
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
              isFocusStop={square.row === focusStop.row && square.column === focusStop.column}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board
