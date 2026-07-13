import { useMemo } from 'react';
import { derivativesConcepts } from '../data/derivatives';
import { forexConcepts } from '../data/forex';
import { glossaryTerms } from '../data/glossary';

export interface SearchEntry {
  id: string;
  title: string;
  subtitle: string; // category or definition excerpt
  route: string;    // display label e.g. "Derivatives"
  path: string;     // react-router path to navigate to
}

// FXO inline data — mirrors the arrays in FxOptionsPage
const FXO_GREEKS = ['Delta', 'Gamma', 'Vega', 'Theta'];
const FXO_KEY_TERMS = [
  'Notional', 'Strike Price', 'Premium', 'Spot vs Forward', 'Pip',
  'NDF — Non-Deliverable Forward',
];
const FXO_SYSTEMS = [
  'Pricing Engine', 'Booking & Risk (Front Office)', 'Confirmation',
  'Regulatory Reporting', 'Settlement', 'Reconciliation',
];
const FXO_STRATEGIES = [
  'Vanilla Call', 'Vanilla Put', 'Zero-Cost Collar', 'Risk Reversal',
  'Straddle / Strangle', 'Knock-Out (Barrier) Option', 'NDF Option (NDO)',
];

export function useSearchIndex(): SearchEntry[] {
  return useMemo(() => {
    const entries: SearchEntry[] = [];

    for (const c of derivativesConcepts) {
      entries.push({
        id: `derivatives/${c.id}`,
        title: c.title,
        subtitle: c.category,
        route: 'Derivatives',
        path: '/derivatives-forex/derivatives',
      });
    }

    for (const c of forexConcepts) {
      entries.push({
        id: `forex/${c.id}`,
        title: c.title,
        subtitle: c.category,
        route: 'Forex',
        path: '/derivatives-forex/forex',
      });
    }

    for (const t of glossaryTerms) {
      entries.push({
        id: `glossary/${t.id}`,
        title: t.term,
        subtitle: t.category ?? 'Glossary',
        route: 'Glossary',
        path: '/derivatives-forex/glossary',
      });
    }

    for (const name of FXO_GREEKS) {
      entries.push({ id: `fxo/greeks/${name}`, title: name, subtitle: 'Greeks', route: 'FX Options', path: '/fx-options' });
    }
    for (const name of FXO_KEY_TERMS) {
      entries.push({ id: `fxo/key-terms/${name}`, title: name, subtitle: 'Key Terms', route: 'FX Options', path: '/fx-options' });
    }
    for (const name of FXO_SYSTEMS) {
      entries.push({ id: `fxo/systems/${name}`, title: name, subtitle: 'Systems', route: 'FX Options', path: '/fx-options' });
    }
    for (const name of FXO_STRATEGIES) {
      entries.push({ id: `fxo/strategies/${name}`, title: name, subtitle: 'Strategies', route: 'FX Options', path: '/fx-options' });
    }

    return entries;
  }, []);
}

/** Simple ranked search: title prefix > title contains > subtitle contains. */
export function searchIndex(entries: SearchEntry[], query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const tier1: SearchEntry[] = [];
  const tier2: SearchEntry[] = [];
  const tier3: SearchEntry[] = [];

  for (const e of entries) {
    const title = e.title.toLowerCase();
    const sub   = e.subtitle.toLowerCase();
    if (title.startsWith(q))      tier1.push(e);
    else if (title.includes(q))   tier2.push(e);
    else if (sub.includes(q))     tier3.push(e);
  }

  return [...tier1, ...tier2, ...tier3].slice(0, 8);
}
