import { act, fireEvent, render } from '@testing-library/react'
import { createElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Board } from './Board'

const UNDER_MS = 200
const CELL = 100
const BOARD_EDGE = CELL * 8

async function loadSettleMs() {
  const loaders = import.meta.glob('./useSnapSettle.ts')
  const { SNAP_SETTLE_MS } = (await loaders['./useSnapSettle.ts']()) as typeof import('./useSnapSettle')
  return SNAP_SETTLE_MS
}

function renderBoardWithSnappedMove() {
  const view = render(createElement(Board, { canMove: true }))
  const grid = view.container.querySelector('[role="grid"]') as HTMLElement
  grid.getBoundingClientRect = () =>
    ({ left: 0, top: 0, right: BOARD_EDGE, bottom: BOARD_EDGE, width: BOARD_EDGE, height: BOARD_EDGE }) as DOMRect
  const disc = view.container.querySelector('[data-row="5"][data-column="2"] [data-checker]') as HTMLElement
  fireEvent.pointerDown(disc, { clientX: 250, clientY: 550, button: 0, isPrimary: true })
  fireEvent.pointerUp(window, { clientX: 270, clientY: 450 })
  return view
}

describe('useSnapSettle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('settle duration is under 200 milliseconds', async () => {
    const settleMs = await loadSettleMs()

    expect(settleMs).toBeGreaterThan(0)
    expect(settleMs).toBeLessThan(UNDER_MS)
  })

  it('clears the settle once the settle duration has passed', async () => {
    const settleMs = await loadSettleMs()
    const { container } = renderBoardWithSnappedMove()
    expect(container.querySelector('[data-settling]')).not.toBeNull()

    act(() => {
      vi.advanceTimersByTime(settleMs)
    })

    expect(container.querySelector('[data-settling]')).toBeNull()
  })

  it('clears the pending settle timer on unmount', async () => {
    await loadSettleMs()
    const { unmount } = renderBoardWithSnappedMove()
    expect(vi.getTimerCount()).toBeGreaterThan(0)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
