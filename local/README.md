# Local run & 508 accessibility verification (NCIATWP-9363)

The two pages fixed for this ticket — **Home** and **API Access** — are entirely
client-side, so you only need the React client running to see the fixes. (The
full backend additionally requires MySQL + Redis; it is not needed for these
pages.)

## Running the data-backed pages (Phenotypes, etc.)

The Home and API Access pages are client-only. The other pages (Phenotypes,
GWAS, Downloads) call a backend API on `:9000`. With no backend running, those
calls fail and the browser shows a 500 (e.g. `/web/phenotypes`).

**Data source facts:** the app reads all data from **MySQL** — there is no S3
access at runtime (the only S3 usage in the repo is HPC backup scripts under
`database/import/hpc/`). In production the MySQL host is **AWS RDS**; locally we
point the API at a Docker MySQL. The API also gates `/web/*` routes to browser
user-agents, so `curl` must send a browser `User-Agent` to test them.

### Start the backend (MySQL + Redis + API)

```bash
./local/backend.sh        # Docker MySQL+Redis, seed phenotypes, run API (Node 22)
```

This brings up MySQL + Redis (Docker), seeds the `phenotype` tree from
`database/import/phenotype.csv`, and runs the Fastify API with host Node.
`./local/backend.sh down` stops the containers; `reset` also deletes the DB
volume.

> The repo's `docker/backend.dockerfile` (amazonlinux) can't build behind a
> TLS-intercepting corporate proxy, so the API is run with host Node here rather
> than containerized. Node 22 is recommended (Fastify 3 emits deprecation
> warnings but runs).

**Scope of the local seed:**
- `gen-seed.py` seeds the phenotype **tree** (visible + searchable).
- `gen-participant-seed.py` seeds **synthetic participant data** (200
  participants + `phenotype_metadata`) so the **Phenotype Characteristics**
  charts render (Frequency All/Age/Sex/Race) for any leaf phenotype. Leaf
  phenotypes are forced to `binary` for the chart path; the values are random
  synthetic data, not real PLCO results.
- The **GWAS Results** pages (Manhattan/QQ/summary/variant lookup) read the
  large production variant dataset and are **not** seeded locally.

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
