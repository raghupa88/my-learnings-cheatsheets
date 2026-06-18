import { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api } from '../../../services/api';
import { greeks$ } from '../../../services/websocket';
import type { GreeksSnapshot, Trade } from '../../../types';
import './RiskPage.css';

const MAX_HISTORY = 20;

export default function RiskPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [history, setHistory] = useState<GreeksSnapshot[]>([]);

  const loadTrades = useCallback(async () => {
    const data = await api.getTrades();
    const active = data.filter(t => t.status === 'ACTIVE');
    setTrades(active);
    if (active.length > 0 && !selectedId) setSelectedId(active[0].id);
  }, [selectedId]);

  useEffect(() => { loadTrades(); }, [loadTrades]);

  useEffect(() => {
    if (!selectedId) return;
    api.getGreeksHistory(selectedId).then(setHistory);
  }, [selectedId]);

  useEffect(() => {
    const sub = greeks$.subscribe((snap) => {
      if (snap.tradeId !== selectedId) return;
      setHistory(prev => {
        const next = [...prev, snap];
        return next.slice(-MAX_HISTORY);
      });
    });
    return () => sub.unsubscribe();
  }, [selectedId]);

  const chartData = history.map((h, i) => ({
    t: i,
    delta: +h.delta.toFixed(4),
    gamma: +h.gamma.toFixed(4),
    vega: +h.vega.toFixed(4),
    theta: +h.theta.toFixed(4),
  }));

  const latest = history[history.length - 1];

  return (
    <div className="risk-page">
      <div className="risk-page__header">
        <h2 className="risk-page__title">Greeks Dashboard</h2>
        <div className="risk-page__selector">
          <label>Trade</label>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            {trades.map(t => (
              <option key={t.id} value={t.id}>{t.id.substring(0, 8)} — {t.currencyPair} {t.type.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {latest && (
        <div className="risk-page__summary">
          {[
            { key: 'delta', label: 'Δ Delta', value: latest.delta.toFixed(4) },
            { key: 'gamma', label: 'Γ Gamma', value: latest.gamma.toFixed(4) },
            { key: 'vega',  label: 'ν Vega',  value: latest.vega.toFixed(4) },
            { key: 'theta', label: 'Θ Theta', value: latest.theta.toFixed(4) },
          ].map(({ key, label, value }) => (
            <div key={key} className="risk-page__metric">
              <div className="risk-page__metric-label">{label}</div>
              <div className={`risk-page__metric-value risk-page__metric-value--${key}`}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="risk-page__charts">
        {[
          { key: 'delta', label: 'Delta (Δ)', color: '#4f9cf9' },
          { key: 'gamma', label: 'Gamma (Γ)', color: '#4caf82' },
          { key: 'vega',  label: 'Vega (ν)',  color: '#9b7fe8' },
          { key: 'theta', label: 'Theta (Θ)', color: '#e05c5c' },
        ].map(({ key, label, color }) => (
          <div key={key} className="risk-page__chart-card">
            <div className="risk-page__chart-label">{label}</div>
            <ResponsiveContainer width="100%" height={140}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" hide />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#8b8fa8' }} />
                <Tooltip
                  contentStyle={{ background: '#1a1d27', border: '1px solid #2e3148', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ display: 'none' }}
                />
                <Area type="monotone" dataKey={key} stroke={color} fill={`${color}22`} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {trades.length === 0 && (
        <p className="risk-page__empty">No active trades. Book a trade on the Deal Ticket page first.</p>
      )}
    </div>
  );
}
