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

function BoardSquare({ square }: { square: Square }) {
  return (
    <div
      role="gridcell"
      aria-label={squareLabel(square)}
      data-row={square.row}
      data-column={square.column}
      data-shade={square.shade}
      className={`flex-1 ${SHADE_CLASS[square.shade]}`}
    />
  )
}

export function Board() {
  return (
    <div
      role="grid"
      aria-label="Checkers board"
      className="mx-auto flex aspect-square w-full max-w-[min(36rem,80dvh)] flex-col border-2 border-ink"
    >
      {rowsOf(boardSquares()).map((squares) => (
        <div role="row" key={squares[0].row} className="flex flex-1">
          {squares.map((square) => (
            <BoardSquare key={square.column} square={square} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default Board
