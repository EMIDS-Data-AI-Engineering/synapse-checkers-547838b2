import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import type { Checker } from '../game/pieces'

const darkAt = (row: number, column: number): Checker => ({ row, column, side: 'dark' })
const lightAt = (row: number, column: number): Checker => ({ row, column, side: 'light' })
const CHECKERS = [darkAt(5, 0), darkAt(5, 2), darkAt(5, 4), lightAt(0, 1), lightAt(0, 3)]

async function renderCount(checkers: Checker[]) {
  const loaders = import.meta.glob('./PieceCount.tsx')
  const { PieceCount } = (await loaders['./PieceCount.tsx']()) as typeof import('./PieceCount')
  return render(<PieceCount checkers={checkers} />)
}

function countLabelled(container: HTMLElement, label: string): string | null | undefined {
  let node: HTMLElement | null = Array.from(container.querySelectorAll<HTMLElement>('*')).find(
    (element) => element.children.length === 0 && element.textContent?.trim() === label,
  ) ?? null
  while (node && !node.querySelector('[data-piece-count]')) node = node.parentElement
  return node?.querySelector('[data-piece-count]')?.textContent
}

describe('PieceCount', () => {
  it('shows the live count for the player and the computer', async () => {
    const { container, getByRole } = await renderCount(CHECKERS)

    expect(getByRole('region', { name: 'Piece counts' })).toBeInTheDocument()
    expect(countLabelled(container, 'You (Dark)')).toBe('3')
    expect(countLabelled(container, 'Computer (Light)')).toBe('2')
  })

  it('announces count changes through polite live regions', async () => {
    const { container } = await renderCount(CHECKERS)

    expect(container.querySelectorAll('[data-piece-count][aria-live="polite"]')).toHaveLength(2)
  })

  it('shows zero for a side with no checkers', async () => {
    const { container } = await renderCount([darkAt(5, 0)])

    expect(countLabelled(container, 'Computer (Light)')).toBe('0')
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderCount(CHECKERS)

    expect(await axe(container)).toHaveNoViolations()
  })
})
