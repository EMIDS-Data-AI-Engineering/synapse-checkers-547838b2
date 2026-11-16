import { BOARD_SIZE, type Position } from '../game/board'

export interface ClientPoint {
  x: number
  y: number
}

function indexWithin(offset: number, extent: number): number | undefined {
  if (offset < 0 || offset >= extent) return undefined
  return Math.floor((offset / extent) * BOARD_SIZE)
}

/** The board square under a client point, or undefined when the point is off the board. */
export function pointToSquare(point: ClientPoint, boardRect: DOMRect): Position | undefined {
  const column = indexWithin(point.x - boardRect.left, boardRect.width)
  const row = indexWithin(point.y - boardRect.top, boardRect.height)
  if (row === undefined || column === undefined) return undefined
  return { row, column }
}
