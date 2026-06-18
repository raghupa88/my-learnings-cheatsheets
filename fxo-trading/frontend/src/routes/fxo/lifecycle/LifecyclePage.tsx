import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { lifecycle$ } from '../../../services/websocket';
import { TradeBlotter } from '../../../components/TradeBlotter/TradeBlotter';
import type { LifecycleEvent, LifecycleEventType, Trade, TradeStatus } from '../../../types';
import './LifecyclePage.css';

type Filter = 'ALL' | TradeStatus;

export default function LifecyclePage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [selected, setSelected] = useState<Trade | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [t, e] = await Promise.all([api.getTrades(), api.getAllLifecycleEvents()]);
    setTrades(t.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setEvents(e.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const sub = lifecycle$.subscribe((ev) => {
      setEvents(prev => [ev, ...prev]);
      setTrades(prev => prev.map(t => {
        if (t.id !== ev.tradeId) return t;
        const statusMap: Record<LifecycleEventType, TradeStatus> = {
          CONFIRMED: 'CONFIRMED', SETTLED: 'SETTLED', EXPIRED: 'EXPIRED', BARRIER_HIT: 'ACTIVE',
        };
        return { ...t, status: statusMap[ev.eventType] };
      }));
    });
    return () => sub.unsubscribe();
  }, []);

  const trigger = async (tradeId: string, eventType: LifecycleEventType) => {
    setActioning(tradeId + eventType);
    try {
      await api.triggerLifecycle(tradeId, eventType);
    } finally {
      setActioning(null);
    }
  };

  const daysTo = (expiry: string) => {
    const diff = new Date(expiry).getTime() - Date.now();
    return Math.ceil(diff / 86400000);
  };

  const filtered = filter === 'ALL' ? trades : trades.filter(t => t.status === filter);

  return (
    <div className="lifecycle-page">
      <div className="lifecycle-page__header">
        <h2 className="lifecycle-page__title">Lifecycle & Settlement</h2>
        <div className="lifecycle-page__filters">
          {(['ALL', 'ACTIVE', 'CONFIRMED', 'SETTLED', 'EXPIRED'] as Filter[]).map(f => (
            <button
              key={f}
              className={`lifecycle-page__filter${filter === f ? ' lifecycle-page__filter--active' : ''}`}
              onClick={() => setFilter(f)}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="lifecycle-page__layout">
        <div className="lifecycle-page__main">
          <div className="lifecycle-page__trade-list">
            {filtered.map(t => {
              const days = daysTo(t.expiry);
              const isActioning = actioning?.startsWith(t.id);
              return (
                <div
                  key={t.id}
                  className={`lifecycle-page__trade-card${selected?.id === t.id ? ' lifecycle-page__trade-card--selected' : ''}`}
                  onClick={() => setSelected(t)}
                >
                  <div className="lifecycle-page__trade-top">
                    <span className="lifecycle-page__trade-id">{t.id.substring(0, 8)}</span>
                    <span className="lifecycle-page__trade-pair">{t.currencyPair} {t.type.replace('_', ' ')}</span>
                    <span className={`lifecycle-page__days ${days < 7 ? 'lifecycle-page__days--urgent' : ''}`}>
                      {days > 0 ? `${days}d` : 'Expired'}
                    </span>
                  </div>
                  <div className="lifecycle-page__trade-bottom">
                    <span className="lifecycle-page__notional">${t.notional?.toLocaleString()}</span>
                    <div className="lifecycle-page__actions">
                      {t.status === 'ACTIVE' && (
                        <button className="lifecycle-page__action lifecycle-page__action--confirm"
                          onClick={e => { e.stopPropagation(); trigger(t.id, 'CONFIRMED'); }}
                          disabled={!!isActioning}>Confirm</button>
                      )}
                      {t.status === 'CONFIRMED' && (
                        <button className="lifecycle-page__action lifecycle-page__action--settle"
                          onClick={e => { e.stopPropagation(); trigger(t.id, 'SETTLED'); }}
                          disabled={!!isActioning}>Settle</button>
                      )}
                      {(t.status === 'ACTIVE' || t.status === 'CONFIRMED') && (
                        <button className="lifecycle-page__action lifecycle-page__action--expire"
                          onClick={e => { e.stopPropagation(); trigger(t.id, 'EXPIRED'); }}
                          disabled={!!isActioning}>Expire</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <p className="lifecycle-page__empty">No trades match this filter.</p>}
          </div>
        </div>

        <div className="lifecycle-page__sidebar">
          <h3>Event Timeline</h3>
          <div className="lifecycle-page__timeline">
            {events.slice(0, 30).map(ev => (
              <div key={ev.id} className="lifecycle-page__event">
                <div className={`lifecycle-page__event-dot lifecycle-page__event-dot--${ev.eventType.toLowerCase()}`} />
                <div className="lifecycle-page__event-body">
                  <span className="lifecycle-page__event-type">{ev.eventType}</span>
                  <span className="lifecycle-page__event-trade">{ev.tradeId.substring(0, 8)}</span>
                  <span className="lifecycle-page__event-time">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="lifecycle-page__empty">No events recorded.</p>}
          </div>
        </div>
      </div>

      {selected && (
        <div className="lifecycle-page__detail">
          <h3>Trade Detail — {selected.id.substring(0, 8)}</h3>
          <TradeBlotter trades={[selected]} />
        </div>
      )}
    </div>
  );
}
