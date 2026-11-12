import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

const EXPECTED_SQUARE_COUNT = 64

describe('App', () => {
  it('renders a checkerboard of 64 squares when the app loads', async () => {
    const loaders = import.meta.glob('./App.tsx')
    const module = (await loaders['./App.tsx']()) as { default?: () => JSX.Element; App?: () => JSX.Element }
    const App = module.default ?? module.App!
    const { container } = render(<App />)

    expect(container.querySelectorAll('main [role="grid"] [role="gridcell"]')).toHaveLength(EXPECTED_SQUARE_COUNT)
  })
})
