import { useCallback, useEffect, useState } from 'react'
import type { Position } from '../game/board'
import type { ClientPoint } from './pointToSquare'

export const SNAP_SETTLE_MS = 150

export interface Settle {
  square: Position
  offset: ClientPoint
}

export function useSnapSettle() {
  const [settle, setSettle] = useState<Settle | undefined>()

  useEffect(() => {
    if (!settle) return
    const timer = setTimeout(() => setSettle(undefined), SNAP_SETTLE_MS)
    return () => clearTimeout(timer)
  }, [settle])

  const startSettle = useCallback((square: Position, offset: ClientPoint) => setSettle({ square, offset }), [])

  return { settle, startSettle }
}
