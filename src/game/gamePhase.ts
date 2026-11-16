export type GamePhase = 'awaiting-start' | 'revealing' | 'playing'
export type GameEvent = 'start' | 'reveal-complete'

const TRANSITIONS: Record<GamePhase, Partial<Record<GameEvent, GamePhase>>> = {
  'awaiting-start': { start: 'revealing' },
  revealing: { 'reveal-complete': 'playing' },
  playing: {},
}

/** An event that does not apply to the current phase leaves it unchanged. */
export function nextPhase(phase: GamePhase, event: GameEvent): GamePhase {
  return TRANSITIONS[phase][event] ?? phase
}
