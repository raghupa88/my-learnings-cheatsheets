import { useProgress, formatCheckedDate } from '../../hooks/useProgress';
import './TopicCheckbox.css';

interface TopicCheckboxProps {
  topicKey: string;
}

export function TopicCheckbox({ topicKey }: TopicCheckboxProps) {
  const { checked, checkedAt, toggle } = useProgress(topicKey);

  return (
    <button
      className={`tc-btn${checked ? ' tc-btn--checked' : ''}`}
      onClick={toggle}
      title={checked ? `Reviewed ${formatCheckedDate(checkedAt)} — click to uncheck` : 'Mark as reviewed'}
      aria-label={checked ? 'Marked as reviewed — click to uncheck' : 'Mark as reviewed'}
      type="button"
    >
      {checked ? (
        <>
          <span className="tc-btn__icon">✓</span>
          <span className="tc-btn__label">Reviewed</span>
        </>
      ) : (
        <>
          <span className="tc-btn__icon tc-btn__icon--empty">○</span>
          <span className="tc-btn__label">Mark done</span>
        </>
      )}
    </button>
  );
}
