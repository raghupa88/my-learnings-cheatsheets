import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'cheatsheet-progress';

export type Confidence = 0 | 1 | 2 | 3;

export interface TopicProgress {
  confidence: Confidence;
  updatedAt: string | null; // ISO timestamp
}

// Backwards-compat: old shape used { checked, checkedAt }
interface LegacyTopicProgress {
  checked?: boolean;
  checkedAt?: string | null;
  confidence?: Confidence;
  updatedAt?: string | null;
}

type ProgressStore = Record<string, TopicProgress>;

const INTERVAL_DAYS: Record<Confidence, number> = {
  0: 0,   // not started — no interval
  1: 1,
  2: 3,
  3: 14,
};

function migrate(raw: Record<string, LegacyTopicProgress>): ProgressStore {
  const out: ProgressStore = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v.confidence !== undefined) {
      out[k] = { confidence: v.confidence, updatedAt: v.updatedAt ?? null };
    } else {
      // Legacy: checked=true → confidence 2, false → 0
      out[k] = {
        confidence: v.checked ? 2 : 0,
        updatedAt: v.checkedAt ?? null,
      };
    }
  }
  return out;
}

function readStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LegacyTopicProgress>;
    // Detect if migration is needed (any key has 'checked' but not 'confidence')
    const needsMigration = Object.values(parsed).some(
      v => v.checked !== undefined && v.confidence === undefined
    );
    if (needsMigration) {
      const migrated = migrate(parsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return parsed as ProgressStore;
  } catch {
    return {};
  }
}

function writeStore(store: ProgressStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    window.dispatchEvent(new Event('cheatsheet-progress-changed'));
  } catch {
    // localStorage unavailable (private mode, storage full)
  }
}

/** Returns the full store, reactive to changes in this tab and others. */
export function useProgressStore(): ProgressStore {
  const [store, setStore] = useState<ProgressStore>(readStore);

  useEffect(() => {
    const refresh = () => setStore(readStore());
    window.addEventListener('cheatsheet-progress-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cheatsheet-progress-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return store;
}

/**
 * Per-topic hook.
 * topicKey convention: "<route>/<sectionId>/<topicTitle>"
 * e.g. "backend/java21/Records"
 */
export function useProgress(topicKey: string) {
  const [entry, setEntry] = useState<TopicProgress>(() => {
    const s = readStore();
    return s[topicKey] ?? { confidence: 0, updatedAt: null };
  });

  useEffect(() => {
    const refresh = () => {
      const s = readStore();
      setEntry(s[topicKey] ?? { confidence: 0, updatedAt: null });
    };
    window.addEventListener('cheatsheet-progress-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cheatsheet-progress-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [topicKey]);

  // Cycles 0 → 1 → 2 → 3 → 0
  const advance = useCallback(() => {
    const store = readStore();
    const current = store[topicKey] ?? { confidence: 0 as Confidence, updatedAt: null };
    const next = ((current.confidence + 1) % 4) as Confidence;
    const updated: TopicProgress = {
      confidence: next,
      updatedAt: next > 0 ? new Date().toISOString() : null,
    };
    writeStore({ ...store, [topicKey]: updated });
    setEntry(updated);
  }, [topicKey]);

  return { ...entry, advance };
}

/** How many days until this topic is due for review. Negative = overdue. */
export function daysUntilDue(entry: TopicProgress): number | null {
  if (entry.confidence === 0 || !entry.updatedAt) return null;
  const intervalMs = INTERVAL_DAYS[entry.confidence] * 86_400_000;
  const dueMs = new Date(entry.updatedAt).getTime() + intervalMs;
  return Math.ceil((dueMs - Date.now()) / 86_400_000);
}

/** Clear all progress (used by the dashboard reset button). */
export function clearAllProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('cheatsheet-progress-changed'));
  } catch {
    // ignore
  }
}

/** Human-readable date from ISO string. */
export function formatCheckedDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return '';
  }
}
