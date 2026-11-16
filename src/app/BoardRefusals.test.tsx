import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Board } from './Board'

const CELL = 100
const BOARD_EDGE = CELL * 8
const pointAt = (row: number, column: number) => ({ clientX: column * CELL + CELL / 2, clientY: row * CELL + CELL / 2 })
const cellAt = (container: HTMLElement, row: number, column: number) =>
  container.querySelector(`[role="gridcell"][data-row="${row}"][data-column="${column}"]`) as HTMLElement

function dragAndDrop(container: HTMLElement, from: [number, number], to: [number, number]) {
  const grid = container.querySelector('[role="grid"]') as HTMLElement
  grid.getBoundingClientRect = () => ({ left: 0, top: 0, right: BOARD_EDGE, bottom: BOARD_EDGE, width: BOARD_EDGE, height: BOARD_EDGE }) as DOMRect
  const disc = cellAt(container, ...from).querySelector('[data-checker]') as HTMLElement
  fireEvent.pointerDown(disc, { ...pointAt(...from), button: 0, isPrimary: true })
  fireEvent.pointerMove(window, pointAt(...to))
  fireEvent.pointerUp(window, pointAt(...to))
}

describe('Board refusals onto empty dark squares', () => {
  it.each([
    ['two rows straight ahead', 3, 2],
    ['two rows diagonally ahead', 3, 4],
  ])('returns the checker to its origin and keeps the turn when released %s', (_label, row, column) => {
    const { container } = render(<Board canMove />)

    dragAndDrop(container, [5, 2], [row, column])

    expect(cellAt(container, row, column).querySelector('[data-checker]')).toBeNull()
    expect(cellAt(container, 5, 2).querySelector('[data-checker]')).toHaveAttribute('data-checker', 'dark')
    expect(container).toHaveTextContent('Your turn')
  })
})
