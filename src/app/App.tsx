import './app.css'
import { toCssCustomProperties } from '../theme/tokens'

export function App() {
  return (
    <div className="app" style={toCssCustomProperties()}>
      <header className="app__header">
        <h1>Checkers</h1>
      </header>
      <main className="app__main">
        <section className="app__game" aria-label="Game board" />
      </main>
    </div>
  )
}
