import { act } from 'react'
import { describe, expect, it } from 'vitest'

const loadMountApp = async () => {
  const loaders = import.meta.glob('./mountApp.tsx')
  return (await loaders['./mountApp.tsx']()) as typeof import('./mountApp')
}

describe('mountApp', () => {
  it('renders the application into the root element', async () => {
    const { mountApp } = await loadMountApp()
    const rootElement = document.createElement('div')
    document.body.appendChild(rootElement)

    await act(async () => {
      mountApp(rootElement)
    })

    expect(rootElement.querySelector('h1')).not.toBeNull()
    expect(rootElement.querySelector('main')).not.toBeNull()
  })

  it('fails loudly when the root element is missing', async () => {
    const { mountApp } = await loadMountApp()

    expect(() => mountApp(null)).toThrow()
  })
})
