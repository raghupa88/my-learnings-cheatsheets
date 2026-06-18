import { useState } from 'react';
import { forexConcepts, forexCategories } from '../../data/forex';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { CategoryTabs } from '../../components/CategoryTabs/CategoryTabs';
import { useSearch } from '../../hooks/useSearch';
import './page.css';

export default function ForexPage() {
  const [category, setCategory] = useState('All');
  const { query, setQuery, filtered } = useSearch(
    forexConcepts,
    ['title', 'description', 'tags', 'category'],
    300
  );

  const displayed = category === 'All'
    ? filtered
    : filtered.filter(c => c.category === category);

  return (
    <div className="page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Forex</h1>
          <p className="page__subtitle">
            12 core FX concepts: spot/forward rates, cross rates, FX options (Garman-Kohlhagen),
            interest rate parity, PPP, and FX Greeks.
          </p>
        </div>
        <span className="page__count">{displayed.length} / {forexConcepts.length}</span>
      </header>

      <div className="page__toolbar">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search forex concepts..."
        />
        <CategoryTabs
          categories={forexCategories}
          active={category}
          onSelect={setCategory}
        />
      </div>

      {displayed.length === 0 ? (
        <div className="page__empty">
          <p>No concepts match <strong>"{query}"</strong> in <strong>{category}</strong>.</p>
        </div>
      ) : (
        <div className="page__grid">
          {displayed.map(concept => (
            <ConceptCard key={concept.id} concept={concept} />
          ))}
        </div>
      )}
    </div>
  );
}
