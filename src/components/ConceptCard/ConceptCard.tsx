import { useState } from 'react';
import { Concept } from '../../types';
import { FormulaBlock } from '../FormulaBlock/FormulaBlock';
import { PayoffChart } from '../PayoffChart/PayoffChart';
import './ConceptCard.css';

interface ConceptCardProps {
  concept: Concept;
}

export function ConceptCard({ concept }: ConceptCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="concept-card">
      <header className="concept-card__header">
        <div className="concept-card__meta">
          <span className="concept-card__category">{concept.category}</span>
        </div>
        <h3 className="concept-card__title">{concept.title}</h3>
      </header>

      <p className="concept-card__description">{concept.description}</p>

      {concept.formula && (
        <FormulaBlock formula={concept.formula} label={concept.formulaLabel} />
      )}

      {concept.chartType && (
        <PayoffChart type={concept.chartType} />
      )}

      {concept.details && concept.details.length > 0 && (
        <div className="concept-card__details-wrap">
          <button
            className="concept-card__toggle"
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
          >
            {expanded ? '▲ Hide details' : '▼ Show details'}
          </button>
          {expanded && (
            <ul className="concept-card__details">
              {concept.details.map((d, i) => (
                <li key={i} className="concept-card__detail-item">{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {concept.tags.length > 0 && (
        <footer className="concept-card__tags">
          {concept.tags.map(tag => (
            <span key={tag} className="concept-card__tag">{tag}</span>
          ))}
        </footer>
      )}
    </article>
  );
}
