import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { describe, expect, it } from 'vitest'

// import.meta.glob keeps this file loadable before App.tsx exists
const applicationModules = import.meta.glob('./App.tsx')

async function renderApp() {
  const { App } = (await applicationModules['./App.tsx']()) as typeof import('./App')
  return render(<App />)
}

describe('App', () => {
  it('renders the game heading and main landmark immediately on load', async () => {
    await renderApp()

    expect(screen.getByRole('heading', { level: 1, name: 'Checkers' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('shows no sign-up prompt, dialog or splash screen', async () => {
    await renderApp()

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByRole('alertdialog')).toBeNull()
    expect(screen.queryByRole('progressbar')).toBeNull()
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(screen.queryByText(/sign[ -]?up|log ?in|register|loading/i)).toBeNull()
  })

  it('has a labelled game region for the board to fill', async () => {
    await renderApp()

    expect(screen.getByRole('region', { name: /game/i })).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderApp()

    expect(await axe(container)).toHaveNoViolations()
  })
})
