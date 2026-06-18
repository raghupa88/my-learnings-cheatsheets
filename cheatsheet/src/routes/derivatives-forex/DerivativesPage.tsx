import { useState } from 'react';
import { derivativesConcepts, derivativesCategories } from '../../data/derivatives';
import { ConceptCard } from '../../components/ConceptCard/ConceptCard';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { CategoryTabs } from '../../components/CategoryTabs/CategoryTabs';
import { useSearch } from '../../hooks/useSearch';
import './page.css';

export default function DerivativesPage() {
  const [category, setCategory] = useState('All');
  const { query, setQuery, filtered } = useSearch(
    derivativesConcepts,
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
          <h1 className="page__title">Derivatives</h1>
          <p className="page__subtitle">
            15 core concepts covering options, forwards, futures, Greeks, swaps, credit
            derivatives, and risk measurement.
          </p>
        </div>
        <span className="page__count">{displayed.length} / {derivativesConcepts.length}</span>
      </header>

      <div className="page__toolbar">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search derivatives concepts..."
        />
        <CategoryTabs
          categories={derivativesCategories}
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
