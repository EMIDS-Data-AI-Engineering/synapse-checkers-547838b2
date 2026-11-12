import { useRef, useState, type KeyboardEvent } from 'react'
import { BOARD_SIZE, boardSquares, type Shade, type Square } from '../game/board'

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

interface Cell {
  row: number
  column: number
}

const ARROW_STEPS: Record<string, Cell> = {
  ArrowUp: { row: -1, column: 0 },
  ArrowDown: { row: 1, column: 0 },
  ArrowLeft: { row: 0, column: -1 },
  ArrowRight: { row: 0, column: 1 },
}

const START_CELL: Cell = { row: BOARD_SIZE - 1, column: 0 }

function clampToBoard(index: number): number {
  return Math.min(BOARD_SIZE - 1, Math.max(0, index))
}

function stepCell(cell: Cell, step: Cell): Cell {
  return { row: clampToBoard(cell.row + step.row), column: clampToBoard(cell.column + step.column) }
}

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
  const [focusStop, setFocusStop] = useState<Cell>(START_CELL)

  function moveFocusOnArrow(event: KeyboardEvent) {
    const step = ARROW_STEPS[event.key]
    if (!step) return
    event.preventDefault()
    const next = stepCell(focusStop, step)
    setFocusStop(next)
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-row="${next.row}"][data-column="${next.column}"]`)
      ?.focus()
  }

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Checkers board"
      onKeyDown={moveFocusOnArrow}
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
