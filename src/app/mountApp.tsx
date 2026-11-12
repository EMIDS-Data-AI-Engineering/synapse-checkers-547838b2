import { createRoot } from 'react-dom/client'
import { App } from './App'

export class MissingRootElementError extends Error {
  constructor() {
    super('Cannot mount the application: the #root element is missing from the page.')
    this.name = 'MissingRootElementError'
  }
}

export function mountApp(rootElement: HTMLElement | null): void {
  if (rootElement === null) throw new MissingRootElementError()
  createRoot(rootElement).render(<App />)
}
