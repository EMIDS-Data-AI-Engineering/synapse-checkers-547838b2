import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Board } from './Board'

const CELL = 100
const BOARD_EDGE = CELL * 8
const OFF_CENTRE_GRAB_PX = 30

const cellAt = (container: HTMLElement, row: number, column: number) =>
  container.querySelector(`[role="gridcell"][data-row="${row}"][data-column="${column}"]`) as HTMLElement
const checkerIn = (container: HTMLElement, row: number, column: number) =>
  cellAt(container, row, column).querySelector('[data-checker]') as HTMLElement | null

function renderBoard() {
  const view = render(<Board canMove />)
  const grid = view.container.querySelector('[role="grid"]') as HTMLElement
  grid.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: BOARD_EDGE, bottom: BOARD_EDGE, width: BOARD_EDGE, height: BOARD_EDGE }) as DOMRect
  return view
}

function dragWithOffCentreGrab(container: HTMLElement, release: { x: number; y: number }) {
  const grab = { x: 2 * CELL + CELL / 2 + OFF_CENTRE_GRAB_PX, y: 5 * CELL + CELL / 2 }
  fireEvent.pointerDown(checkerIn(container, 5, 2)!, { clientX: grab.x, clientY: grab.y, button: 0, isPrimary: true })
  fireEvent.pointerMove(window, { clientX: release.x, clientY: release.y })
  fireEvent.pointerUp(window, { clientX: release.x, clientY: release.y })
}

describe('Board snap with an off-centre grab', () => {
  it('starts the settle where the checker was drawn, not at the pointer', () => {
    const { container } = renderBoard()

    dragWithOffCentreGrab(container, { x: 400, y: 450 })

    const landed = checkerIn(container, 4, 3)!
    expect(landed.getAttribute('style')).toMatch(/--settle-x:\s*20px/)
  })

  it('judges the drop by where the checker is drawn, so a disc over a legal square snaps', () => {
    const { container } = renderBoard()

    dragWithOffCentreGrab(container, { x: 350 + OFF_CENTRE_GRAB_PX, y: 450 })

    expect(checkerIn(container, 4, 3)).toHaveAttribute('data-checker', 'dark')
  })

  it('returns the checker to its origin when the drawn disc is outside the board', () => {
    const { container } = renderBoard()

    dragWithOffCentreGrab(container, { x: -10 + OFF_CENTRE_GRAB_PX, y: 450 })
    dragWithOffCentreGrab(container, { x: BOARD_EDGE + 10, y: 450 })

    expect(checkerIn(container, 5, 2)).toHaveAttribute('data-checker', 'dark')
  })
})
