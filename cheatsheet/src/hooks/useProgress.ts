import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'cheatsheet-progress';

export interface TopicProgress {
  checked: boolean;
  checkedAt: string | null; // ISO timestamp
}

type ProgressStore = Record<string, TopicProgress>;

function readStore(): ProgressStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
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
    return s[topicKey] ?? { checked: false, checkedAt: null };
  });

  useEffect(() => {
    const refresh = () => {
      const s = readStore();
      setEntry(s[topicKey] ?? { checked: false, checkedAt: null });
    };
    window.addEventListener('cheatsheet-progress-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cheatsheet-progress-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [topicKey]);

  const toggle = useCallback(() => {
    const store = readStore();
    const current = store[topicKey] ?? { checked: false, checkedAt: null };
    const updated: TopicProgress = {
      checked: !current.checked,
      checkedAt: !current.checked ? new Date().toISOString() : null,
    };
    writeStore({ ...store, [topicKey]: updated });
    setEntry(updated);
  }, [topicKey]);

  return { ...entry, toggle };
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
