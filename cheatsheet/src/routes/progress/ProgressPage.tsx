import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgressStore, clearAllProgress, formatCheckedDate } from '../../hooks/useProgress';
import './ProgressPage.css';

/* ── Known topic registry ────────────────────────────────────────────────── */
// Keys must match what each page passes to TopicCheckbox as topicKey.
// Format: "<route>/<sectionId>/<topicTitle>"

const ROUTE_TOPICS: Array<{
  route: string;
  label: string;
  path: string;
  icon: string;
  topics: string[];
}> = [
  {
    route: 'backend', label: 'Backend Engineering', path: '/backend', icon: '⚙️',
    topics: [
      'backend/java21/Records',
      'backend/java21/Sealed Classes',
      'backend/java21/Virtual Threads (Project Loom)',
      'backend/java21/Pattern Matching',
      'backend/java21/Streams & Collectors',
      'backend/java21/Date/Time API & Text Blocks',
      'backend/springboot/Auto-Configuration & Starters',
      'backend/springboot/REST Controller',
      'backend/springboot/Bean Validation (JSR-380)',
      'backend/springboot/Spring Data JPA',
      'backend/springboot/Actuator & Observability',
      'backend/rest/HTTP Verbs & Idempotency',
      'backend/rest/Status Codes',
      'backend/rest/Pagination & Filtering',
      'backend/rest/Error Contract & Versioning',
      'backend/websocket/Spring WebSocket + STOMP Config',
      'backend/websocket/Broadcasting Messages from Kafka',
      'backend/websocket/React + RxJS WebSocket Client',
      'backend/kafka/Core Concepts',
      'backend/kafka/Spring Kafka Producer',
      'backend/kafka/Spring Kafka Consumer',
      'backend/kafka/Partitioning & Keys Strategy',
      'backend/docker/Dockerfile — Multi-Stage Build',
      'backend/docker/Docker Compose',
      'backend/docker/Networking & Volumes',
      'backend/docker/Health Checks & Best Practices',
      'backend/openshift/Deployment Manifest',
      'backend/openshift/Liveness vs Readiness vs Startup Probes',
      'backend/openshift/OC CLI Essentials',
      'backend/kibana/KQL Syntax Essentials',
      'backend/kibana/Log Correlation (traceId)',
      'backend/kibana/Discover Tab & Dashboard',
      'backend/kibana/Alerting Rules',
    ],
  },
  {
    route: 'frontend', label: 'Frontend Engineering', path: '/frontend', icon: '⚛️',
    topics: [
      'frontend/espjs-core/What is esp-js?',
      'frontend/espjs-core/observeEvent — Handling Events',
      'frontend/espjs-core/getModelObservable — Observing State',
      'frontend/espjs-core/Model Classes & Regions',
      'frontend/espjs-core/Event Workflow & Pre/Post Processing',
      'frontend/espjs-react/RouterProvider & useRouter',
      'frontend/espjs-react/useModelObservable — Reactive State in Components',
      'frontend/espjs-react/Publishing Events from React',
      'frontend/espjs-react/Testing esp-js Models',
      'frontend/react-patterns/Custom Hooks Pattern',
      'frontend/react-patterns/useMemo & useCallback',
      'frontend/react-patterns/Context for Cross-Cutting Concerns',
      'frontend/react-patterns/Performance: React.memo & Virtualization',
    ],
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function shortTitle(key: string): string {
  const parts = key.split('/');
  return parts[parts.length - 1];
}
function routeLabel(key: string): string {
  const parts = key.split('/');
  return parts[0] ?? '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ProgressPage() {
  const store = useProgressStore();
  const [confirmReset, setConfirmReset] = useState(false);

  // Aggregate stats
  const allTopics = ROUTE_TOPICS.flatMap(r => r.topics);
  const checkedKeys = allTopics.filter(k => store[k]?.checked);
  const totalTopics = allTopics.length;
  const totalChecked = checkedKeys.length;
  const pct = totalTopics === 0 ? 0 : Math.round((totalChecked / totalTopics) * 100);

  // Pending (unchecked)
  const pending = allTopics.filter(k => !store[k]?.checked);

  // Done — sorted newest first
  const done = checkedKeys
    .map(k => ({ key: k, checkedAt: store[k]?.checkedAt ?? null }))
    .sort((a, b) => {
      if (!a.checkedAt) return 1;
      if (!b.checkedAt) return -1;
      return b.checkedAt.localeCompare(a.checkedAt);
    });

  const handleReset = () => {
    clearAllProgress();
    setConfirmReset(false);
  };

  return (
    <div className="pg-page">

      {/* Hero */}
      <div className="pg-hero">
        <h1 className="pg-hero__title">Learning Progress</h1>
        <p className="pg-hero__sub">
          All data is stored locally in your browser. Check topics off as you review them.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="pg-stats">
        <div className="pg-stat">
          <div className="pg-stat__num pg-stat__num--green">{totalChecked}</div>
          <div className="pg-stat__label">Topics Reviewed</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat__num pg-stat__num--blue">{totalTopics - totalChecked}</div>
          <div className="pg-stat__label">Topics Pending</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat__num pg-stat__num--purple">{pct}%</div>
          <div className="pg-stat__label">Overall Complete</div>
        </div>
      </div>

      {/* Per-route progress bars */}
      <div className="pg-routes">
        <div className="pg-routes__title">Progress by Route</div>
        {ROUTE_TOPICS.map(r => {
          const checked = r.topics.filter(k => store[k]?.checked).length;
          const total   = r.topics.length;
          const pctR    = total === 0 ? 0 : Math.round((checked / total) * 100);
          return (
            <div key={r.route} className="pg-route-row">
              <div className="pg-route-row__name">
                {r.icon} <Link to={r.path}>{r.label}</Link>
              </div>
              <div className="pg-bar-track">
                <div
                  className={`pg-bar-fill${pctR === 0 ? ' pg-bar-fill--empty' : ''}`}
                  style={{ width: `${pctR}%` }}
                />
              </div>
              <div className="pg-route-row__pct">{checked}/{total}</div>
            </div>
          );
        })}
      </div>

      {/* Pending / Reviewed panels */}
      <div className="pg-two-col">

        {/* Pending */}
        <div className="pg-panel">
          <div className="pg-panel__head pg-panel__head--pending">
            ⏳ Pending ({pending.length})
          </div>
          {pending.length === 0 ? (
            <div className="pg-panel__empty">🎉 All topics reviewed!</div>
          ) : (
            <ul className="pg-panel__list">
              {pending.map(k => {
                const rt = ROUTE_TOPICS.find(r => r.topics.includes(k));
                return (
                  <li key={k} className="pg-panel__item">
                    <span className="pg-panel__item-name">
                      {rt ? <Link to={rt.path}>{shortTitle(k)}</Link> : shortTitle(k)}
                    </span>
                    <span className="pg-panel__item-route">{routeLabel(k)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Reviewed */}
        <div className="pg-panel">
          <div className="pg-panel__head pg-panel__head--done">
            ✅ Reviewed ({done.length})
          </div>
          {done.length === 0 ? (
            <div className="pg-panel__empty">No topics reviewed yet. Start checking them off!</div>
          ) : (
            <ul className="pg-panel__list">
              {done.map(({ key: k, checkedAt }) => {
                const rt = ROUTE_TOPICS.find(r => r.topics.includes(k));
                return (
                  <li key={k} className="pg-panel__item">
                    <span className="pg-panel__item-name">
                      {rt ? <Link to={rt.path}>{shortTitle(k)}</Link> : shortTitle(k)}
                    </span>
                    <span className="pg-panel__item-route">{routeLabel(k)}</span>
                    <span className="pg-panel__item-date">{formatCheckedDate(checkedAt)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>

      {/* Reset */}
      <div className="pg-reset-zone">
        {confirmReset ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>
            Are you sure? This clears all progress.&nbsp;
            <button className="pg-reset-btn" onClick={handleReset}>Yes, reset</button>
            &nbsp;
            <button className="pg-reset-btn" style={{ borderColor: '#6b7280', color: '#6b7280' }} onClick={() => setConfirmReset(false)}>Cancel</button>
          </span>
        ) : (
          <button className="pg-reset-btn" onClick={() => setConfirmReset(true)}>
            Reset all progress
          </button>
        )}
      </div>

    </div>
  );
}
