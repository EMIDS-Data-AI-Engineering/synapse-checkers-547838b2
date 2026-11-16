import { PLAYER_SIDE } from '../game/matchUp'
import type { Side } from '../game/pieces'

export function TurnIndicator({ sideToMove }: { sideToMove: Side }) {
  const text = sideToMove === PLAYER_SIDE ? 'Your turn' : "Computer's turn"
  return (
    <div aria-live="polite" className="mx-auto mt-2 w-full max-w-[min(36rem,80dvh)] rounded-lg border-2 border-ink bg-square-dark px-3 py-1.5 text-center text-square-light">
      <strong>{text}</strong>
    </div>
  )
}

export default TurnIndicator
