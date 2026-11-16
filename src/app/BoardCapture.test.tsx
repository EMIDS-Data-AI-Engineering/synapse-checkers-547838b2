import { fireEvent, render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import type { Checker } from '../game/pieces'
import { Board } from './Board'

const CELL = 100
const BOARD_EDGE = CELL * 8

const centreOf = (row: number, column: number) => ({
  clientX: column * CELL + CELL / 2,
  clientY: row * CELL + CELL / 2,
})
const cellAt = (container: HTMLElement, row: number, column: number) =>
  container.querySelector(`[role="gridcell"][data-row="${row}"][data-column="${column}"]`) as HTMLElement
const checkerIn = (container: HTMLElement, row: number, column: number) =>
  cellAt(container, row, column).querySelector('[data-checker]') as HTMLElement | null

const darkAt = (row: number, column: number): Checker => ({ row, column, side: 'dark' })
const lightAt = (row: number, column: number): Checker => ({ row, column, side: 'light' })

const JUMPER = { row: 5, column: 2 }
const VICTIM = { row: 4, column: 3 }
const LANDING = { row: 3, column: 4 }
const FAR_LIGHT = lightAt(0, 1)

function renderBoardWith(checkers: Checker[]) {
  const view = render(<Board canMove initialMatch={{ checkers, sideToMove: 'dark' }} />)
  const grid = view.container.querySelector('[role="grid"]') as HTMLElement
  grid.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: BOARD_EDGE, bottom: BOARD_EDGE, width: BOARD_EDGE, height: BOARD_EDGE }) as DOMRect
  return view
}

function press(container: HTMLElement, at: { row: number; column: number }) {
  fireEvent.pointerDown(checkerIn(container, at.row, at.column)!, { ...centreOf(at.row, at.column), button: 0, isPrimary: true })
}
function dragAndDrop(container: HTMLElement, from: { row: number; column: number }, to: { row: number; column: number }) {
  press(container, from)
  fireEvent.pointerMove(window, centreOf(to.row, to.column))
  fireEvent.pointerUp(window, centreOf(to.row, to.column))
}
function countLabelled(container: HTMLElement, label: string): string | null | undefined {
  let node: HTMLElement | null = Array.from(container.querySelectorAll<HTMLElement>('*')).find(
    (element) => element.children.length === 0 && element.textContent?.trim() === label,
  ) ?? null
  while (node && !node.querySelector('[data-piece-count]')) node = node.parentElement
  return node?.querySelector('[data-piece-count]')?.textContent
}

const jumpPosition = () => [darkAt(JUMPER.row, JUMPER.column), lightAt(VICTIM.row, VICTIM.column), FAR_LIGHT]

describe('Board single-jump capture', () => {
  it('accepts a drag over an adjacent computer checker to the empty dark square beyond', () => {
    const { container } = renderBoardWith(jumpPosition())

    dragAndDrop(container, JUMPER, LANDING)

    expect(checkerIn(container, LANDING.row, LANDING.column)).toHaveAttribute('data-checker', 'dark')
    expect(checkerIn(container, JUMPER.row, JUMPER.column)).toBeNull()
  })

  it('removes the captured computer checker from the board immediately after the drop', () => {
    const { container } = renderBoardWith(jumpPosition())

    dragAndDrop(container, JUMPER, LANDING)

    expect(checkerIn(container, VICTIM.row, VICTIM.column)).toBeNull()
    expect(container.querySelectorAll('[data-checker="light"]')).toHaveLength(1)
  })

  it('decrements the computer\'s live piece count by one after a capture', () => {
    const { container } = renderBoardWith(jumpPosition())
    expect(countLabelled(container, 'Computer (Light)')).toBe('2')

    dragAndDrop(container, JUMPER, LANDING)

    expect(countLabelled(container, 'Computer (Light)')).toBe('1')
    expect(countLabelled(container, 'You (Dark)')).toBe('1')
  })

  it('passes the turn to the computer after a capture', () => {
    const { container } = renderBoardWith(jumpPosition())

    dragAndDrop(container, JUMPER, LANDING)

    expect(container).toHaveTextContent('Computer\'s turn')
  })

  it('highlights the jump landing square when the capturing checker is pressed', () => {
    const { container } = renderBoardWith(jumpPosition())

    press(container, JUMPER)

    expect(cellAt(container, LANDING.row, LANDING.column)).toHaveAttribute('data-legal-destination', 'true')
  })

  it('returns the checker to its origin when the jump landing square is occupied', () => {
    const { container } = renderBoardWith([...jumpPosition(), lightAt(LANDING.row, LANDING.column)])

    dragAndDrop(container, JUMPER, LANDING)

    expect(checkerIn(container, JUMPER.row, JUMPER.column)).toHaveAttribute('data-checker', 'dark')
    expect(checkerIn(container, VICTIM.row, VICTIM.column)).toHaveAttribute('data-checker', 'light')
    expect(countLabelled(container, 'Computer (Light)')).toBe('3')
  })

  it('refuses a two-square drag that jumps over no checker and captures nothing', () => {
    const { container } = renderBoardWith([darkAt(JUMPER.row, JUMPER.column), FAR_LIGHT])

    dragAndDrop(container, JUMPER, LANDING)

    expect(checkerIn(container, JUMPER.row, JUMPER.column)).toHaveAttribute('data-checker', 'dark')
    expect(countLabelled(container, 'Computer (Light)')).toBe('1')
  })

  it('has no accessibility violations after a capture', async () => {
    const { container } = renderBoardWith(jumpPosition())
    dragAndDrop(container, JUMPER, LANDING)
    expect(checkerIn(container, VICTIM.row, VICTIM.column)).toBeNull()

    expect(await axe(container)).toHaveNoViolations()
  })
})
