import { useProgress, formatCheckedDate, type Confidence } from '../../hooks/useProgress';
import './TopicCheckbox.css';

interface TopicCheckboxProps {
  topicKey: string;
}

const LABELS: Record<Confidence, string> = {
  0: 'Mark done',
  1: 'Seen it',
  2: 'Understand',
  3: 'Can explain',
};

const ICONS: Record<Confidence, string> = {
  0: '○',
  1: '◐',
  2: '◕',
  3: '✓',
};

const NEXT_LABEL: Record<Confidence, string> = {
  0: 'Mark as seen',
  1: 'Advance to Understand',
  2: 'Advance to Can explain',
  3: 'Reset to not started',
};

export function TopicCheckbox({ topicKey }: TopicCheckboxProps) {
  const { confidence, updatedAt, advance } = useProgress(topicKey);

  const dateStr = updatedAt ? formatCheckedDate(updatedAt) : '';
  const title = confidence > 0
    ? `${LABELS[confidence]} (since ${dateStr}) — ${NEXT_LABEL[confidence]}`
    : NEXT_LABEL[0];

  return (
    <button
      className={`tc-btn tc-btn--${confidence}`}
      onClick={advance}
      title={title}
      aria-label={title}
      type="button"
    >
      <span className="tc-btn__icon">{ICONS[confidence]}</span>
      <span className="tc-btn__label">{LABELS[confidence]}</span>
    </button>
  );
}
