import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Board } from './Board'
import { BOARD_SIZE } from '../game/board'

const LAST_INDEX = BOARD_SIZE - 1

function cellAt(container: HTMLElement, row: number, column: number): HTMLElement {
  return container.querySelector(`[role="gridcell"][data-row="${row}"][data-column="${column}"]`) as HTMLElement
}

describe('Board keyboard navigation', () => {
  it('offers exactly one tab stop, on the top-left square', () => {
    const { container } = render(<Board />)
    const stops = container.querySelectorAll('[role="gridcell"][tabindex="0"]')

    expect(stops).toHaveLength(1)
    expect(stops[0]).toBe(cellAt(container, 0, 0))
  })

  it('moves focus with the arrow keys', () => {
    const { container } = render(<Board />)
    const start = cellAt(container, 0, 0)
    start.focus()

    fireEvent.keyDown(start, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(cellAt(container, 0, 1))
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(cellAt(container, 1, 1))
    expect(cellAt(container, 1, 1).getAttribute('tabindex')).toBe('0')
    expect(cellAt(container, 0, 0).getAttribute('tabindex')).toBe('-1')
  })

  it('stays on the board edge instead of leaving it', () => {
    const { container } = render(<Board />)
    const start = cellAt(container, 0, 0)
    start.focus()

    fireEvent.keyDown(start, { key: 'ArrowUp' })
    fireEvent.keyDown(start, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(start)
  })

  it('ignores keys that are not arrows', () => {
    const { container } = render(<Board />)
    const start = cellAt(container, 0, 0)
    start.focus()

    fireEvent.keyDown(start, { key: 'a' })
    expect(document.activeElement).toBe(start)
  })
})

describe('Board alternation at the bottom-right boundary', () => {
  it('differs from its row and column neighbours and from the far corners', () => {
    const { container } = render(<Board />)
    const shadeAt = (row: number, column: number) => cellAt(container, row, column).getAttribute('data-shade')

    expect(shadeAt(LAST_INDEX, LAST_INDEX)).not.toBe(shadeAt(LAST_INDEX, LAST_INDEX - 1))
    expect(shadeAt(LAST_INDEX, LAST_INDEX)).not.toBe(shadeAt(LAST_INDEX - 1, LAST_INDEX))
    expect(screen.getAllByRole('gridcell')).toHaveLength(BOARD_SIZE * BOARD_SIZE)
  })
})
