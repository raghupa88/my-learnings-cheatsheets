# CLAUDE.md — Derivatives & Forex Cheatsheet

## Project Overview

A Vite + React + TypeScript single-page application serving as a principal engineer reference for SCB derivatives and forex concepts. It is a **purely static app** (no backend, no API calls, no database). Deployed to Cloudflare Pages via GitHub Actions.

---

## Tech Stack

| Concern | Library / Tool |
|---|---|
| Build | Vite 5, `@vitejs/plugin-react-swc` |
| UI | React 18, React Router v6 (`BrowserRouter`) |
| Formulas | KaTeX |
| Charts | Recharts |
| Styling | CSS custom properties (dark/light theme via `data-theme` on `<html>`) |
| Linting | ESLint 8 + `@typescript-eslint` + `react-hooks` + `react-refresh` |
| Types | TypeScript 5 |

---

## Essential Commands

```bash
npm ci              # clean install — always use this, not npm install
npm run dev         # dev server at http://localhost:5173
npm run build       # production build → dist/
npm run preview     # serve the dist/ build locally
npx tsc --noEmit    # type-check without emitting files
npm run lint        # ESLint across all .ts/.tsx files
```

---

## Before Raising Any PR — Run These in Order

These must all pass locally before pushing. CI enforces the same checks, but catching failures locally saves a round-trip.

```bash
npm ci                 # verify no undeclared dependencies
npx tsc --noEmit       # type errors
npm run lint           # lint errors / warnings
npm run build          # ensure production build succeeds
```

If any of these fail, fix them before opening a PR. **Do not open a PR with a known failing check.**

---

## CI / CD Pipeline

GitHub Actions workflow at `.github/workflows/deploy.yml` runs on every push to `main` and every pull request:

1. `npm ci`
2. `npx tsc --noEmit`
3. `npm run lint`
4. `npm run build`
5. Deploy to Cloudflare Pages (`cloudflare/pages-action@v1`)

PRs receive an isolated preview URL posted as a comment. Merging to `main` triggers a production deploy at `https://my-learnings-cheatsheets.pages.dev`.

**Required GitHub secrets** (repo → Settings → Secrets → Actions):
- `CLOUDFLARE_API_TOKEN` — scoped to Cloudflare Pages only
- `CLOUDFLARE_ACCOUNT_ID`

---

## Project Structure

```
src/
  components/       # Reusable UI: ConceptCard, PayoffChart, FormulaBlock,
  │                 #   SearchBar, CategoryTabs, GlossaryItem, ThemeToggle
  data/             # Static content arrays: derivatives.ts, forex.ts, glossary.ts
  hooks/            # useSearch (debounced, generic), useTheme (localStorage)
  routes/
    derivatives-forex/  # All pages: HomePage, DerivativesPage, ForexPage,
                        #   GlossaryPage, and the shared layout (index.tsx)
  styles/           # globals.css, variables.css (CSS custom properties)
  types/            # Shared TypeScript interfaces: Concept, GlossaryTerm, Theme
public/
  _redirects        # Cloudflare Pages SPA rewrite rule (/* /index.html 200)
```

---

## Key Conventions

**Data**: All content lives in `src/data/`. Adding a new concept means appending to the relevant array — counts and stats on the home page are derived from array lengths, not hardcoded.

**Routing**: Uses `BrowserRouter`. The `public/_redirects` file is mandatory for Cloudflare to serve the SPA correctly on direct URL loads. Do not remove it.

**Theming**: Dark/light mode is driven by `data-theme` on `<html>` (set by `useTheme`). All colours must use CSS custom property tokens from `src/styles/variables.css` — never hardcode colour values.

**Formulas**: LaTeX strings in `src/data/` are rendered by `FormulaBlock` via KaTeX. Validate formula strings in the KaTeX live editor before committing.

**Search**: `useSearch` is generic and debounced. It searches over any array of typed objects given a list of field keys. Use it for new content pages rather than writing ad-hoc filtering.

---

## Dependency Management

- Always use `npm ci` in CI and when verifying a clean install locally.
- Any package used in a script (lint, build, test) **must** be declared in `package.json`. A globally installed package is an invisible dependency that will fail in CI.
- Use `--save-dev` for build/lint/type tooling; `--save` (default) for runtime dependencies.
- Do not install Playwright or other test drivers as project dependencies — use them as one-off tools outside the project if needed.

---

## Production Readiness Checklist

Before considering any feature complete:

- [ ] `npm ci && npx tsc --noEmit && npm run lint && npm run build` all pass
- [ ] New data entries follow the existing `Concept` / `GlossaryTerm` type shape
- [ ] No hardcoded colours, counts, or strings that belong in data files
- [ ] Dark and light mode both render correctly (toggle the theme and check)
- [ ] Direct URL load to each new route works (validates `_redirects` is effective)
- [ ] PR raised against `main`; CI is green before requesting review
