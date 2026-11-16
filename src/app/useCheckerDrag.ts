import { useCallback, useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Position } from '../game/board'
import { PLAYER_SIDE } from '../game/matchUp'
import { isLegalStep, isMovableBy } from '../game/moves'
import { checkerAt, type Checker } from '../game/pieces'
import type { ClientPoint } from './pointToSquare'
import { landingOffset, snapTarget } from './snapToSquare'

export interface DragState {
  origin: Position
  grabPoint: ClientPoint
  offset: ClientPoint
}

interface DragOptions {
  checkers: Checker[]
  canMove: boolean
  getBoardRect: () => DOMRect | undefined
  onMove: (from: Position, to: Position, landing: ClientPoint) => void
}

const NO_OFFSET: ClientPoint = { x: 0, y: 0 }
const pointOf = (event: { clientX: number; clientY: number }): ClientPoint => ({ x: event.clientX, y: event.clientY })

export function useCheckerDrag({ checkers, canMove, getBoardRect, onMove }: DragOptions) {
  const [drag, setDrag] = useState<DragState | undefined>()

  const startDrag = useCallback(
    (origin: Position, event: ReactPointerEvent) => {
      const checker = checkerAt(checkers, origin)
      if (!canMove || !checker || !isMovableBy(checker, PLAYER_SIDE)) return
      setDrag({ origin, grabPoint: pointOf(event), offset: NO_OFFSET })
    },
    [checkers, canMove],
  )

  const origin = drag?.origin
  const grabPoint = drag?.grabPoint

  useEffect(() => {
    if (!origin || !grabPoint) return
    const follow = (event: PointerEvent) => {
      const point = pointOf(event)
      setDrag({ origin, grabPoint, offset: { x: point.x - grabPoint.x, y: point.y - grabPoint.y } })
    }
    const release = (event: PointerEvent) => {
      const rect = getBoardRect()
      const releasePoint = pointOf(event)
      const target = rect && snapTarget(releasePoint, rect)
      setDrag(undefined)
      if (rect && target && isLegalStep(checkers, origin, target)) onMove(origin, target, landingOffset(releasePoint, target, rect))
    }
    const cancel = () => setDrag(undefined)
    window.addEventListener('pointermove', follow)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', cancel)
    return () => {
      window.removeEventListener('pointermove', follow)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', cancel)
    }
  }, [origin, grabPoint, checkers, getBoardRect, onMove])

  return { drag, startDrag }
}
