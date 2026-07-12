import { TopicCheckbox } from '../TopicCheckbox/TopicCheckbox';
import './GlossaryItem.css';
import { GlossaryTerm } from '../../types';

interface GlossaryItemProps {
  term: GlossaryTerm;
}

export function GlossaryItem({ term }: GlossaryItemProps) {
  return (
    <div className="glossary-item" id={`term-${term.id}`}>
      <div className="glossary-item__header">
        <dt className="glossary-item__term">{term.term}</dt>
        <div className="glossary-item__header-right">
          {term.category && (
            <span className="glossary-item__category">{term.category}</span>
          )}
          <TopicCheckbox topicKey={`glossary/${term.id}`} />
        </div>
      </div>
      <dd className="glossary-item__definition">{term.definition}</dd>
    </div>
  );
}
