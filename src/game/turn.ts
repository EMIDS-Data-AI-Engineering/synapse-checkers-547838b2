import type { Position } from './board'
import { FIRST_TO_MOVE, PLAYER_SIDE } from './matchUp'
import { moveChecker } from './moves'
import { startingCheckers, type Checker, type Side } from './pieces'

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

/** Moves one checker a legal step and passes the turn; throws RangeError on an illegal step. */
export function playStep(match: MatchState, from: Position, to: Position): MatchState {
  return { checkers: moveChecker(match.checkers, from, to), sideToMove: opponentOf(match.sideToMove) }
}
