import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { TradeBlotter } from '../../../components/TradeBlotter/TradeBlotter';
import type { Trade, TradeType } from '../../../types';
import './DealTicketPage.css';

const PAIRS = ['USD/INR', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'];
const TYPES: TradeType[] = ['VANILLA_CALL', 'VANILLA_PUT', 'NDF', 'COLLAR'];

export default function DealTicketPage() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pair, setPair] = useState(PAIRS[0]);
  const [type, setType] = useState<TradeType>('VANILLA_CALL');
  const [notional, setNotional] = useState('1000000');
  const [strike, setStrike] = useState('83.5');
  const [expiry, setExpiry] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() + 3);
    return d.toISOString().substring(0, 10);
  });
  const [rfqId, setRfqId] = useState('');
  const [booked, setBooked] = useState<Trade | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const premium = type === 'COLLAR' ? 0 : Number(notional) * 0.015;

  const loadTrades = useCallback(async () => {
    if (!user) return;
    const data = await api.getTrades(user.id);
    setTrades(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, [user]);

  useEffect(() => { loadTrades(); }, [loadTrades]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const trade = await api.bookTrade({
        rfqId: rfqId || undefined, type, currencyPair: pair,
        notional: Number(notional), strike: Number(strike), expiry, premium,
        userId: user.id, role: user.role,
      });
      setBooked(trade);
      setTrades(prev => [trade, ...prev]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="deal-ticket">
      <h2 className="deal-ticket__title">Deal Ticket</h2>
      <div className="deal-ticket__layout">
        <form className="deal-ticket__form" onSubmit={handleSubmit}>
          <h3>Book Trade</h3>
          {booked && (
            <div className="deal-ticket__success">
              Trade booked: <strong>{booked.id.substring(0, 8)}</strong>
            </div>
          )}
          <div className="deal-ticket__row">
            <label>Pair
              <select value={pair} onChange={e => setPair(e.target.value)}>
                {PAIRS.map(p => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label>Type
              <select value={type} onChange={e => setType(e.target.value as TradeType)}>
                {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </label>
          </div>
          <div className="deal-ticket__row">
            <label>Notional (USD)
              <input type="number" value={notional} onChange={e => setNotional(e.target.value)} min="100000" step="100000" />
            </label>
            <label>Strike Rate
              <input type="number" value={strike} onChange={e => setStrike(e.target.value)} step="0.0001" />
            </label>
          </div>
          <div className="deal-ticket__row">
            <label>Expiry Date
              <input type="date" value={expiry} onChange={e => setExpiry(e.target.value)} />
            </label>
            <label>Premium (auto)
              <input type="text" value={`USD ${premium.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} readOnly />
            </label>
          </div>
          <label>RFQ ID (optional)
            <input type="text" value={rfqId} onChange={e => setRfqId(e.target.value)} placeholder="Link to existing RFQ" />
          </label>
          <button className="deal-ticket__submit" type="submit" disabled={submitting}>
            {submitting ? 'Booking…' : 'Book Trade'}
          </button>
        </form>
        <div className="deal-ticket__blotter">
          <h3>My Trades</h3>
          <TradeBlotter trades={trades} />
        </div>
      </div>
    </div>
  );
}
