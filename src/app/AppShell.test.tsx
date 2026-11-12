import { render } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

async function renderApp() {
  const loaders = import.meta.glob('./App.tsx')
  const module = (await loaders['./App.tsx']()) as { default?: () => JSX.Element; App?: () => JSX.Element }
  const App = module.default ?? module.App!
  return render(<App />)
}

const FORBIDDEN_FIRST_SCREEN_TEXT = /sign[ -]?up|log[ -]?in|register|create an account|loading/i
const FIXED_PIXEL_WIDTH_CLASS = /(^|\s)(min-|max-)?w-\[\d+px\]/
const FIXED_PIXEL_WIDTH_STYLE = /(^|;|\s)(min-|max-)?width:\s*\d+px/

describe('App shell', () => {
  it('renders the game heading and main area on first render', async () => {
    const { container } = await renderApp()

    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelector('h1')?.textContent?.trim()).not.toBe('')
    expect(container.querySelector('main')).not.toBeNull()
  })

  it('shows no sign-up, login, or splash content', async () => {
    const { container } = await renderApp()

    expect(container.textContent).not.toMatch(FORBIDDEN_FIRST_SCREEN_TEXT)
    expect(container.querySelector('[role="dialog"], dialog, form, input')).toBeNull()
  })

  it('uses a fluid layout with no fixed width', async () => {
    const { container } = await renderApp()
    const elements = Array.from(container.querySelectorAll('*'))

    const fixedWidthElements = elements.filter(
      (element) =>
        FIXED_PIXEL_WIDTH_CLASS.test(element.getAttribute('class') ?? '') ||
        FIXED_PIXEL_WIDTH_STYLE.test(element.getAttribute('style') ?? ''),
    )
    const centersVertically = elements.some((element) =>
      /(^|\s)justify-center(\s|$)/.test(element.getAttribute('class') ?? '') &&
      /(^|\s)(flex-col|min-h-dvh|h-screen)(\s|$)/.test(element.getAttribute('class') ?? ''),
    )

    expect(elements.length).toBeGreaterThan(0)
    expect(fixedWidthElements).toEqual([])
    expect(centersVertically).toBe(false)
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderApp()

    expect(await axe(container)).toHaveNoViolations()
  })
})
