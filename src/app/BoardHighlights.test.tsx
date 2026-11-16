import { fireEvent, render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import { Board } from './Board'

const CELL = 100
const BOARD_EDGE = CELL * 8
const OUTSIDE_BOARD = -50

const centreOf = (row: number, column: number) => ({
  clientX: column * CELL + CELL / 2,
  clientY: row * CELL + CELL / 2,
})
const cellAt = (container: HTMLElement, row: number, column: number) =>
  container.querySelector(`[role="gridcell"][data-row="${row}"][data-column="${column}"]`) as HTMLElement
const checkerIn = (container: HTMLElement, row: number, column: number) =>
  cellAt(container, row, column).querySelector('[data-checker]') as HTMLElement
const highlighted = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-legal-destination="true"]'), (cell) =>
    `${cell.getAttribute('data-row')},${cell.getAttribute('data-column')}`,
  ).sort()
const layoutOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-checker]'), (disc) => {
    const cell = disc.closest('[role="gridcell"]')!
    return `${cell.getAttribute('data-row')},${cell.getAttribute('data-column')}:${disc.getAttribute('data-checker')}`
  }).sort()

function renderBoard() {
  const view = render(<Board canMove />)
  const grid = view.container.querySelector('[role="grid"]') as HTMLElement
  grid.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: BOARD_EDGE, bottom: BOARD_EDGE, width: BOARD_EDGE, height: BOARD_EDGE }) as DOMRect
  return view
}

function pressChecker(container: HTMLElement, row: number, column: number) {
  fireEvent.pointerDown(checkerIn(container, row, column), { ...centreOf(row, column), button: 0, isPrimary: true })
}
/** Proves highlighting is active for a movable checker, so "no highlight" later is a real refusal. */
function expectHighlightingWorks(container: HTMLElement) {
  pressChecker(container, 5, 2)
  expect(highlighted(container)).toEqual(['4,1', '4,3'])
  fireEvent.pointerCancel(window)
}
const releaseAt = (row: number, column: number) => fireEvent.pointerUp(window, centreOf(row, column))

describe('Board legal-move highlights', () => {
  it('highlights exactly the two forward diagonal squares when a starting dark checker is pressed', () => {
    const { container } = renderBoard()

    pressChecker(container, 5, 2)

    expect(highlighted(container)).toEqual(['4,1', '4,3'])
  })

  it('highlights a single square for a checker on the edge column', () => {
    const { container } = renderBoard()

    pressChecker(container, 5, 0)

    expect(highlighted(container)).toEqual(['4,1'])
  })

  it('announces a highlighted square as a legal move in its accessible label', () => {
    const { container } = renderBoard()

    pressChecker(container, 5, 2)

    expect(cellAt(container, 4, 1)).toHaveAttribute('aria-label', 'Row 4, column 2, dark square, legal move')
    expect(cellAt(container, 4, 3)).toHaveAttribute('aria-label', 'Row 4, column 4, dark square, legal move')
  })

  it('has no axe violations while highlights are shown', async () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)
    expect(highlighted(container)).toHaveLength(2)

    expect(await axe(container)).toHaveNoViolations()
  })

  it('removes every highlight when the checker is dropped on a legal square', () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)
    expect(highlighted(container)).not.toEqual([])

    releaseAt(4, 3)

    expect(highlighted(container)).toEqual([])
  })

  it('removes every highlight when the checker is released on an illegal square', () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)
    expect(highlighted(container)).not.toEqual([])

    releaseAt(3, 2)

    expect(highlighted(container)).toEqual([])
  })

  it('removes every highlight when the checker is released outside the board', () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)
    expect(highlighted(container)).not.toEqual([])

    fireEvent.pointerUp(window, { clientX: OUTSIDE_BOARD, clientY: OUTSIDE_BOARD })

    expect(highlighted(container)).toEqual([])
  })

  it('removes every highlight when the pointer is cancelled', () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)
    expect(highlighted(container)).not.toEqual([])

    fireEvent.pointerCancel(window)

    expect(highlighted(container)).toEqual([])
  })

  it('highlights no square for a blocked checker and returns it to its origin on release', () => {
    const { container } = renderBoard()
    expectHighlightingWorks(container)
    const before = layoutOf(container)

    pressChecker(container, 6, 1)
    expect(highlighted(container)).toEqual([])
    releaseAt(5, 0)

    expect(layoutOf(container)).toEqual(before)
    expect(highlighted(container)).toEqual([])
  })

  it('returns a blocked checker to its origin with no highlights when the pointer is cancelled', () => {
    const { container } = renderBoard()
    expectHighlightingWorks(container)
    const before = layoutOf(container)

    pressChecker(container, 6, 1)
    fireEvent.pointerCancel(window)

    expect(highlighted(container)).toEqual([])
    expect(layoutOf(container)).toEqual(before)
  })

  it('highlights no square for a back-row checker in the starting position', () => {
    const { container } = renderBoard()
    expectHighlightingWorks(container)

    pressChecker(container, 7, 0)

    expect(highlighted(container)).toEqual([])
  })
})
