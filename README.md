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

The board is a fluid square (`w-full aspect-square`, no pixel widths), so it should not overflow horizontally; unit tests check that structure. A live browser check at 1440, 768, 375 and 375x500 has not yet been recorded here.
