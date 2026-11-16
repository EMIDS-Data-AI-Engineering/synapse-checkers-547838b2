import { useEffect, useRef } from 'react'
import { Board } from './Board'
import { GameStartOverlay } from './GameStartOverlay'
import { REVEAL_DURATION_MS, useGamePhase } from './useGamePhase'

export function GameScreen() {
  const { phase, start } = useGamePhase()
  const boardRef = useRef<HTMLDivElement>(null)
  const isStarted = phase !== 'awaiting-start'

  useEffect(() => {
    const wrapper = boardRef.current
    if (!wrapper) return
    if (!isStarted) {
      wrapper.setAttribute('inert', '')
      return
    }
    wrapper.removeAttribute('inert')
    wrapper.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]')?.focus()
  }, [isStarted])

  return (
    <div className="grid">
      <div ref={boardRef} className="col-start-1 row-start-1">
        <Board />
      </div>
      {phase !== 'playing' && (
        <GameStartOverlay onStart={start} isLeaving={isStarted} fadeDurationMs={REVEAL_DURATION_MS} />
      )}
    </div>
  )
}

export default GameScreen
