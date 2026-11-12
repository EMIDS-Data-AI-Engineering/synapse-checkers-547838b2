import { act } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function documentWithRoot(): Document {
  const page = document.implementation.createHTMLDocument('test')
  const root = page.createElement('div')
  root.id = 'root'
  page.body.appendChild(root)
  return page
}

// import.meta.glob keeps this file loadable before the module exists
const mountModules = import.meta.glob('./mountApplication.ts')

async function loadMountApplication() {
  const loaded = (await mountModules['./mountApplication.ts']()) as typeof import('./mountApplication')
  return loaded.mountApplication
}

describe('mountApplication', () => {
  it('renders the application into the root element', async () => {
    const mountApplication = await loadMountApplication()
    const page = documentWithRoot()

    await act(async () => {
      mountApplication(page)
    })

    // A detached document has no window, so Testing Library's queries cannot run against it.
    const heading = page.querySelector('#root h1')
    expect(heading?.textContent).toBe('Checkers')
  })

  it('throws a descriptive error when the root element is missing', async () => {
    const mountApplication = await loadMountApplication()
    const emptyPage = document.implementation.createHTMLDocument('empty')

    expect(() => mountApplication(emptyPage)).toThrow(/root/i)
  })
})
