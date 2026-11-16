import { useEffect, useReducer } from 'react'
import { nextPhase, type GamePhase } from '../game/gamePhase'

export const REVEAL_DURATION_MS = 200

export function useGamePhase() {
  const [phase, dispatch] = useReducer(nextPhase, 'awaiting-start' as GamePhase)

  useEffect(() => {
    if (phase !== 'revealing') return
    const timer = setTimeout(() => dispatch('reveal-complete'), REVEAL_DURATION_MS)
    return () => clearTimeout(timer)
  }, [phase])

  return { phase, start: () => dispatch('start') }
}
