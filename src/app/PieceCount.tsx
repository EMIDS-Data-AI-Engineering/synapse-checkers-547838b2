import { PLAYER_SIDE } from '../game/matchUp'
import { liveCountOf, opponentOf, type Checker, type Side } from '../game/pieces'

const SIDE_LABEL: Record<Side, string> = { dark: 'You (Dark)', light: 'Computer (Light)' }

function SideCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-3 py-2">
      <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
      <span aria-live="polite" data-piece-count className="text-xl font-bold">
        {count}
      </span>
    </div>
  )
}

export function PieceCount({ checkers }: { checkers: Checker[] }) {
  const sides: Side[] = [PLAYER_SIDE, opponentOf(PLAYER_SIDE)]
  return (
    <div
      role="region"
      aria-label="Piece counts"
      className="mx-auto mb-2 flex w-full max-w-[min(36rem,80dvh)] overflow-hidden rounded-lg border-2 border-ink bg-paper text-ink"
    >
      {sides.map((side) => (
        <SideCount key={side} label={SIDE_LABEL[side]} count={liveCountOf(checkers, side)} />
      ))}
    </div>
  )
}

export default PieceCount
