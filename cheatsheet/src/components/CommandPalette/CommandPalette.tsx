import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchIndex, searchIndex, type SearchEntry } from '../../hooks/useSearchIndex';
import './CommandPalette.css';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const index = useSearchIndex();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = searchIndex(index, query);

  // Reset state when opening
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // slight delay lets the CSS transition render before focusing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keep active index in range when results change
  useEffect(() => {
    setActive(prev => Math.min(prev, Math.max(results.length - 1, 0)));
  }, [results.length]);

  const commit = useCallback((entry: SearchEntry) => {
    navigate(entry.path);
    onClose();
  }, [navigate, onClose]);

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(p => Math.min(p + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(p => Math.max(p - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      commit(results[active]);
    }
  }, [results, active, commit, onClose]);

  // Scroll active item into view
  useEffect(() => {
    const item = listRef.current?.children[active] as HTMLElement | undefined;
    item?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  return (
    <div className="cp-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Search">
      <div className="cp-modal" onClick={e => e.stopPropagation()} onKeyDown={handleKey}>
        <div className="cp-search-row">
          <span className="cp-search-icon" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="cp-input"
            type="text"
            placeholder="Search all topics…"
            value={query}
            onChange={e => { setQuery(e.target.value); setActive(0); }}
            aria-label="Search topics"
            aria-autocomplete="list"
            aria-controls="cp-results"
            aria-activedescendant={results[active] ? `cp-item-${active}` : undefined}
          />
          <kbd className="cp-esc" onClick={onClose}>esc</kbd>
        </div>

        {query && (
          <ul
            id="cp-results"
            className="cp-results"
            ref={listRef}
            role="listbox"
          >
            {results.length === 0 ? (
              <li className="cp-empty">No results for <strong>"{query}"</strong></li>
            ) : results.map((entry, i) => (
              <li
                key={entry.id}
                id={`cp-item-${i}`}
                className={`cp-item${i === active ? ' cp-item--active' : ''}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => commit(entry)}
              >
                <span className="cp-item__route">{entry.route}</span>
                <span className="cp-item__title">{highlight(entry.title, query)}</span>
                <span className="cp-item__sub">{entry.subtitle}</span>
              </li>
            ))}
          </ul>
        )}

        {!query && (
          <div className="cp-hint">
            Type to search across all routes — Derivatives, Forex, Glossary, FX Options
          </div>
        )}
      </div>
    </div>
  );
}

/** Wrap matching substring in <mark>. */
function highlight(text: string, query: string): React.ReactNode {
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="cp-mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}
