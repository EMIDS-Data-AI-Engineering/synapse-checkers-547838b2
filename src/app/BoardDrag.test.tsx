import { fireEvent, render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Board } from './Board'

const CELL = 100
const BOARD_EDGE = CELL * 8
const GRAB_OFFSET = 10
const DRAG_DISTANCE = 40
const OUTSIDE_BOARD = -50

const centreOf = (row: number, column: number) => ({
  clientX: column * CELL + CELL / 2 + GRAB_OFFSET,
  clientY: row * CELL + CELL / 2 + GRAB_OFFSET,
})
const cellAt = (container: HTMLElement, row: number, column: number) =>
  container.querySelector(`[role="gridcell"][data-row="${row}"][data-column="${column}"]`) as HTMLElement
const checkerIn = (container: HTMLElement, row: number, column: number) =>
  cellAt(container, row, column).querySelector('[data-checker]') as HTMLElement | null
const layoutOf = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-checker]'), (disc) => {
    const cell = disc.closest('[role="gridcell"]')!
    return `${cell.getAttribute('data-row')},${cell.getAttribute('data-column')}:${disc.getAttribute('data-checker')}`
  }).sort()

function renderBoard(canMove = true) {
  const view = render(<Board canMove={canMove} />)
  const grid = view.container.querySelector('[role="grid"]') as HTMLElement
  grid.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: BOARD_EDGE, bottom: BOARD_EDGE, width: BOARD_EDGE, height: BOARD_EDGE }) as DOMRect
  return view
}

function pressChecker(container: HTMLElement, row: number, column: number) {
  fireEvent.pointerDown(checkerIn(container, row, column)!, { ...centreOf(row, column), button: 0, isPrimary: true })
}
function pickUp(container: HTMLElement, row: number, column: number) {
  pressChecker(container, row, column)
  expect(checkerIn(container, row, column)).toHaveAttribute('data-dragging', 'true')
}
const moveTo = (row: number, column: number) => fireEvent.pointerMove(window, centreOf(row, column))
const cancelPointer = () => fireEvent.pointerCancel(window)
function expectPickUpWorks(container: HTMLElement) {
  pressChecker(container, 5, 4)
  expect(checkerIn(container, 5, 4)).toHaveAttribute('data-dragging', 'true')
  cancelPointer()
}
const releaseAt = (row: number, column: number) => fireEvent.pointerUp(window, centreOf(row, column))

describe('Board drag', () => {
  beforeEach(() => {
    vi.useRealTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('attaches a dark checker to the pointer when pressed on the player\'s turn', () => {
    const { container } = renderBoard()

    pressChecker(container, 5, 2)

    expect(checkerIn(container, 5, 2)).toHaveAttribute('data-dragging', 'true')
  })

  it('moves the dragged checker by the pointer\'s offset as the pointer moves', () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)

    fireEvent.pointerMove(window, { clientX: centreOf(5, 2).clientX + DRAG_DISTANCE, clientY: centreOf(5, 2).clientY - DRAG_DISTANCE })

    expect(checkerIn(container, 5, 2)!.style.transform).toBe(`translate(${DRAG_DISTANCE}px, ${-DRAG_DISTANCE}px)`)
  })

  it('does not pick up a light checker', () => {
    const { container } = renderBoard()
    const before = layoutOf(container)
    expectPickUpWorks(container)

    pressChecker(container, 2, 1)
    moveTo(3, 2)

    expect(container.querySelector('[data-dragging]')).toBeNull()
    releaseAt(3, 2)
    expect(layoutOf(container)).toEqual(before)
  })

  it('does not pick up a checker while the board cannot move', () => {
    const { container } = renderBoard(false)
    const before = layoutOf(container)
    expectPickUpWorks(renderBoard().container)

    pressChecker(container, 5, 2)
    moveTo(4, 3)
    releaseAt(4, 3)

    expect(container.querySelector('[data-dragging]')).toBeNull()
    expect(layoutOf(container)).toEqual(before)
  })

  it('does not pick up a checker when the board is given no canMove setting', () => {
    const { container } = render(<Board />)
    expectPickUpWorks(renderBoard().container)

    pressChecker(container, 5, 2)

    expect(container.querySelector('[data-dragging]')).toBeNull()
  })

  it('snaps the checker into the destination square when released over a legal square', () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)
    moveTo(4, 3)

    releaseAt(4, 3)

    expect(checkerIn(container, 4, 3)).toHaveAttribute('data-checker', 'dark')
    expect(checkerIn(container, 5, 2)).toBeNull()
  })

  it('leaves no drag offset or dragging marker on the checker after a legal drop', () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)
    moveTo(4, 3)

    releaseAt(4, 3)

    const landed = checkerIn(container, 4, 3)!
    expect(landed).not.toHaveAttribute('data-dragging')
    expect(landed.style.transform).toBe('')
  })

  it('stops following the pointer once the checker is dropped', () => {
    const { container } = renderBoard()
    pressChecker(container, 5, 2)
    releaseAt(4, 3)

    moveTo(2, 2)

    expect(checkerIn(container, 4, 3)!.style.transform).toBe('')
  })

  it.each([
    ['a light square', 4, 2],
    ['an occupied square', 6, 3],
    ['a square two rows away', 3, 3],
    ['a backward square', 6, 1],
  ])('returns the checker to its origin when released over %s', (_label, row, column) => {
    const { container } = renderBoard()
    const before = layoutOf(container)
    pickUp(container, 5, 2)
    moveTo(row, column)

    releaseAt(row, column)

    expect(layoutOf(container)).toEqual(before)
    expect(checkerIn(container, 5, 2)!.style.transform).toBe('')
  })

  it('returns the checker to its origin when released outside the board', () => {
    const { container } = renderBoard()
    const before = layoutOf(container)
    pickUp(container, 5, 2)

    fireEvent.pointerUp(window, { clientX: OUTSIDE_BOARD, clientY: OUTSIDE_BOARD })

    expect(layoutOf(container)).toEqual(before)
    expect(checkerIn(container, 5, 2)).not.toHaveAttribute('data-dragging')
  })

  it('returns the checker to its origin when the pointer is cancelled', () => {
    const { container } = renderBoard()
    const before = layoutOf(container)
    pickUp(container, 5, 2)
    moveTo(4, 3)

    fireEvent.pointerCancel(window, centreOf(4, 3))

    expect(layoutOf(container)).toEqual(before)
    expect(container.querySelector('[data-dragging]')).toBeNull()
  })

  it('leaves no error state, dragging marker or offset after an invalid drop', () => {
    const { container } = renderBoard()
    pickUp(container, 5, 2)
    moveTo(4, 2)

    releaseAt(4, 2)

    expect(container.querySelector('[data-dragging]')).toBeNull()
    expect(container.querySelector('[style*="transform"]')).toBeNull()
    expect(container.querySelector('[role="alert"]')).toBeNull()
    expect(container.querySelector('[aria-invalid]')).toBeNull()
  })

  it('ignores pointer movement after unmounting mid-drag', () => {
    const { container, unmount } = renderBoard()
    pickUp(container, 5, 2)

    unmount()

    expect(() => {
      moveTo(4, 3)
      releaseAt(4, 3)
    }).not.toThrow()
  })

  it('has no accessibility violations while a checker is being dragged', async () => {
    const { container } = renderBoard()
    pickUp(container, 5, 2)
    moveTo(4, 3)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('Board turn', () => {
  const PLAYERS_TURN = 'Your turn'
  const COMPUTERS_TURN = 'Computer\'s turn'

  function dragAndDrop(container: HTMLElement, from: [number, number], to: [number, number]) {
    pressChecker(container, ...from)
    moveTo(...to)
    releaseAt(...to)
  }

  it('starts on the player\'s turn', () => {
    const { container } = renderBoard()

    expect(container).toHaveTextContent(PLAYERS_TURN)
  })

  it('passes the turn to the computer after a legal move', () => {
    const { container } = renderBoard()

    dragAndDrop(container, [5, 2], [4, 3])

    expect(container).toHaveTextContent(COMPUTERS_TURN)
  })

  it('does not let the player pick up a checker once the turn has passed to the computer', () => {
    const { container } = renderBoard()
    dragAndDrop(container, [5, 2], [4, 3])

    pressChecker(container, 5, 4)

    expect(container.querySelector('[data-dragging]')).toBeNull()
  })

  it.each([
    ['straight ahead', 4, 2],
    ['sideways', 5, 3],
    ['backward', 6, 1],
  ])('keeps the player\'s turn after a checker is released %s', (_label, row, column) => {
    const { container } = renderBoard()

    dragAndDrop(container, [5, 2], [row, column])

    expect(container).toHaveTextContent(PLAYERS_TURN)
    expect(checkerIn(container, 5, 2)).toHaveAttribute('data-checker', 'dark')
  })
})
