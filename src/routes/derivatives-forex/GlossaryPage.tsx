import { useState, useMemo } from 'react';
import { glossaryTerms, glossaryCategories } from '../../data/glossary';
import { GlossaryItem } from '../../components/GlossaryItem/GlossaryItem';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { CategoryTabs } from '../../components/CategoryTabs/CategoryTabs';
import { useSearch } from '../../hooks/useSearch';
import './GlossaryPage.css';

export default function GlossaryPage() {
  const [category, setCategory] = useState('All');
  const { query, setQuery, filtered } = useSearch(
    glossaryTerms,
    ['term', 'definition', 'category'],
    300
  );

  const displayed = category === 'All'
    ? filtered
    : filtered.filter(t => t.category === category);

  const grouped = useMemo(() => {
    const map: Record<string, typeof displayed> = {};
    for (const term of displayed) {
      const letter = term.term[0].toUpperCase();
      if (!map[letter]) map[letter] = [];
      map[letter].push(term);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [displayed]);

  return (
    <div className="page glossary-page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Glossary</h1>
          <p className="page__subtitle">
            50+ finance terms covering options, rates, credit, FX, risk measurement, and XVA
            adjustments — essential vocabulary for SCB derivatives and forex.
          </p>
        </div>
        <span className="page__count">{displayed.length} / {glossaryTerms.length}</span>
      </header>

      <div className="page__toolbar">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search glossary terms..."
        />
        <CategoryTabs
          categories={glossaryCategories}
          active={category}
          onSelect={setCategory}
        />
      </div>

      {grouped.length === 0 ? (
        <div className="page__empty">
          <p>No terms match <strong>"{query}"</strong>{category !== 'All' ? ` in ${category}` : ''}.</p>
        </div>
      ) : (
        <div className="glossary-page__content">
          {grouped.map(([letter, terms]) => (
            <section key={letter} className="glossary-page__group">
              <h2 className="glossary-page__letter">{letter}</h2>
              <dl className="glossary-page__list">
                {terms.map(term => (
                  <GlossaryItem key={term.id} term={term} />
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
