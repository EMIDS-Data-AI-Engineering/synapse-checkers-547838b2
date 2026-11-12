import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

const BOARD_SIZE = 8
const LAST_INDEX = BOARD_SIZE - 1
const FIXED_PIXEL_WIDTH_CLASS = /(^|\s)(min-|max-)?w-\[\d+px\]/
const FIXED_PIXEL_WIDTH_STYLE = /(^|;|\s)(min-|max-)?width:\s*\d+px/

async function renderBoard() {
  const loaders = import.meta.glob('./Board.tsx')
  const module = (await loaders['./Board.tsx']()) as { default?: () => JSX.Element; Board?: () => JSX.Element }
  const Board = module.default ?? module.Board!
  return render(<Board />)
}

function squareAt(container: HTMLElement, row: number, column: number) {
  return container.querySelector(`[role="gridcell"][data-row="${row}"][data-column="${column}"]`)
}

function checkersOnBoard(container: HTMLElement, side: 'dark' | 'light') {
  return Array.from(container.querySelectorAll(`[data-checker="${side}"]`))
}

function cellOf(checker: Element) {
  return checker.closest('[role="gridcell"]') as HTMLElement
}

describe('Board', () => {
  it('renders exactly 64 squares arranged in 8 rows of 8', async () => {
    const { container } = await renderBoard()
    const rows = Array.from(container.querySelectorAll('[role="row"]'))

    expect(container.querySelectorAll('[role="grid"]')).toHaveLength(1)
    expect(container.querySelectorAll('[role="gridcell"]')).toHaveLength(BOARD_SIZE * BOARD_SIZE)
    expect(rows).toHaveLength(BOARD_SIZE)
    rows.forEach((row) => expect(row.querySelectorAll('[role="gridcell"]')).toHaveLength(BOARD_SIZE))
  })

  it('alternates dark and light squares along every row and column', async () => {
    const { container } = await renderBoard()
    const shadeAt = (row: number, column: number) => squareAt(container, row, column)?.getAttribute('data-shade')

    for (let row = 0; row < LAST_INDEX; row++) {
      for (let column = 0; column < LAST_INDEX; column++) {
        expect(['dark', 'light']).toContain(shadeAt(row, column))
        expect(shadeAt(row, column)).not.toBe(shadeAt(row, column + 1))
        expect(shadeAt(row, column)).not.toBe(shadeAt(row + 1, column))
      }
    }
  })

  it('shows a light square in the bottom-right and top-left corners', async () => {
    const { container } = await renderBoard()

    expect(squareAt(container, LAST_INDEX, LAST_INDEX)?.getAttribute('data-shade')).toBe('light')
    expect(squareAt(container, 0, 0)?.getAttribute('data-shade')).toBe('light')
  })

  it('sizes the board fluidly as a square with no fixed pixel width', async () => {
    const { container } = await renderBoard()
    const grid = container.querySelector('[role="grid"]')
    const elements = Array.from(container.querySelectorAll('*'))

    expect(grid?.className).toMatch(/(^|\s)w-full(\s|$)/)
    expect(grid?.className).toMatch(/(^|\s)aspect-square(\s|$)/)
    expect(
      elements.filter(
        (element) =>
          FIXED_PIXEL_WIDTH_CLASS.test(element.getAttribute('class') ?? '') ||
          FIXED_PIXEL_WIDTH_STYLE.test(element.getAttribute('style') ?? ''),
      ),
    ).toEqual([])
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderBoard()

    expect(container.querySelector('[role="grid"]')).not.toBeNull()
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders 12 dark checkers on the dark squares of the bottom three rows', async () => {
    const { container } = await renderBoard()
    const checkers = checkersOnBoard(container, 'dark')

    expect(checkers).toHaveLength(12)
    checkers.forEach((checker) => {
      expect(Number(cellOf(checker).dataset.row)).toBeGreaterThanOrEqual(5)
      expect(cellOf(checker).dataset.shade).toBe('dark')
    })
  })

  it('renders 12 light checkers on the dark squares of the top three rows', async () => {
    const { container } = await renderBoard()
    const checkers = checkersOnBoard(container, 'light')

    expect(checkers).toHaveLength(12)
    checkers.forEach((checker) => {
      expect(Number(cellOf(checker).dataset.row)).toBeLessThanOrEqual(2)
      expect(cellOf(checker).dataset.shade).toBe('dark')
    })
  })

  it('renders no checker in rows 3 and 4', async () => {
    const { container } = await renderBoard()
    const middle = [3, 4].flatMap((row) =>
      Array.from(container.querySelectorAll(`[role="gridcell"][data-row="${row}"] [data-checker]`)),
    )

    expect(container.querySelectorAll('[data-checker]')).toHaveLength(24)
    expect(middle).toEqual([])
  })

  it("shows each player's bottom-right corner as a light square with no checker", async () => {
    const { container } = await renderBoard()

    expect(container.querySelectorAll('[data-checker]')).toHaveLength(24)
    ;[squareAt(container, LAST_INDEX, LAST_INDEX), squareAt(container, 0, 0)].forEach((corner) => {
      expect(corner?.getAttribute('data-shade')).toBe('light')
      expect(corner?.querySelector('[data-checker]')).toBeNull()
    })
  })

  it("names the checker in the square's accessible label", async () => {
    const { container } = await renderBoard()

    expect(squareAt(container, 0, 1)?.getAttribute('aria-label')).toMatch(/light checker/)
    expect(squareAt(container, LAST_INDEX, 0)?.getAttribute('aria-label')).toMatch(/dark checker/)
    expect(squareAt(container, 3, 0)?.getAttribute('aria-label')).not.toMatch(/checker/)
  })

  it('has no axe violations with checkers placed', async () => {
    const { container } = await renderBoard()

    expect(container.querySelectorAll('[data-checker]')).toHaveLength(24)
    expect(await axe(container)).toHaveNoViolations()
  })
})
