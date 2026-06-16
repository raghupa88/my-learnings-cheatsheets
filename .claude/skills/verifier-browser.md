---
name: verifier-browser
description: Verify UI changes in this Vite + React app by launching the dev server and taking screenshots with Playwright. Use for any change that affects what renders in the browser.
---

## Handle

No global `chromium-cli` is available. Use `npx playwright screenshot` — it is available via npx without adding it as a project dependency (Playwright browsers are installed at `C:\Users\Raghupathy\AppData\Local\ms-playwright`).

## Setup

Start the dev server (see `run-dev` skill):

```bash
npm run dev > /tmp/vite.log 2>&1 &
echo $! > /tmp/dev.pid
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null 2>&1 || curl -sf http://localhost:5174 >/dev/null 2>&1; do sleep 1; done'
# Determine actual port:
PORT=$(grep -oP '(?<=localhost:)\d+' /tmp/vite.log | head -1)
echo "Dev server on port: $PORT"
```

## Take screenshots

```bash
npx playwright screenshot --browser chromium http://localhost:$PORT/derivatives-forex /tmp/home.png
npx playwright screenshot --browser chromium http://localhost:$PORT/claude-code /tmp/cc.png
npx playwright screenshot --browser chromium --full-page http://localhost:$PORT/claude-code /tmp/cc-full.png
```

Read screenshots with the Read tool to inspect them visually.

## Check dark / light theme

Theme is toggled by the button in the top-right nav (ThemeToggle). To screenshot in light mode, append `?theme=light` — the app does not honour this query param, so instead use a Playwright script:

```bash
node - <<'EOF'
const { chromium } = require(
  require('path').join(
    require('child_process').execSync('npm root -g', {encoding:'utf8'}).trim(),
    'playwright'
  )
);
// ...
EOF
```

**Simpler alternative:** use `npx playwright screenshot` for dark mode (default), and toggle manually in the browser if a light-mode capture is needed. The CSS variables in `src/styles/variables.css` cover both themes — check that no hardcoded colours were added with `grep -r '#[0-9a-fA-F]\{3,6\}' src/`.

## Key things to verify per route

| Route | What to check |
|---|---|
| `/derivatives-forex` | Hero title visible, no stray badge above it, nav shows all links including "Claude Code" |
| `/derivatives-forex/derivatives` | Concept cards render, formula blocks visible |
| `/derivatives-forex/forex` | Same as derivatives |
| `/derivatives-forex/glossary` | Glossary items render, search bar present |
| `/claude-code` | All 12 cheatsheet cards in 3-column grid, no console errors |

## Check for console errors

```bash
node -e "
const { execSync } = require('child_process');
// quick fetch to confirm page returns 200
const res = execSync('curl -sf -o /dev/null -w \"%{http_code}\" http://localhost:$PORT/claude-code');
console.log('HTTP status:', res.toString());
"
```

## Teardown

```bash
kill $(cat /tmp/dev.pid) 2>/dev/null || pkill -f 'vite' 2>/dev/null
```
