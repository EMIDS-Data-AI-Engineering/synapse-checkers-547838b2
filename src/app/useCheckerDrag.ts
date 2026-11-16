import { useCallback, useEffect, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { Position } from '../game/board'
import { PLAYER_SIDE } from '../game/matchUp'
import { isLegalStep, isMovableBy } from '../game/moves'
import { checkerAt, type Checker } from '../game/pieces'
import type { ClientPoint } from './pointToSquare'
import { centreOf, landingOffset, snapTarget } from './snapToSquare'

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

/** Where the dragged disc's centre was drawn: its origin centre moved by the pointer's travel since the grab. */
function lastDrawnCentre(rect: DOMRect, origin: Position, grabPoint: ClientPoint, pointer: ClientPoint): ClientPoint {
  const originCentre = centreOf(origin, rect)
  return { x: originCentre.x + pointer.x - grabPoint.x, y: originCentre.y + pointer.y - grabPoint.y }
}

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
      const releasePoint = rect && lastDrawnCentre(rect, origin, grabPoint, pointOf(event))
      const target = rect && releasePoint && snapTarget(releasePoint, rect)
      setDrag(undefined)
      if (rect && releasePoint && target && isLegalStep(checkers, origin, target)) onMove(origin, target, landingOffset(releasePoint, target, rect))
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
