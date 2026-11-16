# synapse-checkers-547838b2

Single-page application shell for Checkers (Vite + React + TypeScript + Tailwind).

- `npm install` – install dependencies
- `npm run dev` – dev server
- `npm run build` – type check and produce the static bundle in `dist/`
- `npm test` – run the test suite
- `npm run coverage` – run the suite with v8 coverage

## Layout verification

Checked live in headless Chromium against `npm run build` + `npm run preview` at 320, 375, 768, 1440 and 1920 px wide and at 375x500: document scroll width equals the viewport width at every size (no horizontal overflow), the heading sits fully inside the viewport, and the 375x500 page is not clipped.

### Board layout

The board is a fluid square (`w-full aspect-square`, no pixel widths); unit tests check that structure.

Checked live in headless Chromium against `npm run build` + `npm run preview`. At every size document `scrollWidth` equals `clientWidth` (no horizontal scroll) and all 64 squares lie inside the viewport width:

| Viewport | scrollWidth / clientWidth | Squares inside viewport | Board size |
| --- | --- | --- | --- |
| 1440x900 | 1440 / 1440 | 64 / 64 | 576x576 |
| 768x1024 | 768 / 768 | 64 / 64 | 576x576 |
| 375x812 | 375 / 375 | 64 / 64 | 343x343 |
| 375x500 | 375 / 375 | 64 / 64 | 343x343 |

### Checker layout

Checked live in headless Chromium (Playwright) against `npm run build` + `npm run preview`. Each `[data-checker]` disc was measured against its own square's bounding box:

| Viewport | Checkers visible | Checkers inside their square | Smallest disc | scrollWidth / clientWidth |
| --- | --- | --- | --- | --- |
| 1440x900 | 24 / 24 | 24 / 24 | 57px | 1440 / 1440 |
| 768x1024 | 24 / 24 | 24 / 24 | 57px | 768 / 768 |
| 375x812 | 24 / 24 | 24 / 24 | 34px | 375 / 375 |
| 375x500 | 24 / 24 | 24 / 24 | 34px | 375 / 375 |

At 375x500 the full-page screenshot shows the heading and the whole board with 12 light checkers on the top three rows and 12 dark checkers on the bottom three, and nothing is clipped (document height 500 equals the viewport height, so no content is cut off). The middle two rows are empty and the bottom-right squares at (7,7) and (0,0) are light and empty.

### Game Start overlay

The overlay sits in the same grid cell as the board, so the populated board is rendered beneath it from the first frame. Start fades the overlay out over `REVEAL_DURATION_MS` (200 ms, under one second) and then removes it. Unit tests cover the timing and that the board stays mounted throughout. Checked live in headless Chromium (Playwright) against `npm run build` + `npm run preview`. At each viewport the overlay card, with its Start Game button, sat fully inside the board area; the page never scrolled sideways, and at 375x500 the document height was 500 (the card fits within the 343 px board, so nothing is clipped). Clicking Start sampled every animation frame: all 24 checkers stayed rendered and non-empty in every frame (no blank screen), the overlay was gone after about 250 ms (under one second), and focus landed on a board `gridcell`.

| Viewport | Overlay shown | Start button inside the viewport | Checkers rendered in every frame | Overlay gone after | Focus after Start | scrollWidth / clientWidth |
| --- | --- | --- | --- | --- | --- | --- |
| 1440x900 | yes | yes | 24 / 24 | ~257 ms | gridcell | 1440 / 1440 |
| 768x1024 | yes | yes | 24 / 24 | ~242 ms | gridcell | 768 / 768 |
| 375x812 | yes | yes | 24 / 24 | ~250 ms | gridcell | 375 / 375 |
| 375x500 | yes | yes | 24 / 24 | ~256 ms | gridcell | 375 / 375 |

The fade's class names, its `transitionDuration` (taken from `REVEAL_DURATION_MS`) and the reduced-motion rule are asserted in `GameStartOverlay.fade.test.tsx`.

## Drag

Dark checkers can be dragged with the pointer once the game is in the `playing` phase. A drop on an empty dark square one step diagonally forward snaps the checker there; any other drop, or a cancelled pointer, returns it to its origin. Jumps, kings and keyboard moves are not part of this story.

Checked live in headless Chromium (Playwright) against `npm run build` + `npm run preview`, driving the real mouse. At every viewport the pressed checker followed the cursor exactly (its centre moved by the pointer delta), carried `data-dragging` and `touch-action: none`, and a drop on a legal forward diagonal square snapped it there with no transform or marker left. A drop on a light square returned it to its origin with no `data-dragging`, `role=alert` or `aria-invalid` on the board. The page never scrolled sideways.

| Viewport | Follows cursor | Legal drop snaps | Illegal drop returns | Error state left | touch-action while dragging | scrollWidth / clientWidth |
| --- | --- | --- | --- | --- | --- | --- |
| 1440x900 | yes | yes | yes | none | none | 1440 / 1440 |
| 768x1024 | yes | yes | yes | none | none | 768 / 768 |
| 375x812 | yes | yes | yes | none | none | 375 / 375 |
| 375x500 | yes | yes | yes | none | none | 375 / 375 |

Known gap, to be raised as a follow-up story: WCAG 2.2 SC 2.5.7 (Dragging Movements) asks for a single-pointer alternative, and keyboard users cannot move a piece. The mockup's click-a-piece-then-click-a-highlighted-square interaction, with legal-move highlighting, would close it. No criterion of this story requires it.

## Turn rule

Regular checkers move one step diagonally forward onto an empty dark square; any other drop returns the checker to its origin and keeps the turn. A legal move passes the turn to the computer (`src/game/turn.ts`). Kings do not exist yet, so every piece is treated as a regular piece. No computer opponent exists yet, so the turn stays with the computer after the player's move.
