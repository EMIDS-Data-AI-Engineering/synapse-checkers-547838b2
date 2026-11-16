import { fireEvent, render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it, vi } from 'vitest'

async function renderOverlay(onStart: () => void = () => {}) {
  const loaders = import.meta.glob('./GameStartOverlay.tsx')
  const module = (await loaders['./GameStartOverlay.tsx']()) as {
    default?: (props: { onStart: () => void }) => JSX.Element
    GameStartOverlay?: (props: { onStart: () => void }) => JSX.Element
  }
  const GameStartOverlay = module.default ?? module.GameStartOverlay!
  return render(<GameStartOverlay onStart={onStart} />)
}

describe('Game Start overlay', () => {
  it('shows exactly one Start Game button', async () => {
    const { container } = await renderOverlay()

    const buttons = Array.from(container.querySelectorAll('button'))
    expect(buttons).toHaveLength(1)
    expect(buttons[0].textContent?.trim()).toBe('Start Game')
  })

  it('states that the player controls the dark pieces and moves first', async () => {
    const { container } = await renderOverlay()

    expect(container.textContent).toContain('You control the dark pieces')
    expect(container.textContent).toContain('Dark moves first, so you go first')
  })

  it('presents You versus Computer with each side\'s colour named in text', async () => {
    const { container } = await renderOverlay()

    expect(container.textContent).toMatch(/You \(Dark\)/)
    expect(container.textContent).toMatch(/Computer \(Light\)/)
  })

  it('announces the start of the game with one h2 heading', async () => {
    const { container } = await renderOverlay()

    expect(container.querySelectorAll('h2')).toHaveLength(1)
    expect(container.querySelector('h2')?.textContent?.trim()).not.toBe('')
  })

  it('calls onStart when Start Game is clicked', async () => {
    const onStart = vi.fn()
    const { getByRole } = await renderOverlay(onStart)

    fireEvent.click(getByRole('button', { name: 'Start Game' }))

    expect(onStart).toHaveBeenCalledTimes(1)
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderOverlay()

    expect(await axe(container)).toHaveNoViolations()
  })
})
