import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { quotes$ } from '../../../services/websocket';
import { StatusBadge } from '../../../components/StatusBadge/StatusBadge';
import type { RFQ, TradeType } from '../../../types';
import './RFQPage.css';

const PAIRS = ['USD/INR', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];
const TYPES: TradeType[] = ['VANILLA_CALL', 'VANILLA_PUT', 'NDF', 'COLLAR'];

export default function RFQPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [pair, setPair] = useState(PAIRS[0]);
  const [type, setType] = useState<TradeType>('VANILLA_CALL');
  const [notional, setNotional] = useState('1000000');
  const [submitting, setSubmitting] = useState(false);
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());

  const loadRFQs = useCallback(async () => {
    const data = await api.getAllRFQs();
    setRfqs(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  useEffect(() => { loadRFQs(); }, [loadRFQs]);

  useEffect(() => {
    const sub = quotes$.subscribe((updated) => {
      setRfqs(prev => {
        const idx = prev.findIndex(r => r.id === updated.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updated;
          setFlashIds(f => new Set([...f, updated.id]));
          setTimeout(() => setFlashIds(f => { const n = new Set(f); n.delete(updated.id); return n; }), 1500);
          return next;
        }
        return [updated, ...prev];
      });
    });
    return () => sub.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const rfq = await api.createRFQ({ requestingUserId: user.id, currencyPair: pair, notional: Number(notional), type });
      setRfqs(prev => [rfq, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rfq-page">
      <h2 className="rfq-page__title">RFQ Blotter</h2>
      <div className="rfq-page__layout">
        <form className="rfq-page__form" onSubmit={handleSubmit}>
          <h3>New RFQ</h3>
          <label>Currency Pair
            <select value={pair} onChange={e => setPair(e.target.value)}>
              {PAIRS.map(p => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label>Trade Type
            <select value={type} onChange={e => setType(e.target.value as TradeType)}>
              {TYPES.map(t => <option key={t}>{t.replace('_', ' ')}</option>)}
            </select>
          </label>
          <label>Notional (USD)
            <input type="number" value={notional} onChange={e => setNotional(e.target.value)} min="100000" step="100000" />
          </label>
          <button className="rfq-page__submit" type="submit" disabled={submitting}>
            {submitting ? 'Sending…' : 'Submit RFQ'}
          </button>
        </form>

        <div className="rfq-page__blotter">
          <h3>Live RFQ Feed <span className="rfq-page__count">{rfqs.length}</span></h3>
          <table className="rfq-page__table">
            <thead>
              <tr><th>ID</th><th>Pair</th><th>Type</th><th>Notional</th><th>Bid</th><th>Offer</th><th>Status</th></tr>
            </thead>
            <tbody>
              {rfqs.map(r => (
                <tr key={r.id} className={flashIds.has(r.id) ? 'flash' : ''}>
                  <td className="rfq-page__id">{r.id.substring(0, 8)}</td>
                  <td>{r.currencyPair}</td>
                  <td>{r.type.replace('_', ' ')}</td>
                  <td>{r.notional?.toLocaleString()}</td>
                  <td className="rfq-page__rate">{r.bidRate?.toFixed(4) ?? '—'}</td>
                  <td className="rfq-page__rate">{r.offerRate?.toFixed(4) ?? '—'}</td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {rfqs.length === 0 && <p className="rfq-page__empty">No RFQs yet. Submit one above.</p>}
        </div>
      </div>
    </div>
  );
}
