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
