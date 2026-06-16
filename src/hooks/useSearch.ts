import { useState, useEffect, useCallback } from 'react';

export function useSearch<T>(
  items: T[],
  keys: (keyof T)[],
  debounceMs = 300
): { query: string; setQuery: (q: string) => void; filtered: T[] } {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const filtered = useCallback(() => {
    if (!debouncedQuery.trim()) return items;
    const q = debouncedQuery.toLowerCase();
    return items.filter(item =>
      keys.some(key => {
        const val = item[key];
        if (Array.isArray(val)) return val.some(v => String(v).toLowerCase().includes(q));
        return String(val).toLowerCase().includes(q);
      })
    );
  }, [items, keys, debouncedQuery])();

  return { query, setQuery, filtered };
}
