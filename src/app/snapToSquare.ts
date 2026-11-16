import { BOARD_SIZE, boardSquares, type Position } from '../game/board'
import { pointToSquare, type ClientPoint } from './pointToSquare'

const TIE_TOLERANCE = 1e-9

const playableSquares = boardSquares().filter((square) => square.shade === 'dark')

function cellSize(boardRect: DOMRect): ClientPoint {
  return { x: boardRect.width / BOARD_SIZE, y: boardRect.height / BOARD_SIZE }
}

function centreOf(square: Position, boardRect: DOMRect): ClientPoint {
  const cell = cellSize(boardRect)
  return {
    x: boardRect.left + (square.column + 0.5) * cell.x,
    y: boardRect.top + (square.row + 0.5) * cell.y,
  }
}

/** Distance from the point to the square's centre, measured in cells so a stretched board stays fair. */
function cellDistance(point: ClientPoint, square: Position, boardRect: DOMRect): number {
  const cell = cellSize(boardRect)
  const centre = centreOf(square, boardRect)
  return Math.hypot((point.x - centre.x) / cell.x, (point.y - centre.y) / cell.y)
}

/** The nearest playable square to a point on the board; undefined off the board or when two are equally near. */
export function snapTarget(point: ClientPoint, boardRect: DOMRect): Position | undefined {
  if (!pointToSquare(point, boardRect)) return undefined
  const ranked = playableSquares
    .map((square) => ({ square, distance: cellDistance(point, square, boardRect) }))
    .sort((first, second) => first.distance - second.distance)
  const [nearest, runnerUp] = ranked
  if (runnerUp.distance - nearest.distance < TIE_TOLERANCE) return undefined
  return { row: nearest.square.row, column: nearest.square.column }
}

/** Where the point lies relative to the centre of the square, in pixels. */
export function landingOffset(point: ClientPoint, square: Position, boardRect: DOMRect): ClientPoint {
  const centre = centreOf(square, boardRect)
  return { x: point.x - centre.x, y: point.y - centre.y }
}
