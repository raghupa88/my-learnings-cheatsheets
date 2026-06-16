---
name: run-dev
description: Start the Vite dev server for this app. Use when asked to run the app, start the dev server, or launch a local preview.
---

## Start

```bash
cd "C:\Users\Raghupathy\Documents\work\repos\my-learnings-cheatsheets"
npm run dev &
echo $! > /tmp/dev.pid
```

Poll until it serves (Vite is ready in ~1s but SWC compile on first request can add a few seconds):

```bash
timeout 30 bash -c 'until curl -sf http://localhost:5173 >/dev/null 2>&1 || curl -sf http://localhost:5174 >/dev/null 2>&1; do sleep 1; done'
```

Vite uses port **5173** by default. If that port is already in use it bumps to **5174** — check the startup log to confirm:

```bash
grep "Local:" /tmp/vite.log   # shows the actual port
```

To capture the log:

```bash
npm run dev > /tmp/vite.log 2>&1 &
echo $! > /tmp/dev.pid
sleep 4 && grep "Local:" /tmp/vite.log
```

## Routes

| Route | URL |
|---|---|
| D&FX Home | `http://localhost:5173/derivatives-forex` |
| Derivatives | `http://localhost:5173/derivatives-forex/derivatives` |
| Forex | `http://localhost:5173/derivatives-forex/forex` |
| Glossary | `http://localhost:5173/derivatives-forex/glossary` |
| Claude Code | `http://localhost:5173/claude-code` |

Replace `5173` with `5174` if Vite bumped the port.

## Stop

```bash
kill $(cat /tmp/dev.pid) 2>/dev/null || pkill -f 'vite' 2>/dev/null
```

Always stop before relaunching — otherwise the next run hits `EADDRINUSE`.

## Preview the production build

```bash
npm run build && npm run preview
# serves at http://localhost:4173
```
