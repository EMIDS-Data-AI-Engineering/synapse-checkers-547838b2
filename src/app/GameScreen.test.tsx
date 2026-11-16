import { act, fireEvent, render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const CHECKERS_PER_SIDE = 12

async function renderGameScreen() {
  const loaders = import.meta.glob('./GameScreen.tsx')
  const module = (await loaders['./GameScreen.tsx']()) as {
    default?: () => JSX.Element
    GameScreen?: () => JSX.Element
  }
  const GameScreen = module.default ?? module.GameScreen!
  return render(<GameScreen />)
}

async function revealDuration() {
  const loaders = import.meta.glob('./useGamePhase.ts')
  const { REVEAL_DURATION_MS } = (await loaders['./useGamePhase.ts']()) as typeof import('./useGamePhase')
  return REVEAL_DURATION_MS
}

const overlay = (container: HTMLElement) => container.querySelector('section[aria-labelledby]')
const board = (container: HTMLElement) => container.querySelector('[role="grid"]')

async function finishReveal() {
  const duration = await revealDuration()
  await act(() => vi.advanceTimersByTimeAsync(duration))
}

function clickStart() {
  fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))
}

describe('GameScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows the Game Start overlay over the board when the page loads', async () => {
    const { container } = await renderGameScreen()

    expect(overlay(container)).not.toBeNull()
    expect(screen.getAllByRole('button', { name: 'Start Game' })).toHaveLength(1)
  })

  it('renders the populated board beneath the overlay before Start is clicked', async () => {
    const { container } = await renderGameScreen()

    expect(board(container)).not.toBeNull()
    expect(container.querySelectorAll('[data-checker]')).toHaveLength(CHECKERS_PER_SIDE * 2)
  })

  it('keeps the board out of the tab order until the game starts', async () => {
    const { container } = await renderGameScreen()
    const boardWrapper = () => board(container)!.closest('[inert]')

    expect(boardWrapper()).not.toBeNull()

    clickStart()
    await finishReveal()

    expect(board(container)!.closest('[inert]')).toBeNull()
  })

  it('removes the overlay after Start Game is clicked', async () => {
    const { container } = await renderGameScreen()

    clickStart()
    await finishReveal()

    expect(overlay(container)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Start Game' })).toBeNull()
  })

  it('leaves all 24 checkers visible after the overlay is dismissed', async () => {
    const { container } = await renderGameScreen()

    clickStart()
    await finishReveal()

    expect(container.querySelectorAll('[data-checker="dark"]')).toHaveLength(CHECKERS_PER_SIDE)
    expect(container.querySelectorAll('[data-checker="light"]')).toHaveLength(CHECKERS_PER_SIDE)
  })

  it('moves focus to the board when the game starts', async () => {
    const { container } = await renderGameScreen()

    clickStart()
    await finishReveal()

    expect(board(container)!.contains(document.activeElement)).toBe(true)
    expect(document.activeElement).toHaveAttribute('role', 'gridcell')
  })

  it('keeps the board rendered at every phase of the reveal', async () => {
    const { container } = await renderGameScreen()
    const duration = await revealDuration()
    expect(board(container)).not.toBeNull()

    clickStart()
    expect(board(container)).not.toBeNull()
    expect(overlay(container)).toHaveAttribute('aria-hidden', 'true')

    await act(() => vi.advanceTimersByTimeAsync(duration - 1))
    expect(board(container)).not.toBeNull()

    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(board(container)).not.toBeNull()
  })

  it('finishes the reveal within the configured duration', async () => {
    const { container } = await renderGameScreen()
    const duration = await revealDuration()

    clickStart()
    await act(() => vi.advanceTimersByTimeAsync(duration - 1))
    expect(overlay(container)).not.toBeNull()

    await act(() => vi.advanceTimersByTimeAsync(1))
    expect(overlay(container)).toBeNull()
    expect(duration).toBeLessThan(1000)
  })

  it('has no accessibility violations after the game starts', async () => {
    const { container } = await renderGameScreen()

    clickStart()
    await finishReveal()
    vi.useRealTimers()

    expect(await axe(container)).toHaveNoViolations()
  })
})
