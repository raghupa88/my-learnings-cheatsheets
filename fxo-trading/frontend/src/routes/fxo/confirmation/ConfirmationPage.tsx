import { useState, useEffect, useCallback } from 'react';
import { api } from '../../../services/api';
import { lifecycle$ } from '../../../services/websocket';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import type { LifecycleEvent, Trade } from '../../../types';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [selected, setSelected] = useState<Trade | null>(null);
  const [swift, setSwift] = useState('');
  const [confirming, setConfirming] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [t, e] = await Promise.all([api.getTrades(), api.getAllLifecycleEvents()]);
    setTrades(t.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setEvents(e.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const sub = lifecycle$.subscribe((ev) => {
      setEvents(prev => [ev, ...prev]);
      if (ev.eventType === 'CONFIRMED') {
        setTrades(prev => prev.map(t => t.id === ev.tradeId ? { ...t, status: 'CONFIRMED' } : t));
        setSwift(ev.payload);
      }
    });
    return () => sub.unsubscribe();
  }, []);

  const handleConfirm = async (trade: Trade) => {
    setConfirming(trade.id);
    try {
      const ev = await api.triggerLifecycle(trade.id, 'CONFIRMED');
      setSwift(ev.payload);
      setSelected(trade);
      setTrades(prev => prev.map(t => t.id === trade.id ? { ...t, status: 'CONFIRMED' } : t));
    } finally {
      setConfirming(null);
    }
  };

  const pending = trades.filter(t => t.status === 'ACTIVE');

  return (
    <div className="confirm-page">
      <h2 className="confirm-page__title">Confirmation & SWIFT</h2>
      <div className="confirm-page__layout">
        <div className="confirm-page__left">
          <div className="confirm-page__section">
            <h3>Pending Confirmation ({pending.length})</h3>
            {pending.length === 0 && <p className="confirm-page__empty">All trades confirmed.</p>}
            {pending.map(t => (
              <div key={t.id} className="confirm-page__trade-row">
                <div className="confirm-page__trade-info">
                  <span className="confirm-page__trade-id">{t.id.substring(0, 8)}</span>
                  <span>{t.currencyPair} {t.type.replace('_', ' ')}</span>
                  <StatusBadge status={t.status} />
                </div>
                <button
                  className="confirm-page__btn"
                  onClick={() => handleConfirm(t)}
                  disabled={confirming === t.id}
                >
                  {confirming === t.id ? 'Confirming…' : 'Confirm'}
                </button>
              </div>
            ))}
          </div>

          <div className="confirm-page__section">
            <h3>Lifecycle Events</h3>
            <div className="confirm-page__events">
              {events.slice(0, 20).map(ev => (
                <div key={ev.id} className="confirm-page__event">
                  <span className="confirm-page__event-type">{ev.eventType}</span>
                  <span className="confirm-page__event-trade">{ev.tradeId.substring(0, 8)}</span>
                  <span className="confirm-page__event-time">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
              {events.length === 0 && <p className="confirm-page__empty">No events yet.</p>}
            </div>
          </div>
        </div>

        <div className="confirm-page__right">
          <h3>SWIFT MT300 Preview {selected && <span className="confirm-page__trade-ref">— {selected.id.substring(0, 8)}</span>}</h3>
          {swift ? (
            <pre className="confirm-page__swift">{swift}</pre>
          ) : (
            <p className="confirm-page__empty">Confirm a trade to see the SWIFT MT300 message.</p>
          )}
        </div>
      </div>
    </div>
  );
}
