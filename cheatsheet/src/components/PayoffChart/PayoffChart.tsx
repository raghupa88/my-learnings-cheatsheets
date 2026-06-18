import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { ChartType } from '../../types';
import './PayoffChart.css';

interface PayoffChartProps {
  type: ChartType;
  strike?: number;
  premium?: number;
  forward?: number;
}

function generateData(type: ChartType, K: number, premium: number, F: number) {
  const points: { price: number; payoff: number; profit?: number }[] = [];
  for (let S = 60; S <= 140; S += 2) {
    let payoff = 0;
    let profit = 0;
    switch (type) {
      case 'long-forward':
        payoff = S - F;
        profit = payoff;
        break;
      case 'short-forward':
        payoff = F - S;
        profit = payoff;
        break;
      case 'long-call':
        payoff = Math.max(S - K, 0);
        profit = payoff - premium;
        break;
      case 'short-call':
        payoff = -Math.max(S - K, 0);
        profit = payoff + premium;
        break;
      case 'long-put':
        payoff = Math.max(K - S, 0);
        profit = payoff - premium;
        break;
      case 'short-put':
        payoff = -Math.max(K - S, 0);
        profit = payoff + premium;
        break;
      case 'long-straddle':
        payoff = Math.max(S - K, 0) + Math.max(K - S, 0);
        profit = payoff - 2 * premium;
        break;
    }
    points.push({ price: S, payoff: parseFloat(payoff.toFixed(2)), profit: parseFloat(profit.toFixed(2)) });
  }
  return points;
}

const CHART_LABELS: Record<ChartType, string> = {
  'long-forward': 'Long Forward Payoff',
  'short-forward': 'Short Forward Payoff',
  'long-call': 'Long Call P&L',
  'short-call': 'Short Call P&L',
  'long-put': 'Long Put P&L',
  'short-put': 'Short Put P&L',
  'long-straddle': 'Long Straddle P&L',
};

export function PayoffChart({ type, strike = 100, premium = 5, forward = 100 }: PayoffChartProps) {
  const data = generateData(type, strike, premium, forward);
  const isForward = type === 'long-forward' || type === 'short-forward';

  return (
    <div className="payoff-chart">
      <p className="payoff-chart__title">{CHART_LABELS[type]}</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="price"
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 11 }}
            label={{ value: 'Spot (S_T)', position: 'insideBottomRight', offset: -5, fontSize: 11, fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 11 }}
            label={{ value: 'P&L', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--color-text-muted)' }}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '12px',
              color: 'var(--color-text)',
            }}
            formatter={(value: number) => [value.toFixed(2), '']}
            labelFormatter={(label: number) => `S_T = ${label}`}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
          <ReferenceLine y={0} stroke="var(--color-text-dim)" strokeDasharray="4 2" />
          <ReferenceLine x={isForward ? forward : strike} stroke="var(--color-warning)" strokeDasharray="4 2" label={{ value: isForward ? 'F' : 'K', fill: 'var(--color-warning)', fontSize: 11 }} />
          {isForward ? (
            <Line type="monotone" dataKey="payoff" stroke="var(--color-primary)" dot={false} strokeWidth={2} name="Payoff" />
          ) : (
            <>
              <Line type="monotone" dataKey="payoff" stroke="var(--color-text-muted)" dot={false} strokeWidth={1.5} strokeDasharray="5 3" name="Payoff at expiry" />
              <Line type="monotone" dataKey="profit" stroke="var(--color-primary)" dot={false} strokeWidth={2} name="P&L (incl. premium)" />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
