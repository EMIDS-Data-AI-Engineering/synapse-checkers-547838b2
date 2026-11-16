import { act, fireEvent, render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Board } from './Board'

const CELL = 100
const BOARD_EDGE = CELL * 8
const UNDER_MS = 200
const OUTSIDE_BOARD = { x: -50, y: -50 }

interface Point {
  x: number
  y: number
}

const centreOf = (row: number, column: number): Point => ({ x: column * CELL + CELL / 2, y: row * CELL + CELL / 2 })
const cellAt = (container: HTMLElement, row: number, column: number) =>
  container.querySelector(`[role="gridcell"][data-row="${row}"][data-column="${column}"]`) as HTMLElement
const checkerIn = (container: HTMLElement, row: number, column: number) =>
  cellAt(container, row, column).querySelector('[data-checker]') as HTMLElement | null
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

function grabAt(container: HTMLElement, row: number, column: number) {
  const point = centreOf(row, column)
  fireEvent.pointerDown(checkerIn(container, row, column)!, { clientX: point.x, clientY: point.y, button: 0, isPrimary: true })
}
function releaseAt(point: Point) {
  fireEvent.pointerMove(window, { clientX: point.x, clientY: point.y })
  fireEvent.pointerUp(window, { clientX: point.x, clientY: point.y })
}
function dragFromOriginTo(container: HTMLElement, point: Point) {
  grabAt(container, 5, 2)
  releaseAt(point)
}

// The checker starts on (5,2). Its legal destinations are (4,1) and (4,3); (4,2) is a light square between them.
const NEAR_LEGAL_RIGHT: Point = { x: 270, y: 450 }
const NEAR_LEGAL_LEFT: Point = { x: 235, y: 450 }
const NEAR_EMPTY_ILLEGAL: Point = { x: 250, y: 410 }
const NEAR_OCCUPIED: Point = { x: 350, y: 590 }
const EQUIDISTANT: Point = centreOf(4, 2)

describe('Board snap to nearest legal square', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('snaps the checker onto a legal square when released over the light square beside it, nearer that square', () => {
    const { container } = renderBoard()

    dragFromOriginTo(container, NEAR_LEGAL_RIGHT)

    expect(checkerIn(container, 4, 3)).toHaveAttribute('data-checker', 'dark')
    expect(checkerIn(container, 5, 2)).toBeNull()
  })

  it('snaps onto a legal square from the light square between two legal destinations when nearer one of them', () => {
    const { container } = renderBoard()

    dragFromOriginTo(container, NEAR_LEGAL_LEFT)

    expect(checkerIn(container, 4, 1)).toHaveAttribute('data-checker', 'dark')
    expect(checkerIn(container, 4, 3)).toBeNull()
  })

  it('passes the turn to the computer after a snapped move', () => {
    const { container } = renderBoard()

    dragFromOriginTo(container, NEAR_LEGAL_RIGHT)

    expect(container).toHaveTextContent("Computer's turn")
  })

  it.each([
    ['nearer an illegal empty square', NEAR_EMPTY_ILLEGAL],
    ['nearer an occupied square', NEAR_OCCUPIED],
    ['equidistant from playable squares', EQUIDISTANT],
    ['outside the board', OUTSIDE_BOARD],
  ])('returns the checker to its origin when released over a light square %s', (_label, point) => {
    const { container } = renderBoard()
    const before = layoutOf(container)

    dragFromOriginTo(container, point)

    expect(layoutOf(container)).toEqual(before)
    expect(container).toHaveTextContent('Your turn')
    expect(container.querySelector('[data-settling]')).toBeNull()
  })

  it('starts the snapped checker at its release point and animates it for the settle duration', async () => {
    const loaders = import.meta.glob('./useSnapSettle.ts')
    const { SNAP_SETTLE_MS } = (await loaders['./useSnapSettle.ts']()) as typeof import('./useSnapSettle')
    const { container } = renderBoard()

    dragFromOriginTo(container, NEAR_LEGAL_RIGHT)

    const landed = checkerIn(container, 4, 3)!
    expect(landed).toHaveAttribute('data-settling')
    expect(landed.className).toContain('animate-snap-settle')
    expect(landed.getAttribute('style')).toMatch(/--settle-x:\s*-80px/)
    expect(landed.getAttribute('style')).toMatch(/--settle-y:\s*0(px)?/)
    expect(landed.getAttribute('style')).toMatch(new RegExp(`--snap-settle-duration:\\s*${SNAP_SETTLE_MS}ms`))
  })

  it('finishes settling within the settle duration, under 200 milliseconds', async () => {
    const loaders = import.meta.glob('./useSnapSettle.ts')
    const { SNAP_SETTLE_MS } = (await loaders['./useSnapSettle.ts']()) as typeof import('./useSnapSettle')
    const { container } = renderBoard()
    dragFromOriginTo(container, NEAR_LEGAL_RIGHT)

    act(() => {
      vi.advanceTimersByTime(Math.min(SNAP_SETTLE_MS, UNDER_MS - 1))
    })

    expect(checkerIn(container, 4, 3)).not.toHaveAttribute('data-settling')
  })

  it('drops the settle animation for people who prefer reduced motion', async () => {
    await import.meta.glob('./useSnapSettle.ts')['./useSnapSettle.ts']()
    const { container } = renderBoard()

    dragFromOriginTo(container, NEAR_LEGAL_RIGHT)

    expect(checkerIn(container, 4, 3)!.className).toContain('motion-reduce:animate-none')
  })

  it('has no accessibility violations while a checker settles', async () => {
    await import.meta.glob('./useSnapSettle.ts')['./useSnapSettle.ts']()
    vi.useRealTimers()
    const { container } = renderBoard()
    dragFromOriginTo(container, NEAR_LEGAL_RIGHT)
    expect(checkerIn(container, 4, 3)).toHaveAttribute('data-settling')

    expect(await axe(container)).toHaveNoViolations()
  })
})
