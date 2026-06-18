# Local run & 508 accessibility verification (NCIATWP-9363)

The two pages fixed for this ticket — **Home** and **API Access** — are entirely
client-side, so you only need the React client running to see the fixes. (The
full backend additionally requires MySQL + Redis; it is not needed for these
pages.)

## Run the client

```bash
cd client
npm install          # first time only
npm start            # serves http://localhost:3000  (hash-routed)
```

- Home:       <http://localhost:3000/#/>
- API Access: <http://localhost:3000/#/api-access>

## Run the accessibility audit

With the client running, in this folder:

```bash
npm install          # first time only (puppeteer-core + axe-core)
npm run audit
```

It launches headless Chrome/Edge, injects **axe-core** (the same engine the NCI
508 report uses), expands every Swagger operation + "Try it out", and prints
WCAG 2.0/2.1 A & AA violations for both pages. Expected result after the fixes:
`PASS: 0 WCAG A/AA violations`.

Override the browser with `CHROME=/path/to/browser npm run audit`.

## What was fixed and how to see it

| Ticket finding | Where | How to verify by hand |
| --- | --- | --- |
| **Interactive controls must not be nested** (Home, 3) | `client/src/components/pages/home/home.js` | Each card's action button is now a single link styled as a button (`<a class="btn">`), not a `<button>` wrapping a `<a>`. Inspect a card footer in DevTools. |
| **select element has an accessible name** (API Access) | `client/src/components/controls/swagger-ui/swagger-ui.js` | Expand an operation → Try it out. Every parameter dropdown now has an `aria-label` (its parameter name). |
| **Buttons must have discernible text** (API Access) | same wrapper | Any icon-only Swagger button gets an `aria-label`. |
| **Scrollable region must have keyboard access** (API Access) | same wrapper | Code/example blocks (`.highlight-code`, `.microlight`, `pre`) are now `tabindex="0"` + `role="region"`, so they're reachable and scrollable with the keyboard. |
| **Lists must be structured correctly** (API Access) | `client/src/components/pages/api-access/api-access.js` | The `/api/metadata` description list no longer renders stray `<br>` elements as direct `<ul>` children. |
| **Color contrast** (API Access) | `client/src/components/pages/api-access/api-access.scss` | Swagger's low-contrast text (notably the red **Cancel** button) is darkened to meet AA 4.5:1. |
