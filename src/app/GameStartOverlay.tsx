import { COMPUTER_SIDE, FIRST_TO_MOVE, PLAYER_SIDE } from '../game/matchUp'
import type { Side } from '../game/pieces'

const SWATCH_CLASS: Record<Side, string> = {
  dark: 'bg-checker-dark',
  light: 'bg-checker-light',
}

const SIDE_NAME: Record<Side, string> = { dark: 'Dark', light: 'Light' }

function Contestant({ who, side }: { who: string; side: Side }) {
  return (
    <p className="flex items-center gap-2 font-semibold">
      <span aria-hidden="true" className={`inline-block h-8 w-8 rounded-full border-2 border-ink ${SWATCH_CLASS[side]}`} />
      {who} ({SIDE_NAME[side]})
    </p>
  )
}

interface Props {
  onStart: () => void
  isLeaving?: boolean
  fadeDurationMs?: number
}

export function GameStartOverlay({ onStart, isLeaving = false, fadeDurationMs = 0 }: Props) {
  const playerName = SIDE_NAME[PLAYER_SIDE].toLowerCase()
  return (
    <section
      aria-labelledby="game-start-title"
      aria-hidden={isLeaving || undefined}
      style={{ transitionDuration: `${fadeDurationMs}ms` }}
      className={`col-start-1 row-start-1 z-10 flex items-center justify-center bg-paper/80 p-4 transition-opacity motion-reduce:transition-none ${
        isLeaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-xs rounded-lg border-2 border-ink bg-paper p-6 text-center shadow-lg">
        <h2 id="game-start-title" className="text-2xl font-bold">Ready to play?</h2>
        <div className="my-4 flex flex-col items-center gap-2">
          <Contestant who="You" side={PLAYER_SIDE} />
          <Contestant who="Computer" side={COMPUTER_SIDE} />
        </div>
        <p className="font-semibold">You control the {playerName} pieces</p>
        <p className="mb-4">{SIDE_NAME[FIRST_TO_MOVE]} moves first, so you go first</p>
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-md bg-accent px-6 py-3 text-lg font-bold text-paper focus:outline-3 focus:outline-offset-2 focus:outline-accent"
        >
          Start Game
        </button>
      </div>
    </section>
  )
}

export default GameStartOverlay
