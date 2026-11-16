import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'
import type { Side } from '../game/pieces'

async function renderIndicator(sideToMove: Side) {
  const loaders = import.meta.glob('./TurnIndicator.tsx')
  const module = (await loaders['./TurnIndicator.tsx']()) as typeof import('./TurnIndicator')
  const { TurnIndicator } = module
  return render(<TurnIndicator sideToMove={sideToMove} />)
}

describe('TurnIndicator', () => {
  it('announces the player\'s turn', async () => {
    const { container } = await renderIndicator('dark')

    expect(container).toHaveTextContent('Your turn')
  })

  it('announces the computer\'s turn', async () => {
    const { container } = await renderIndicator('light')

    expect(container).toHaveTextContent('Computer\'s turn')
  })

  it('is a polite live region', async () => {
    const { container } = await renderIndicator('dark')

    expect(container.querySelector('[aria-live="polite"]')).not.toBeNull()
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderIndicator('light')

    expect(await axe(container)).toHaveNoViolations()
  })
})
