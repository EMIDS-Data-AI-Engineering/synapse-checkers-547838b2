import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GameStartOverlay } from './GameStartOverlay'
import { REVEAL_DURATION_MS } from './useGamePhase'

const ONE_SECOND_MS = 1000

function renderOverlay(isLeaving: boolean) {
  const { container } = render(
    <GameStartOverlay onStart={() => {}} isLeaving={isLeaving} fadeDurationMs={REVEAL_DURATION_MS} />,
  )
  return container.querySelector('section') as HTMLElement
}

describe('Game Start overlay fade', () => {
  it('is fully opaque and interactive before the game starts', () => {
    const overlay = renderOverlay(false)
    expect(overlay).toHaveClass('opacity-100')
    expect(overlay).not.toHaveClass('pointer-events-none')
    expect(overlay).not.toHaveAttribute('aria-hidden')
  })

  it('fades to transparent, stops taking clicks and hides from assistive tech when leaving', () => {
    const overlay = renderOverlay(true)
    expect(overlay).toHaveClass('opacity-0', 'pointer-events-none')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
  })

  it('transitions opacity for exactly the reveal duration, under one second', () => {
    const overlay = renderOverlay(true)
    expect(overlay).toHaveClass('transition-opacity')
    expect(overlay.style.transitionDuration).toBe(`${REVEAL_DURATION_MS}ms`)
    expect(REVEAL_DURATION_MS).toBeLessThan(ONE_SECOND_MS)
  })

  it('drops the transition for people who prefer reduced motion', () => {
    expect(renderOverlay(true)).toHaveClass('motion-reduce:transition-none')
  })

  it('keeps the Start Game button reachable until the overlay leaves', () => {
    renderOverlay(false)
    expect(screen.getByRole('button', { name: 'Start Game' })).toBeEnabled()
  })
})
