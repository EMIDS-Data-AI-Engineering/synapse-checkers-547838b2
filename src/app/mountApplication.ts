import { StrictMode, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'

const ROOT_ELEMENT_ID = 'root'

export function mountApplication(page: Document): Root {
  const container = page.getElementById(ROOT_ELEMENT_ID)
  if (!container) {
    throw new Error(`Cannot start the application: no element with id "${ROOT_ELEMENT_ID}" was found`)
  }
  const root = createRoot(container)
  root.render(createElement(StrictMode, null, createElement(App)))
  return root
}
