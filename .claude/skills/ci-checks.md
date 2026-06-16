---
name: ci-checks
description: Run the full pre-PR checklist locally — type-check, lint, and production build. Use before raising a PR or when asked to verify nothing is broken.
---

These are the same steps CI runs on every push. Run them in order; stop and fix on the first failure.

```bash
cd "C:\Users\Raghupathy\Documents\work\repos\my-learnings-cheatsheets"

# 1. Clean install — catches undeclared dependencies
npm ci

# 2. Type errors
npx tsc --noEmit

# 3. Lint (max-warnings 0 means any warning is a failure)
npm run lint

# 4. Production build — must succeed before opening a PR
npm run build
```

All four must exit 0. The build step also runs `tsc` internally, so a
type error will surface there too — but run `tsc --noEmit` first to get
cleaner error messages.

## Expected output

- `npm ci` — no output on success; exits 0
- `npx tsc --noEmit` — no output on success; exits 0
- `npm run lint` — prints the ESLint banner then exits 0 with no findings
- `npm run build` — prints Vite's bundle summary ending with `✓ built in Xs`

The build will emit a chunk-size warning about KaTeX fonts exceeding 500 kB.
This is pre-existing and expected — it is not a failure.

## Fixing common issues

| Symptom | Fix |
|---|---|
| `Cannot find module '...'` in tsc | Run `npm ci` first; the dep may be missing |
| ESLint `react-hooks/exhaustive-deps` | Add the missing dep to the `useEffect`/`useCallback` array |
| Unused import warning | Remove the import or add it to the relevant JSX |
| Build fails on tsc but `tsc --noEmit` passed | The Vite build uses a stricter tsconfig — check `tsconfig.json` vs `tsconfig.node.json` |
