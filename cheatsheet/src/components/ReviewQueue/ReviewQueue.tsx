import { Link } from 'react-router-dom';
import { useReviewQueue, shortTitle, routeLabel } from '../../hooks/useReviewQueue';
import type { Confidence } from '../../hooks/useProgress';
import './ReviewQueue.css';

const ROUTE_PATHS: Record<string, string> = {
  backend:     '/backend',
  frontend:    '/frontend',
  derivatives: '/derivatives-forex/derivatives',
  forex:       '/derivatives-forex/forex',
  glossary:    '/derivatives-forex/glossary',
  fxo:         '/fx-options',
};

const CONF_ICON: Record<Confidence, string> = {
  0: '○',
  1: '◐',
  2: '◕',
  3: '✓',
};

const CONF_CLASS: Record<Confidence, string> = {
  0: '',
  1: 'rq-conf--1',
  2: 'rq-conf--2',
  3: 'rq-conf--3',
};

export function ReviewQueue() {
  const { due, upcoming } = useReviewQueue();

  if (due.length === 0 && upcoming.length === 0) {
    return (
      <div className="rq-empty">
        <span className="rq-empty__icon">🎯</span>
        <div>
          <div className="rq-empty__title">All caught up</div>
          <div className="rq-empty__sub">No topics due for review. Keep marking topics as you study.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rq-wrap">

      {due.length > 0 && (
        <div className="rq-section">
          <div className="rq-section__head rq-section__head--due">
            <span className="rq-section__badge">{due.length}</span>
            Due for review
          </div>
          <ul className="rq-list">
            {due.map(entry => {
              const route = routeLabel(entry.key);
              const path  = ROUTE_PATHS[route] ?? '/progress';
              return (
                <li key={entry.key} className="rq-item">
                  <Link to={path} className="rq-item__link">
                    <span className={`rq-conf ${CONF_CLASS[entry.confidence]}`}>
                      {CONF_ICON[entry.confidence]}
                    </span>
                    <span className="rq-item__title">{shortTitle(entry.key)}</span>
                    <span className="rq-item__route">{route}</span>
                    <span className="rq-item__due rq-item__due--overdue">{entry.dueLabel}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="rq-section">
          <div className="rq-section__head rq-section__head--upcoming">
            <span className="rq-section__badge rq-section__badge--upcoming">{upcoming.length}</span>
            Coming up this week
          </div>
          <ul className="rq-list">
            {upcoming.map(entry => {
              const route = routeLabel(entry.key);
              const path  = ROUTE_PATHS[route] ?? '/progress';
              return (
                <li key={entry.key} className="rq-item rq-item--upcoming">
                  <Link to={path} className="rq-item__link">
                    <span className={`rq-conf ${CONF_CLASS[entry.confidence]}`}>
                      {CONF_ICON[entry.confidence]}
                    </span>
                    <span className="rq-item__title">{shortTitle(entry.key)}</span>
                    <span className="rq-item__route">{route}</span>
                    <span className="rq-item__due">{entry.dueLabel}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
