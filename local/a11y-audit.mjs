// Section 508 / WCAG 2.0 & 2.1 A/AA audit for the GWAS Explorer pages covered
// by NCIATWP-9363 (Home and API Access). Uses axe-core -- the same engine the
// NCI 508 report is generated with -- driven against the running client via a
// locally installed Chrome/Edge.
//
// Prereqs:  client running (see local/README.md), then in this folder:
//           npm install && npm run audit
// Override browser with CHROME=/path/to/browser, base URL with BASE=...

import { existsSync } from "fs";
import puppeteer from "puppeteer-core";
import axe from "axe-core";

const BASE = process.env.BASE || "http://localhost:3000";
const CANDIDATES = [
  process.env.CHROME,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
].filter(Boolean);
const executablePath = CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("No Chrome/Edge found. Set CHROME=/path/to/browser.");
  process.exit(1);
}

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
const browser = await puppeteer.launch({ executablePath, headless: "new", args: ["--no-sandbox", "--disable-gpu"] });
let total = 0;

async function runAxe(page) {
  await page.evaluate(axe.source);
  return page.evaluate(async (tags) => window.axe.run(document, { runOnly: { type: "tag", values: tags } }), TAGS);
}

function report(name, r) {
  console.log(`\n===== ${name} =====`);
  console.log(`Violations: ${r.violations.length}`);
  total += r.violations.length;
  for (const v of r.violations.sort((a, b) => b.nodes.length - a.nodes.length)) {
    console.log(`  [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length})`);
    v.nodes.slice(0, 5).forEach((n) => console.log(`     - ${n.target.join(" ").slice(0, 80)}`));
  }
}

// Home
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.goto(`${BASE}/#/`, { waitUntil: "networkidle2", timeout: 90000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 4000));
  report("Home", await runAxe(page));
  await page.close();
}

// API Access -- expand every operation and open "Try it out" so the parameter
// selects, code samples and action buttons are all present for the audit.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 1000 });
  await page.goto(`${BASE}/#/api-access`, { waitUntil: "networkidle2", timeout: 90000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, 4000));
  await page.evaluate(() => document.querySelectorAll(".swagger-ui .opblock-summary-control,.swagger-ui .opblock-summary").forEach((x) => x.click()));
  await new Promise((r) => setTimeout(r, 1200));
  await page.evaluate(() => document.querySelectorAll(".swagger-ui .try-out__btn").forEach((x) => x.click()));
  await new Promise((r) => setTimeout(r, 1500));
  report("API Access (expanded + Try it out)", await runAxe(page));
  await page.close();
}

await browser.close();
console.log(`\n=========================================`);
console.log(total === 0 ? "PASS: 0 WCAG A/AA violations." : `FAIL: ${total} violations.`);
process.exit(total === 0 ? 0 : 1);
