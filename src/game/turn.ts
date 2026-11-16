import type { Position } from './board'
import { FIRST_TO_MOVE, PLAYER_SIDE } from './matchUp'
import { isMovableBy, moveChecker } from './moves'
import { checkerAt, startingCheckers, type Checker, type Side } from './pieces'

export interface MatchState {
  checkers: Checker[]
  sideToMove: Side
}

export function opponentOf(side: Side): Side {
  return side === 'dark' ? 'light' : 'dark'
}

export function startingMatch(): MatchState {
  return { checkers: startingCheckers(), sideToMove: FIRST_TO_MOVE }
}

export function isPlayersTurn({ sideToMove }: MatchState): boolean {
  return sideToMove === PLAYER_SIDE
}

/** Moves the mover's checker a legal step and passes the turn; throws RangeError on an illegal step or another side's checker. */
export function playStep(match: MatchState, from: Position, to: Position): MatchState {
  const mover = checkerAt(match.checkers, from)
  if (mover && !isMovableBy(mover, match.sideToMove)) {
    throw new RangeError(`It is ${match.sideToMove}'s turn; the checker at ${from.row},${from.column} is ${mover.side}`)
  }
  return { checkers: moveChecker(match.checkers, from, to), sideToMove: opponentOf(match.sideToMove) }
}
