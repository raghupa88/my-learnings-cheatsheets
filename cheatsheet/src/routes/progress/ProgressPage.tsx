import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProgressStore, clearAllProgress, formatCheckedDate } from '../../hooks/useProgress';
import { ReviewQueue } from '../../components/ReviewQueue/ReviewQueue';
import './ProgressPage.css';

/* ── Known topic registry ────────────────────────────────────────────────── */
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
  {
    route: 'derivatives', label: 'Derivatives', path: '/derivatives-forex/derivatives', icon: '📊',
    topics: [
      'derivatives/forward-contract',
      'derivatives/futures-contract',
      'derivatives/european-call',
      'derivatives/european-put',
      'derivatives/put-call-parity',
      'derivatives/delta',
      'derivatives/gamma',
      'derivatives/vega',
      'derivatives/theta',
      'derivatives/rho',
      'derivatives/irs',
      'derivatives/cds',
      'derivatives/vol-surface',
      'derivatives/var',
      'derivatives/black-scholes',
    ],
  },
  {
    route: 'forex', label: 'Forex', path: '/derivatives-forex/forex', icon: '💱',
    topics: [
      'forex/spot-rate',
      'forex/forward-rate-fx',
      'forex/cross-rate',
      'forex/pip',
      'forex/bid-ask-spread',
      'forex/fx-swap',
      'forex/fx-option',
      'forex/irp',
      'forex/ppp',
      'forex/fx-delta',
      'forex/fx-gamma-vega',
      'forex/correlation-trading',
    ],
  },
  {
    route: 'glossary', label: 'Glossary', path: '/derivatives-forex/glossary', icon: '📖',
    topics: [
      'glossary/arbitrage',
      'glossary/atm',
      'glossary/basis',
      'glossary/basis-risk',
      'glossary/black-scholes',
      'glossary/bond',
      'glossary/cap',
      'glossary/collar',
      'glossary/collateral',
      'glossary/convexity',
      'glossary/counterparty-risk',
      'glossary/credit-risk',
      'glossary/delta-hedging',
      'glossary/derivative',
      'glossary/duration',
      'glossary/european-option',
      'glossary/american-option',
      'glossary/exotic-option',
      'glossary/expiry',
      'glossary/fixed-income',
      'glossary/floor',
      'glossary/forward-points',
      'glossary/fva',
      'glossary/greeks',
      'glossary/hedge',
      'glossary/implied-volatility',
      'glossary/itm',
      'glossary/initial-margin',
      'glossary/knock-in',
      'glossary/knock-out',
      'glossary/leverage',
      'glossary/liquidity-risk',
      'glossary/margin-call',
      'glossary/mtm',
      'glossary/market-risk',
      'glossary/moneyness',
      'glossary/netting',
      'glossary/notional',
      'glossary/otc',
      'glossary/otm',
      'glossary/premium',
      'glossary/rollover',
      'glossary/settlement',
      'glossary/strike-price',
      'glossary/swap-rate',
      'glossary/tenor',
      'glossary/underlying',
      'glossary/variation-margin',
      'glossary/volatility',
      'glossary/yield-curve',
      'glossary/cva',
      'glossary/dv01',
    ],
  },
  {
    route: 'fxo', label: 'FX Options', path: '/fx-options', icon: '🎯',
    topics: [
      'fxo/greeks/Delta',
      'fxo/greeks/Gamma',
      'fxo/greeks/Vega',
      'fxo/greeks/Theta',
      'fxo/key-terms/Notional',
      'fxo/key-terms/Strike Price',
      'fxo/key-terms/Premium',
      'fxo/key-terms/Spot vs Forward',
      'fxo/key-terms/Pip',
      'fxo/key-terms/NDF — Non-Deliverable Forward',
      'fxo/systems/Pricing Engine',
      'fxo/systems/Booking & Risk (Front Office)',
      'fxo/systems/Confirmation',
      'fxo/systems/Regulatory Reporting',
      'fxo/systems/Settlement',
      'fxo/systems/Reconciliation',
      'fxo/strategies/Vanilla Call',
      'fxo/strategies/Vanilla Put',
      'fxo/strategies/Zero-Cost Collar',
      'fxo/strategies/Risk Reversal',
      'fxo/strategies/Straddle / Strangle',
      'fxo/strategies/Knock-Out (Barrier) Option',
      'fxo/strategies/NDF Option (NDO)',
    ],
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function shortTitle(key: string): string {
  const parts = key.split('/');
  return parts[parts.length - 1];
}
function routeLabel(key: string): string {
  return key.split('/')[0] ?? '';
}

const CONF_LABEL = ['Not started', 'Seen it', 'Understand', 'Can explain'];
const CONF_CLASS = ['', 'pg-conf--1', 'pg-conf--2', 'pg-conf--3'];

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════════════ */
export default function ProgressPage() {
  const store = useProgressStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const allTopics = ROUTE_TOPICS.flatMap(r => r.topics);

  const seen       = allTopics.filter(k => (store[k]?.confidence ?? 0) >= 1);
  const understood = allTopics.filter(k => (store[k]?.confidence ?? 0) >= 2);
  const mastered   = allTopics.filter(k => (store[k]?.confidence ?? 0) === 3);
  const pending    = allTopics.filter(k => (store[k]?.confidence ?? 0) === 0);

  const totalTopics = allTopics.length;
  const pct = totalTopics === 0 ? 0 : Math.round((seen.length / totalTopics) * 100);

  // Reviewed items sorted newest first
  const reviewed = seen
    .map(k => ({ key: k, updatedAt: store[k]?.updatedAt ?? null, confidence: store[k]?.confidence ?? 1 }))
    .sort((a, b) => {
      if (!a.updatedAt) return 1;
      if (!b.updatedAt) return -1;
      return b.updatedAt.localeCompare(a.updatedAt);
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
          All data is stored locally in your browser. Click any topic badge to cycle: Seen → Understand → Can explain → reset.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="pg-stats">
        <div className="pg-stat">
          <div className="pg-stat__num pg-stat__num--amber">{seen.length}</div>
          <div className="pg-stat__label">Seen (≥1)</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat__num pg-stat__num--blue">{understood.length}</div>
          <div className="pg-stat__label">Understand (≥2)</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat__num pg-stat__num--green">{mastered.length}</div>
          <div className="pg-stat__label">Can explain (3)</div>
        </div>
        <div className="pg-stat">
          <div className="pg-stat__num pg-stat__num--purple">{pct}%</div>
          <div className="pg-stat__label">Overall Started</div>
        </div>
      </div>

      {/* Review queue */}
      <div className="pg-routes__title" style={{ marginBottom: '12px' }}>Review Queue</div>
      <ReviewQueue />

      {/* Per-route progress bars */}
      <div className="pg-routes">
        <div className="pg-routes__title">Progress by Route</div>
        {ROUTE_TOPICS.map(r => {
          const s1 = r.topics.filter(k => (store[k]?.confidence ?? 0) === 1).length;
          const s2 = r.topics.filter(k => (store[k]?.confidence ?? 0) === 2).length;
          const s3 = r.topics.filter(k => (store[k]?.confidence ?? 0) === 3).length;
          const total = r.topics.length;
          const pct1 = total === 0 ? 0 : (s1 / total) * 100;
          const pct2 = total === 0 ? 0 : (s2 / total) * 100;
          const pct3 = total === 0 ? 0 : (s3 / total) * 100;
          const started = s1 + s2 + s3;
          return (
            <div key={r.route} className="pg-route-row">
              <div className="pg-route-row__name">
                {r.icon} <Link to={r.path}>{r.label}</Link>
              </div>
              <div className="pg-bar-track">
                <div className="pg-bar-fill pg-bar-fill--amber" style={{ width: `${pct1}%` }} />
                <div className="pg-bar-fill pg-bar-fill--blue"  style={{ width: `${pct2}%` }} />
                <div className="pg-bar-fill pg-bar-fill--green" style={{ width: `${pct3}%` }} />
              </div>
              <div className="pg-route-row__pct">{started}/{total}</div>
            </div>
          );
        })}
        <div className="pg-bar-legend">
          <span className="pg-bar-legend__item pg-bar-legend__item--amber">◐ Seen</span>
          <span className="pg-bar-legend__item pg-bar-legend__item--blue">◕ Understand</span>
          <span className="pg-bar-legend__item pg-bar-legend__item--green">✓ Can explain</span>
        </div>
      </div>

      {/* Pending / Reviewed panels */}
      <div className="pg-two-col">

        {/* Pending */}
        <div className="pg-panel">
          <div className="pg-panel__head pg-panel__head--pending">
            ⏳ Not started ({pending.length})
          </div>
          {pending.length === 0 ? (
            <div className="pg-panel__empty">🎉 All topics started!</div>
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
            ✅ In progress ({reviewed.length})
          </div>
          {reviewed.length === 0 ? (
            <div className="pg-panel__empty">No topics started yet. Click any topic badge to begin!</div>
          ) : (
            <ul className="pg-panel__list">
              {reviewed.map(({ key: k, updatedAt, confidence }) => {
                const rt = ROUTE_TOPICS.find(r => r.topics.includes(k));
                return (
                  <li key={k} className="pg-panel__item">
                    <span className="pg-panel__item-name">
                      {rt ? <Link to={rt.path}>{shortTitle(k)}</Link> : shortTitle(k)}
                    </span>
                    <span className={`pg-conf ${CONF_CLASS[confidence]}`}>
                      {CONF_LABEL[confidence]}
                    </span>
                    <span className="pg-panel__item-date">{formatCheckedDate(updatedAt)}</span>
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
