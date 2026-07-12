import { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceArea, ResponsiveContainer, Legend,
} from 'recharts';
import { FormulaBlock } from '../../components/FormulaBlock/FormulaBlock';
import './FxOptionsPage.css';

/* ─── Tooltip helper types ───────────────────────────────────────────────── */
interface TPayload {
  name: string;
  value: number;
  color?: string;
}
interface TProps {
  active?: boolean;
  payload?: TPayload[];
  label?: number | string;
}

/* ─── Lifecycle data ─────────────────────────────────────────────────────── */
const LIFECYCLE_STEPS = [
  {
    num: 1,
    icon: '💬',
    label: 'Pre-Trade',
    badge: 'Quote',
    title: 'Pre-Trade — Client Request & Pricing',
    body: 'The client approaches Sales with a hedging need (e.g. "I have a $2m USD receivable in 90 days"). Sales asks the Trader for an indicative price. For an FX forward, the pricing engine builds a forward curve from spot + interest-rate differentials. For an option, it pulls the implied volatility surface to run the Garman-Kohlhagen model and generate a quote.',
    systems: ['Pricing Engine', 'Live Market Data', 'Vol Surface Feed', 'CRM / Salesforce'],
  },
  {
    num: 2,
    icon: '✅',
    label: 'Execution',
    badge: 'Booking',
    title: 'Execution — Deal Agreed & Booked',
    body: 'Client accepts the price. The deal is captured immediately into the booking system with full economics: notional, rate/strike, value date, counterparty, and — for options — the premium. The trade now lives in the risk book, and the Trader\'s position updates in real time. An option premium leg is also booked and settled T+2.',
    systems: ['Murex', 'Calypso', 'FENICS', 'TradeWeb', 'Bloomberg TSOX'],
  },
  {
    num: 3,
    icon: '📋',
    label: 'Confirmation',
    badge: 'Legal Match',
    title: 'Confirmation — Legal Term Matching',
    body: 'The bank and client legally confirm the trade terms match what was agreed. FX forwards use SWIFT MT300 messages; options use MT305 or platforms like MarkitWire. Any mismatch (wrong notional, wrong date) must be resolved before settlement. This is a key operational risk point — confirmation breaks can cause missed settlement if caught late.',
    systems: ['SWIFT MT300/MT305', 'MarkitWire', 'DTCC', 'Traiana Harmony'],
  },
  {
    num: 4,
    icon: '🔄',
    label: 'Lifecycle Events',
    badge: 'Ongoing',
    title: 'Lifecycle Events — Continuous Management',
    body: 'This is the critical divergence between forwards and options. A forward just sits quietly — book it, wait, settle it. An option must be continuously revalued against live spot and vol; barrier options require real-time monitoring for knock-in/knock-out events; Greeks must be recomputed for hedging. Exercise decisions are made at or before expiry. Options are far more operationally intensive.',
    systems: ['Risk Engine (real-time)', 'Barrier Monitor', 'Greeks PnL Engine', 'Collateral Manager (CSA)'],
  },
  {
    num: 5,
    icon: '💰',
    label: 'Settlement',
    badge: 'Cash Moves',
    title: 'Settlement — Cash Movement',
    body: 'For a forward: both parties exchange the agreed amounts (physical delivery) or cash-settle the difference (NDF). For an option: if exercised, the holder receives the payoff; if it lapses OTM, nothing moves (other than the premium already paid at inception). Settlement instructions flow via SWIFT payment messages (MT202, MT103) and nostro accounts are reconciled end-of-day.',
    systems: ['SWIFT MT202/MT103', 'Nostro Reconciliation', 'CLS Settlement', 'Back-Office Systems'],
  },
];

/* ─── Greek chart data ───────────────────────────────────────────────────── */
function deltaData() {
  const d = [];
  for (let S = 60; S <= 140; S += 2) {
    const x = (S - 100) / 12;
    const callDelta = 1 / (1 + Math.exp(-x));
    const putDelta = callDelta - 1;
    d.push({ S, callDelta: parseFloat(callDelta.toFixed(3)), putDelta: parseFloat(putDelta.toFixed(3)) });
  }
  return d;
}

function gammaData() {
  const d = [];
  for (let S = 60; S <= 140; S += 2) {
    const x = (S - 100) / 12;
    const gamma = Math.exp(-0.5 * x * x) / (12 * Math.sqrt(2 * Math.PI));
    d.push({ S, gamma: parseFloat(gamma.toFixed(4)) });
  }
  return d;
}

function vegaData() {
  const d = [];
  for (let S = 60; S <= 140; S += 2) {
    const x = (S - 100) / 12;
    const vega = S * 0.5 * Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
    d.push({ S, vega: parseFloat(vega.toFixed(2)) });
  }
  return d;
}

function thetaData() {
  const d = [];
  // T goes 1.0 → 0.05 so the chart reads "far from expiry → near expiry" (left to right)
  for (let T = 1.0; T >= 0.05; T -= 0.02) {
    const theta = -5 / Math.sqrt(T * 2 * Math.PI) - 0.5;
    d.push({ T: parseFloat(T.toFixed(2)), theta: parseFloat(theta.toFixed(3)) });
  }
  return d;
}

/* ─── Payoff profile data ────────────────────────────────────────────────── */
function vanillaCallPayoffData() {
  const strike = 86.0;
  const premium = 0.8;
  const d = [];
  for (let S = 82; S <= 92; S += 0.25) {
    const gross = Math.max(S - strike, 0);
    const net = gross - premium;
    d.push({ spot: parseFloat(S.toFixed(2)), gross: parseFloat(gross.toFixed(3)), net: parseFloat(net.toFixed(3)) });
  }
  return d;
}

function vanillaPutPayoffData() {
  const strike = 86.0;
  const premium = 0.75;
  const d = [];
  for (let S = 82; S <= 92; S += 0.25) {
    const gross = Math.max(strike - S, 0);
    const net = gross - premium;
    d.push({ spot: parseFloat(S.toFixed(2)), gross: parseFloat(gross.toFixed(3)), net: parseFloat(net.toFixed(3)) });
  }
  return d;
}

/* ─── Collar payoff data ─────────────────────────────────────────────────── */
function collarPayoffData() {
  const floor = 85.5;
  const cap = 88.5;
  const d = [];
  for (let S = 82; S <= 92; S += 0.25) {
    const unhedged = S;
    const collar = Math.min(Math.max(S, floor), cap);
    d.push({
      spot: parseFloat(S.toFixed(2)),
      unhedged: parseFloat(unhedged.toFixed(3)),
      collar: parseFloat(collar.toFixed(3)),
    });
  }
  return d;
}

const DELTA_DATA = deltaData();
const GAMMA_DATA = gammaData();
const VEGA_DATA = vegaData();
const THETA_DATA = thetaData();
const COLLAR_DATA = collarPayoffData();
const CALL_DATA = vanillaCallPayoffData();
const PUT_DATA = vanillaPutPayoffData();

/* ─── Custom tooltips ────────────────────────────────────────────────────── */
const TOOLTIP_CONTENT_STYLE = {
  background: 'var(--color-surface-elevated)',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '11px',
  color: 'var(--color-text)',
};

function DeltaTooltip({ active, payload, label }: TProps) {
  if (!active || !payload?.length) return null;
  const call = payload.find(p => p.name === 'Call Δ');
  const put = payload.find(p => p.name === 'Put Δ');
  return (
    <div style={{ ...TOOLTIP_CONTENT_STYLE, padding: '10px 14px', maxWidth: 220 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-text-muted)' }}>Spot = {label}</div>
      {call && (
        <div style={{ marginBottom: 4 }}>
          <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Call Δ = {call.value.toFixed(3)}</span>
          <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>
            Gains {(call.value * 100).toFixed(0)}¢ per $1 spot rise · hedge ratio: sell {(call.value * 100).toFixed(0)}% of notional
          </div>
        </div>
      )}
      {put && (
        <div>
          <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>Put Δ = {put.value.toFixed(3)}</span>
          <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>
            Gains {Math.abs(put.value * 100).toFixed(0)}¢ per $1 spot fall
          </div>
        </div>
      )}
    </div>
  );
}

function GammaTooltip({ active, payload, label }: TProps) {
  if (!active || !payload?.length) return null;
  const g = payload[0];
  const isNearATM = Math.abs((label as number) - 100) < 8;
  return (
    <div style={{ ...TOOLTIP_CONTENT_STYLE, padding: '10px 14px', maxWidth: 220 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-text-muted)' }}>Spot = {label}</div>
      <div>
        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Γ = {g?.value.toFixed(4)}</span>
        <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
          {isNearATM
            ? 'Near ATM — delta is changing fast. Re-hedge frequently.'
            : 'Far from ATM — delta is stable. Less re-hedging needed.'}
        </div>
      </div>
    </div>
  );
}

function VegaTooltip({ active, payload, label }: TProps) {
  if (!active || !payload?.length) return null;
  const v = payload[0];
  return (
    <div style={{ ...TOOLTIP_CONTENT_STYLE, padding: '10px 14px', maxWidth: 220 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-text-muted)' }}>Spot = {label}</div>
      <div>
        <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>ν = {v?.value.toFixed(2)}</span>
        <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
          A 1% rise in implied vol adds ≈ {v?.value.toFixed(2)} to option value
        </div>
      </div>
    </div>
  );
}

function ThetaTooltip({ active, payload, label }: TProps) {
  if (!active || !payload?.length) return null;
  const t = payload[0];
  const daysLeft = Math.round((label as number) * 365);
  return (
    <div style={{ ...TOOLTIP_CONTENT_STYLE, padding: '10px 14px', maxWidth: 220 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-text-muted)' }}>
        T = {label} yr ({daysLeft} days to expiry)
      </div>
      <div>
        <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>Θ = {t?.value.toFixed(3)}</span>
        <div style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
          {Math.abs(t?.value ?? 0).toFixed(3)} lost per day from time decay
          {daysLeft < 30 ? ' — theta bleed is accelerating rapidly near expiry' : ''}
        </div>
      </div>
    </div>
  );
}

function PayoffTooltip({ active, payload, label }: TProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...TOOLTIP_CONTENT_STYLE, padding: '10px 14px', maxWidth: 200 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-text-muted)' }}>Spot = {label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ marginBottom: 3 }}>
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}: {(p.value as number) >= 0 ? '+' : ''}{(p.value as number).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

function CollarTooltip({ active, payload, label }: TProps) {
  if (!active || !payload?.length) return null;
  const spot = label as number;
  const zone = spot < 85.5 ? 'Protected — put exercised, floor at 85.50' : spot > 88.5 ? 'Capped — call exercised by bank, cap at 88.50' : 'Free range — both options lapse, market rate applies';
  return (
    <div style={{ ...TOOLTIP_CONTENT_STYLE, padding: '10px 14px', maxWidth: 240 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--color-text-muted)' }}>Spot = {label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ marginBottom: 3 }}>
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}: {(p.value as number).toFixed(2)}</span>
        </div>
      ))}
      <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: 10 }}>
        {zone}
      </div>
    </div>
  );
}

/* ─── Greeks ─────────────────────────────────────────────────────────────── */
const GREEKS = [
  {
    symbol: 'Δ',
    name: 'Delta',
    plain: 'Current exposure to spot',
    description:
      'Delta measures how much the option\'s value changes for a $1 move in the underlying spot rate. A call with Δ = 0.60 gains ~$0.60 in value if spot rises by $1. Delta is also the hedge ratio: to delta-hedge a long call, sell Δ units of the underlying. Call delta ∈ (0, 1); put delta ∈ (−1, 0).',
    insight:
      'SCB trading desks run books with net delta close to zero — any residual is either a deliberate position or must be hedged in the spot market. Delta changes as spot moves, so hedges must be rebalanced continuously (dynamic delta hedging). The chart shows the S-curve shape: deep ITM → Δ ≈ ±1, ATM → Δ ≈ ±0.5, deep OTM → Δ ≈ 0.',
    formula: '\\Delta_{call} = N(d_1), \\quad \\Delta_{put} = N(d_1) - 1',
    formulaLabel: 'Delta (Garman-Kohlhagen)',
    renderChart: () => (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={DELTA_DATA} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
          <defs>
            <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="putGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="S"
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 10 }}
            label={{ value: 'Spot Price', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 10 }}
            domain={[-1, 1]}
            tickCount={5}
            label={{ value: 'Delta', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <Tooltip content={<DeltaTooltip />} />
          <ReferenceLine y={0} stroke="var(--color-text-dim)" strokeDasharray="3 2" />
          <ReferenceLine y={0.5} stroke="var(--color-text-dim)" strokeDasharray="2 4" strokeOpacity={0.4} label={{ value: 'Δ=+0.5 (ATM call)', fill: 'var(--color-text-muted)', fontSize: 9, position: 'right' }} />
          <ReferenceLine y={-0.5} stroke="var(--color-text-dim)" strokeDasharray="2 4" strokeOpacity={0.4} label={{ value: 'Δ=−0.5 (ATM put)', fill: 'var(--color-text-muted)', fontSize: 9, position: 'right' }} />
          <ReferenceLine x={100} stroke="var(--color-warning)" strokeDasharray="3 2" label={{ value: 'ATM (K=100)', fill: 'var(--color-warning)', fontSize: 10 }} />
          <Area type="monotone" dataKey="callDelta" stroke="#60a5fa" strokeWidth={2} fill="url(#callGrad)" baseValue={0} name="Call Δ" dot={false} />
          <Area type="monotone" dataKey="putDelta" stroke="#a78bfa" strokeWidth={2} fill="url(#putGrad)" baseValue={0} name="Put Δ" dot={false} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </AreaChart>
      </ResponsiveContainer>
    ),
  },
  {
    symbol: 'Γ',
    name: 'Gamma',
    plain: 'Exposure instability / speed of delta change',
    description:
      'Gamma is the second derivative of option value with respect to spot — the rate at which delta itself changes. High gamma means a small spot move causes a large delta shift, requiring frequent and costly hedge rebalancing. Gamma peaks for ATM options close to expiry and falls toward zero as spot moves far OTM or ITM.',
    insight:
      'Being "long gamma" (long options) profits from large spot moves regardless of direction — the position self-adjusts. Being "short gamma" (sold options) bleeds on vol as you must constantly re-hedge. The bell-curve peak at ATM (S=100) is the danger zone for short-gamma books — one large move here causes maximum re-hedging cost.',
    formula: '\\Gamma = \\frac{N\'(d_1)}{S \\sigma \\sqrt{T}}',
    formulaLabel: 'Gamma',
    renderChart: () => (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={GAMMA_DATA} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
          <defs>
            <linearGradient id="gammaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="S"
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 10 }}
            label={{ value: 'Spot Price', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 10 }}
            label={{ value: 'Gamma', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <Tooltip content={<GammaTooltip />} />
          <ReferenceLine x={100} stroke="var(--color-warning)" strokeDasharray="3 2" label={{ value: 'ATM — peak gamma', fill: 'var(--color-warning)', fontSize: 10 }} />
          <Area type="monotone" dataKey="gamma" stroke="#34d399" strokeWidth={2} fill="url(#gammaGrad)" name="Gamma Γ" dot={false} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </AreaChart>
      </ResponsiveContainer>
    ),
  },
  {
    symbol: 'ν',
    name: 'Vega',
    plain: 'Fear sensitivity / implied vol exposure',
    description:
      'Vega measures option value change for a 1% move in implied volatility. It is identical for calls and puts with the same strike and maturity. Long options = long vega: rising market fear benefits option holders. Vega is highest for ATM options with longer maturities, making long-dated ATM options the most vol-sensitive instruments.',
    insight:
      'In FX options, the volatility surface is quoted by delta and tenor. SCB vol traders actively trade vega via risk reversals (skew) and butterflies (kurtosis/smile). The chart shows Vega peaks at ATM and falls symmetrically — OTM and ITM options are less sensitive to vol changes because they are either mostly extrinsic or mostly intrinsic.',
    formula: '\\nu = S \\sqrt{T} \\cdot N\'(d_1)',
    formulaLabel: 'Vega',
    renderChart: () => (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={VEGA_DATA} margin={{ top: 8, right: 12, bottom: 16, left: 0 }}>
          <defs>
            <linearGradient id="vegaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="S"
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 10 }}
            label={{ value: 'Spot Price', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 10 }}
            label={{ value: 'Vega', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <Tooltip content={<VegaTooltip />} />
          <ReferenceLine x={100} stroke="var(--color-warning)" strokeDasharray="3 2" label={{ value: 'ATM — max vega', fill: 'var(--color-warning)', fontSize: 10 }} />
          <Area type="monotone" dataKey="vega" stroke="#fbbf24" strokeWidth={2} fill="url(#vegaGrad)" name="Vega ν" dot={false} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </AreaChart>
      </ResponsiveContainer>
    ),
  },
  {
    symbol: 'Θ',
    name: 'Theta',
    plain: 'Daily cost of holding time value',
    description:
      'Theta is the daily erosion of an option\'s value purely from time passing, all else equal. It is negative for option buyers (you bleed theta every day you hold) and positive for option sellers (you collect it). Theta accelerates sharply as expiry approaches — the bleed is not linear. The chart reads left (far from expiry) to right (near expiry).',
    insight:
      'Theta vs Gamma trade-off is central to options P&L: long gamma earns money from spot moves but bleeds theta daily; short gamma collects theta but risks large losses on big moves. This is the fundamental tension a vol desk manages. Expressed as: Γ·σ²·S²/2 + Θ + r·S·Δ = r·V. Near expiry, theta dominates — ATM options bleed fastest.',
    formula: '\\Theta = -\\frac{S\\sigma N\'(d_1)}{2\\sqrt{T}} - rKe^{-rT}N(d_2)',
    formulaLabel: 'Theta (call)',
    renderChart: () => (
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={THETA_DATA} margin={{ top: 8, right: 12, bottom: 16, left: 8 }}>
          <defs>
            <linearGradient id="thetaGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="5%" stopColor="#f87171" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f87171" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="T"
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 10 }}
            reversed
            label={{ value: 'Time to Expiry (yr) ← expiry', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            tick={{ fontSize: 10 }}
            label={{ value: 'Theta (daily)', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-muted)' }}
          />
          <Tooltip content={<ThetaTooltip />} />
          <ReferenceLine y={0} stroke="var(--color-text-dim)" strokeDasharray="3 2" />
          <ReferenceLine x={0.08} stroke="var(--color-error)" strokeDasharray="3 2" strokeOpacity={0.7} label={{ value: '~30d: bleed accelerates', fill: 'var(--color-error)', fontSize: 9 }} />
          <Area type="monotone" dataKey="theta" stroke="#f87171" strokeWidth={2} fill="url(#thetaGrad)" baseValue={0} name="Theta Θ" dot={false} />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </AreaChart>
      </ResponsiveContainer>
    ),
  },
];

/* ─── Key terms data ─────────────────────────────────────────────────────── */
const KEY_TERMS = [
  {
    icon: '📦',
    name: 'Notional',
    abbr: 'Contract Size',
    definition:
      'The face amount on which derivative payments are calculated. For an FX option, the notional is the currency amount the client can buy or sell at the strike. Critically, notional is not exchanged in most derivatives — only the payoff or net settlement flows.',
    example: 'Notional: USD 2,000,000 (right to sell at 85.50)',
  },
  {
    icon: '🎯',
    name: 'Strike Price',
    abbr: 'Exercise Rate',
    definition:
      'The exchange rate locked into the option contract — the rate at which the holder can buy (call) or sell (put) the base currency at expiry. Agreed at inception; does not change. Options are described as ITM, ATM, or OTM relative to the current spot vs the strike.',
    example: 'Strike: USD/INR 85.50 (put floor in zero-cost collar)',
  },
  {
    icon: '💸',
    name: 'Premium',
    abbr: 'Option Price',
    definition:
      'The upfront cost paid by the option buyer to the seller for the rights conveyed by the option. Premium compensates the seller for taking on the risk of an adverse move. Premium = Intrinsic Value + Time Value. For vanilla FX options, settled T+2 from trade date.',
    example: 'Premium: ~INR 0.45 per USD (quoted as % of notional or pips)',
  },
  {
    icon: '📍',
    name: 'Spot vs Forward',
    abbr: 'Rate Types',
    definition:
      'Spot is the current market exchange rate for T+2 delivery. A forward rate is agreed today for delivery on a future date, derived from spot via interest rate parity: F = S × e^(r_d−r_f)T. Forward points (F−S) can be positive or negative depending on the interest rate differential.',
    example: 'Spot: 86.42 | 3m Forward ≈ 87.20 (INR rates higher than USD)',
  },
  {
    icon: '📏',
    name: 'Pip',
    abbr: 'Price Increment',
    definition:
      'The smallest standard price move in an FX quote. For most pairs, 1 pip = 0.0001. For USD/JPY, 1 pip = 0.01. Pip value = (pip size ÷ exchange rate) × lot size. Spreads, P&L, and forward points are often quoted in pips. "Pipette" = 0.1 pip (5th decimal).',
    example: 'USD/SGD spread: 2 pips = 0.0002. 10,000 USD lot → $2 spread cost',
  },
  {
    icon: '🔒',
    name: 'NDF — Non-Deliverable Forward',
    abbr: 'Restricted Currency',
    definition:
      'A cash-settled forward for currencies where physical delivery is restricted (INR, IDR, KRW, BRL, CNY offshore). On settlement date, the difference between the agreed NDF rate and the fixing rate (e.g. RBI reference rate for INR) is paid in a hard currency (usually USD). Eliminates the need to hold local currency.',
    example: 'INR NDF: agreed ₹86.42, fixing ₹87.00 → seller pays 0.58 × notional in USD',
  },
];

/* ─── Systems landscape data ─────────────────────────────────────────────── */
const SYSTEMS = [
  {
    icon: '📊',
    name: 'Pricing Engine',
    desc: 'Generates real-time quotes. For forwards: builds forward curve from spot + interest differentials. For options: runs Garman-Kohlhagen against the live implied vol surface. Prices must be generated in milliseconds for electronic flow.',
    tools: ['In-house Quant Library', 'Bloomberg BVAL', 'SuperDerivatives'],
  },
  {
    icon: '📚',
    name: 'Booking & Risk (Front Office)',
    desc: 'Captures trades and continuously recomputes Greeks, P&L, and risk metrics. Options require real-time revaluation; forwards can be batch-revalued. Feeds the risk dashboard and limit monitoring systems.',
    tools: ['Murex MX.3', 'Calypso', 'FENICS', 'Finastra Summit'],
  },
  {
    icon: '📡',
    name: 'Confirmation',
    desc: 'Ensures both bank and counterparty agree on exact trade terms before settlement. Mismatches (broken confirms) are an operational risk that can cause settlement failures. Automated matching is preferred over manual affirmation.',
    tools: ['SWIFT MT300/305', 'MarkitWire', 'Traiana Harmony', 'DTCC'],
  },
  {
    icon: '🏛️',
    name: 'Regulatory Reporting',
    desc: 'Fires on every booking, amendment, or cancellation. Reports trade economics and risk to regulators. Under EMIR (EU), Dodd-Frank (US), and MAS 610 (Singapore). Latency requirements can be T+1 or real-time depending on jurisdiction.',
    tools: ['EMIR / Dodd-Frank', 'DTCC GTR', 'UnaVista', 'Bloomberg ARX'],
  },
  {
    icon: '💳',
    name: 'Settlement',
    desc: 'Executes the actual cash movements at maturity or exercise. FX settlement uses nostro accounts at correspondent banks. CLS (Continuous Linked Settlement) mitigates Herstatt risk by settling both legs simultaneously for major currency pairs.',
    tools: ['SWIFT MT202/MT103', 'CLS Bank', 'Nostro Systems', 'Payment Hubs'],
  },
  {
    icon: '🔍',
    name: 'Reconciliation',
    desc: 'Ensures trade-as-booked = trade-as-confirmed = trade-as-settled across systems. Breaks surface from timing differences, fee calculations, or system misalignments. Critical for regulatory reporting accuracy and audit trails.',
    tools: ['TLM (SmartStream)', 'Duco', 'Internal Recon Systems'],
  },
];

/* ─── Sales vs Trader widgets ───────────────────────────────────────────── */
const SALES_WIDGETS = [
  { label: 'Client Book', detail: 'KYC status, credit limits, open hedges, upcoming maturities per client' },
  { label: 'Indicative Price Stream', detail: 'Live composite FX rates and option premiums for client conversations' },
  { label: 'RFQ Ticket', detail: 'Send Request-For-Quote to the trading desk with client parameters' },
  { label: 'Payoff Visualiser', detail: 'Show clients option payoffs and collar structures interactively' },
  { label: 'Deal Capture', detail: 'Book the agreed trade directly into the booking system' },
  { label: 'Comms & CRM Log', detail: 'Record client conversations, regulatory suitability sign-off' },
];

const TRADER_WIDGETS = [
  { label: 'Live Market Data', detail: 'Real-time spot, forward points, full implied vol surface by tenor & delta' },
  { label: 'Position & Greeks Dashboard', detail: 'Net delta, gamma, vega, theta per currency pair; real-time P&L' },
  { label: 'Quote Engine', detail: 'Model price from GK, manually adjustable for skew, liquidity, and margin' },
  { label: 'Incoming RFQ Queue', detail: 'Streaming RFQs from Sales and e-trading platforms; SLA timers per request' },
  { label: 'Hedge Execution Screen', detail: 'Execute spot, forward, or options hedges in the interbank market' },
  { label: 'Risk Limit Monitor', detail: 'VaR usage, Greek limits, notional limits; alerts on breaches in real time' },
];

const REQUEST_FLOW = [
  { label: 'Client', sub: 'hedging need' },
  { label: 'Sales', sub: 'RFQ + margin' },
  { label: 'Trader', sub: 'price off book' },
  { label: 'Sales', sub: 'quote client' },
  { label: 'Deal Books', sub: 'risk updates' },
];

/* ─── Strategy selection data ────────────────────────────────────────────── */
const STRATEGIES = [
  {
    name: 'Vanilla Call',
    icon: '📈',
    when: 'Importer needs to buy foreign currency; bullish on base CCY',
    pairType: 'Deliverable or NDF (as NDO)',
    pairs: 'EUR/USD, USD/INR (NDO), USD/SGD',
    premium: 'Paid upfront',
    upside: 'Unlimited benefit if spot moves in your favour',
    downside: 'Full premium lost if OTM at expiry',
    realExample: 'Indian IT firm pays USD to AWS. Buys USD call (INR put) at strike 86. If USD/INR rises to 90, exercises and saves INR on the conversion.',
    color: 'var(--color-primary)',
  },
  {
    name: 'Vanilla Put',
    icon: '📉',
    when: 'Exporter selling foreign currency; bearish on base CCY',
    pairType: 'Deliverable or NDF (as NDO)',
    pairs: 'USD/INR, USD/KRW, AUD/USD',
    premium: 'Paid upfront',
    upside: 'Unlimited downside protection on the receivable',
    downside: 'Full premium lost if OTM at expiry',
    realExample: 'Korean electronics exporter with USD receivable. Buys USD put (KRW call) to floor the conversion rate.',
    color: 'var(--color-secondary)',
  },
  {
    name: 'Zero-Cost Collar',
    icon: '🔒',
    when: 'Zero premium budget; willing to cap upside',
    pairType: 'Deliverable or NDF',
    pairs: 'USD/INR, USD/BRL, EUR/USD',
    premium: 'Net zero (put premium = call premium)',
    upside: 'Protected floor on receivable / capped cost on payable',
    downside: 'Give up gains beyond the cap strike',
    realExample: 'Indian exporter: buy USD put at 85.50 (floor), sell USD call at 88.50 (cap). Pays no premium. Converts between 85.50–88.50 no matter where spot lands.',
    color: 'var(--color-success)',
  },
  {
    name: 'Risk Reversal',
    icon: '↔️',
    when: 'Directional vol view; hedge with skew play',
    pairType: 'Deliverable',
    pairs: 'EUR/USD, GBP/USD, USD/JPY',
    premium: 'Small net (25Δ RR = buy OTM call, sell OTM put or vice versa)',
    upside: 'Low-cost hedge with asymmetric payoff',
    downside: 'Loses if market goes wrong direction AND vol drops',
    realExample: 'FX desk expects EUR/USD to rally on ECB pivot. Buys 25Δ EUR call, sells 25Δ EUR put. Net cost ≈ 0.2% of notional vs full ATM option.',
    color: 'var(--color-warning)',
  },
  {
    name: 'Straddle / Strangle',
    icon: '🤸',
    when: 'High-vol event expected (central bank, election) — direction unknown',
    pairType: 'Deliverable',
    pairs: 'USD/JPY, EUR/USD, GBP/USD',
    premium: 'Double premium (both call + put)',
    upside: 'Profits from any large move; loss bounded by combined premium',
    downside: 'Loses if spot stays flat through the event',
    realExample: 'Before Bank of Japan meeting. Buy USD/JPY ATM straddle. If BoJ surprises with rate hike OR hold, spot moves sharply → profit. If nothing happens → premium lost.',
    color: '#e879f9',
  },
  {
    name: 'Knock-Out (Barrier) Option',
    icon: '🚧',
    when: 'Cheaper hedge; client accepts barrier risk',
    pairType: 'Deliverable',
    pairs: 'EUR/USD, USD/SGD, USD/MYR',
    premium: '30–50% cheaper than vanilla equivalent',
    upside: 'Same payoff as vanilla if barrier never touched',
    downside: 'Option disappears instantly if spot hits the barrier',
    realExample: 'Importer buys USD call K=86.50 with KO barrier at 84.00. Pays 0.4% vs 0.8% vanilla. If USD/INR never drops to 84, full protection intact.',
    color: '#fb923c',
  },
  {
    name: 'NDF Option (NDO)',
    icon: '🌏',
    when: 'Restricted currency; physical delivery not possible',
    pairType: 'Non-Deliverable (cash settled)',
    pairs: 'USD/INR, USD/IDR, USD/KRW, USD/BRL, USD/TWD, USD/CNY (offshore)',
    premium: 'Comparable to deliverable; settled in USD',
    upside: 'Full option economics without requiring INR/KRW/etc nostro',
    downside: 'Fixing risk (payoff depends on official fixing rate, not tradeable spot)',
    realExample: 'Singapore-based fund hedges USD/INR exposure. Buys NDO put. On expiry, RBI fixing is ₹84. Fund receives (85.50 – 84.00) × notional in USD. No INR ever moves.',
    color: 'var(--color-error)',
  },
];

/* ─── Currency pair types data ───────────────────────────────────────────── */
const PAIR_TYPES = [
  {
    type: 'G10 Deliverable',
    color: 'var(--color-primary)',
    badge: 'Fully Deliverable',
    pairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CHF', 'USD/CAD', 'NZD/USD'],
    settlement: 'Physical — actual currency exchanged via CLS',
    options: 'Full vanilla + exotic options. Liquid vol surface.',
    systems: 'CLS Bank, SWIFT MT202, Nostro accounts',
  },
  {
    type: 'EM Deliverable',
    color: 'var(--color-success)',
    badge: 'Deliverable (Onshore)',
    pairs: ['USD/SGD', 'USD/HKD', 'USD/THB (onshore)', 'USD/MYR (onshore)', 'USD/ZAR'],
    settlement: 'Physical — local currency account required at onshore bank',
    options: 'Vanilla options available. Less liquid vol surface than G10.',
    systems: 'MAS (SGD), HKMA (HKD), local RTGS, SWIFT',
  },
  {
    type: 'NDF Currencies',
    color: 'var(--color-warning)',
    badge: 'Non-Deliverable',
    pairs: ['USD/INR', 'USD/KRW', 'USD/TWD', 'USD/IDR', 'USD/PHP', 'USD/BRL', 'USD/CLP', 'USD/CNY (offshore CNH)'],
    settlement: 'Cash-settled in USD vs official fixing (RBI, KFTC, etc.)',
    options: 'NDO (Non-Deliverable Option) — same economics, USD cash settlement',
    systems: 'No local currency movement. USD nostro only. Fixing feeds critical.',
  },
];

export default function FxOptionsPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeExample, setActiveExample] = useState(0);
  const step = LIFECYCLE_STEPS[activeStep];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const EXAMPLES = [
    {
      id: 'collar',
      label: 'Zero-Cost Collar',
      icon: '🏭',
      title: 'Zero-Cost Collar — Indian Apparel Exporter',
      subtitle: 'USD/INR · Deliverable · Exporter · Zero premium',
    },
    {
      id: 'ndf',
      label: 'NDF Option',
      icon: '🌏',
      title: 'NDF Put — Korean Electronics Exporter',
      subtitle: 'USD/KRW · Non-Deliverable Option · Exporter · Premium paid',
    },
    {
      id: 'call',
      label: 'Vanilla Call',
      icon: '💻',
      title: 'Vanilla Call — Indian Tech Company (Importer)',
      subtitle: 'USD/INR · NDF Option (NDO) · Importer · Premium paid',
    },
    {
      id: 'knockout',
      label: 'Knock-Out Barrier',
      icon: '🚧',
      title: 'Knock-Out Put — Singapore Exporter (EUR/USD)',
      subtitle: 'EUR/USD · Deliverable · Exotic · Cheaper premium',
    },
  ];

  return (
    <div className="fxo-page">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="fxo-hero">
        <div className="fxo-hero__badge">⬡ SCB · Global Banking &amp; Markets</div>
        <h1 className="fxo-hero__title">
          Foreign Exchange &amp; Options
          <br />
          <span className="fxo-hero__title-accent">Deep Learning</span>
        </h1>
        <p className="fxo-hero__subtitle">
          A structured technical reference for principal engineers supporting SCB's FX and
          Options business. Covers the full trade lifecycle, all four Greeks with interactive
          charts, option payoff profiles, a strategy selection guide, currency pair types
          (deliverable vs NDF), and four real-world worked examples.
        </p>
        <nav className="fxo-hero__nav" aria-label="Page sections">
          {[
            ['lifecycle', 'Trade Lifecycle'],
            ['greeks', 'The Greeks'],
            ['payoffs', 'Payoff Profiles'],
            ['terms', 'Key Terms'],
            ['systems', 'Systems'],
            ['roles', 'Sales vs Trader'],
            ['strategies', 'Strategy Guide'],
            ['pairs', 'Deliverable vs NDF'],
            ['examples', 'Worked Examples'],
          ].map(([id, label]) => (
            <button
              key={id}
              className="fxo-hero__nav-link"
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </section>

      {/* ── Trade Lifecycle ──────────────────────────────────────────────── */}
      <section id="lifecycle" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">01 · Foundation</span>
          <h2 className="fxo-section__title">The Trade Lifecycle</h2>
          <p className="fxo-section__lead">
            Every FX and Options system maps to one of five stages. The critical insight for
            system design: a forward is a <em>linear</em> path — book it, wait, settle it.
            An option is a <em>branching</em> path requiring continuous revaluation, barrier
            monitoring, and conditional settlement. Click each stage to explore.
          </p>
        </div>

        <div className="fxo-lifecycle">
          <div className="fxo-lifecycle__flow" role="tablist">
            {LIFECYCLE_STEPS.map((s, i) => (
              <>
                {i > 0 && <div key={`arrow-${i}`} className="fxo-lifecycle__arrow">→</div>}
                <div
                  key={s.num}
                  role="tab"
                  aria-selected={activeStep === i}
                  className={`fxo-lifecycle__step${activeStep === i ? ' fxo-lifecycle__step--active' : ''}`}
                  onClick={() => setActiveStep(i)}
                >
                  <div className="fxo-lifecycle__step-bubble">
                    <div className="fxo-lifecycle__step-num">{s.num}</div>
                    <div className="fxo-lifecycle__step-icon">{s.icon}</div>
                    <div className="fxo-lifecycle__step-label">{s.label}</div>
                  </div>
                </div>
              </>
            ))}
          </div>

          <div className="fxo-lifecycle__detail" role="tabpanel">
            <div className="fxo-lifecycle__detail-title">
              {step.title}
              <span className="fxo-lifecycle__detail-badge">{step.badge}</span>
            </div>
            <p className="fxo-lifecycle__detail-body">{step.body}</p>
            <div className="fxo-lifecycle__detail-systems">
              {step.systems.map(s => (
                <span key={s} className="fxo-lifecycle__detail-tag">{s}</span>
              ))}
            </div>

            {activeStep === 3 && (
              <div className="fxo-lifecycle__forward-vs-option">
                <div className="fxo-path-card fxo-path-card--forward">
                  <div className="fxo-path-card__title">Forward: Linear Path</div>
                  <div className="fxo-path-card__steps">
                    {['Book at agreed forward rate', 'Sit quietly until maturity', 'Settle: both legs exchange'].map(s => (
                      <div key={s} className="fxo-path-card__step">{s}</div>
                    ))}
                  </div>
                </div>
                <div className="fxo-path-card fxo-path-card--option">
                  <div className="fxo-path-card__title">Option: Branching Path</div>
                  <div className="fxo-path-card__steps">
                    {[
                      'Book + collect premium (T+2)',
                      'Continuously revalue vs live spot/vol',
                      'Monitor barriers (if exotic)',
                      'Exercise or lapse decision at expiry',
                      'Conditional settlement only if exercised',
                    ].map(s => (
                      <div key={s} className="fxo-path-card__step">{s}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── The Greeks ───────────────────────────────────────────────────── */}
      <section id="greeks" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">02 · Risk Sensitivities</span>
          <h2 className="fxo-section__title">The Greeks</h2>
          <p className="fxo-section__lead">
            Options traders manage risk through Greek sensitivities — partial derivatives of
            option value with respect to market inputs. Each Greek requires a different hedging
            action. Hover the charts for contextual interpretation at each point. Understanding
            them is the foundation of options risk management at SCB.
          </p>
        </div>

        <div className="fxo-greeks">
          {GREEKS.map(g => (
            <div key={g.name} className="fxo-greek-card">
              <div className="fxo-greek-card__header">
                <div className="fxo-greek-card__symbol">{g.symbol}</div>
                <div>
                  <div className="fxo-greek-card__name">{g.name}</div>
                  <div className="fxo-greek-card__plain">{g.plain}</div>
                </div>
              </div>
              <div className="fxo-greek-card__body">
                <p className="fxo-greek-card__description">{g.description}</p>
                <FormulaBlock formula={g.formula} label={g.formulaLabel} />
                <div className="fxo-greek-card__insight">{g.insight}</div>
                <div className="fxo-greek-card__chart">{g.renderChart()}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Option Payoff Profiles ────────────────────────────────────────── */}
      <section id="payoffs" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">03 · Payoff Profiles</span>
          <h2 className="fxo-section__title">Option Payoff Profiles</h2>
          <p className="fxo-section__lead">
            The "hockey stick" diagrams show your P&amp;L at expiry for each option type.
            <strong> Gross payoff</strong> (dashed) shows value if you ignore the premium paid.
            <strong> Net payoff</strong> (solid) is your actual P&amp;L after premium. The break-even
            point is where the net line crosses zero — the spot must move beyond this to make money.
            Strike = 86.00 in both charts.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
          {/* Call payoff */}
          <div className="fxo-greek-card">
            <div className="fxo-greek-card__header">
              <div className="fxo-greek-card__symbol" style={{ fontSize: '1.4rem' }}>📈</div>
              <div>
                <div className="fxo-greek-card__name">Call Option Payoff</div>
                <div className="fxo-greek-card__plain">Right to buy base CCY at strike — used by importers</div>
              </div>
            </div>
            <div className="fxo-greek-card__body">
              <p className="fxo-greek-card__description">
                Buyer pays premium (here 0.80) for the right to buy USD at 86.00. If spot rises above 86.00, the option
                is exercised — each point above strike is pure profit. Break-even = 86.80. Loss is capped at the premium
                paid; gain is theoretically unlimited. Seller (bank) has the mirror P&amp;L.
              </p>
              <div className="fxo-greek-card__chart">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={CALL_DATA} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
                    <ReferenceArea x1={82} x2={86} fill="#f87171" fillOpacity={0.08} />
                    <ReferenceArea x1={86} x2={86.8} fill="#fbbf24" fillOpacity={0.08} />
                    <ReferenceArea x1={86.8} x2={92} fill="#34d399" fillOpacity={0.08} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="spot" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" label={{ value: 'Spot at Expiry', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }} />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" label={{ value: 'P&L', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-muted)' }} />
                    <Tooltip content={<PayoffTooltip />} />
                    <ReferenceLine y={0} stroke="var(--color-text-dim)" strokeDasharray="3 2" />
                    <ReferenceLine x={86} stroke="var(--color-warning)" strokeDasharray="3 2" label={{ value: 'Strike 86', fill: 'var(--color-warning)', fontSize: 10 }} />
                    <ReferenceLine x={86.8} stroke="var(--color-success)" strokeDasharray="2 3" label={{ value: 'B/E 86.80', fill: 'var(--color-success)', fontSize: 9 }} />
                    <Line type="monotone" dataKey="gross" stroke="var(--color-text-muted)" dot={false} strokeWidth={1.5} strokeDasharray="5 3" name="Gross payoff" />
                    <Line type="monotone" dataKey="net" stroke="var(--color-primary)" dot={false} strokeWidth={2.5} name="Net P&L" />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: '0.78rem' }}>
                  <span style={{ background: '#f8717120', color: '#f87171', borderRadius: 4, padding: '2px 8px' }}>OTM — Premium lost</span>
                  <span style={{ background: '#fbbf2420', color: '#ca8a04', borderRadius: 4, padding: '2px 8px' }}>Break-even zone</span>
                  <span style={{ background: '#34d39920', color: '#059669', borderRadius: 4, padding: '2px 8px' }}>ITM — Profitable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Put payoff */}
          <div className="fxo-greek-card">
            <div className="fxo-greek-card__header">
              <div className="fxo-greek-card__symbol" style={{ fontSize: '1.4rem' }}>📉</div>
              <div>
                <div className="fxo-greek-card__name">Put Option Payoff</div>
                <div className="fxo-greek-card__plain">Right to sell base CCY at strike — used by exporters</div>
              </div>
            </div>
            <div className="fxo-greek-card__body">
              <p className="fxo-greek-card__description">
                Buyer pays premium (here 0.75) for the right to sell USD at 86.00. If spot falls below 86.00, the option
                is exercised — each point below strike is pure profit. Break-even = 85.25. Loss is capped at the premium
                paid; maximum gain is the full strike (spot → 0, theoretical). Typical use: exporter flooring a receivable.
              </p>
              <div className="fxo-greek-card__chart">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={PUT_DATA} margin={{ top: 8, right: 16, bottom: 16, left: 0 }}>
                    <ReferenceArea x1={82} x2={85.25} fill="#34d399" fillOpacity={0.08} />
                    <ReferenceArea x1={85.25} x2={86} fill="#fbbf24" fillOpacity={0.08} />
                    <ReferenceArea x1={86} x2={92} fill="#f87171" fillOpacity={0.08} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="spot" tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" label={{ value: 'Spot at Expiry', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }} />
                    <YAxis tick={{ fontSize: 10 }} stroke="var(--color-text-muted)" label={{ value: 'P&L', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'var(--color-text-muted)' }} />
                    <Tooltip content={<PayoffTooltip />} />
                    <ReferenceLine y={0} stroke="var(--color-text-dim)" strokeDasharray="3 2" />
                    <ReferenceLine x={86} stroke="var(--color-warning)" strokeDasharray="3 2" label={{ value: 'Strike 86', fill: 'var(--color-warning)', fontSize: 10 }} />
                    <ReferenceLine x={85.25} stroke="var(--color-success)" strokeDasharray="2 3" label={{ value: 'B/E 85.25', fill: 'var(--color-success)', fontSize: 9 }} />
                    <Line type="monotone" dataKey="gross" stroke="var(--color-text-muted)" dot={false} strokeWidth={1.5} strokeDasharray="5 3" name="Gross payoff" />
                    <Line type="monotone" dataKey="net" stroke="var(--color-secondary)" dot={false} strokeWidth={2.5} name="Net P&L" />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: '0.78rem' }}>
                  <span style={{ background: '#34d39920', color: '#059669', borderRadius: 4, padding: '2px 8px' }}>ITM — Profitable</span>
                  <span style={{ background: '#fbbf2420', color: '#ca8a04', borderRadius: 4, padding: '2px 8px' }}>Break-even zone</span>
                  <span style={{ background: '#f8717120', color: '#f87171', borderRadius: 4, padding: '2px 8px' }}>OTM — Premium lost</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Terms ────────────────────────────────────────────────────── */}
      <section id="terms" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">04 · Vocabulary</span>
          <h2 className="fxo-section__title">Key Terms Explained</h2>
          <p className="fxo-section__lead">
            Core FX and options terms with practical examples from the SCB context. These
            show up in every deal ticket, confirmation message, and risk report.
          </p>
        </div>
        <div className="fxo-terms">
          {KEY_TERMS.map(t => (
            <div key={t.name} className="fxo-term">
              <div className="fxo-term__header">
                <div className="fxo-term__icon">{t.icon}</div>
                <div>
                  <div className="fxo-term__name">{t.name}</div>
                  <div className="fxo-term__abbr">{t.abbr}</div>
                </div>
              </div>
              <p className="fxo-term__definition">{t.definition}</p>
              <div className="fxo-term__example">{t.example}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Systems Landscape ────────────────────────────────────────────── */}
      <section id="systems" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">05 · Technology</span>
          <h2 className="fxo-section__title">Systems Landscape</h2>
          <p className="fxo-section__lead">
            Every FX and options trade touches multiple systems across the lifecycle. As a
            principal engineer, understanding which system owns which responsibility — and
            where the integration seams are — is essential for architecture decisions.
          </p>
        </div>
        <div className="fxo-systems">
          {SYSTEMS.map(s => (
            <div key={s.name} className="fxo-system-card">
              <span className="fxo-system-card__icon">{s.icon}</span>
              <div className="fxo-system-card__name">{s.name}</div>
              <p className="fxo-system-card__desc">{s.desc}</p>
              <div className="fxo-system-card__tools">
                {s.tools.map(t => (
                  <span key={t} className="fxo-system-card__tool">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sales vs Trader ──────────────────────────────────────────────── */}
      <section id="roles" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">06 · Business Roles</span>
          <h2 className="fxo-section__title">Sales vs Trader</h2>
          <p className="fxo-section__lead">
            Two distinct roles with very different system needs. Sales owns the client
            relationship and translates business needs into trade requests. The Trader owns
            the risk book and prices off live market conditions.
          </p>
        </div>

        <div className="fxo-roles">
          <div className="fxo-role-card fxo-role-card--sales">
            <div className="fxo-role-card__header">
              <span className="fxo-role-card__icon">🤝</span>
              <div>
                <div className="fxo-role-card__title">Sales</div>
                <div className="fxo-role-card__subtitle">Client Relationship Owner</div>
              </div>
            </div>
            <div className="fxo-role-card__body">
              <p className="fxo-role-card__mission">
                Translates client hedging needs into tradeable requests. Checks suitability and
                credit limits. Adds margin on top of the wholesale price. Manages the post-trade
                relationship — queries, resets, rollovers, maturities. Sees only their own
                clients; does not see the full risk book.
              </p>
              <div>
                <div className="fxo-role-card__ws-label">Workspace Widgets</div>
                <div className="fxo-role-card__widgets">
                  {SALES_WIDGETS.map(w => (
                    <div key={w.label} className="fxo-role-card__widget">
                      <span className="fxo-role-card__widget-dot" />
                      <span><strong>{w.label}</strong> — {w.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="fxo-role-card fxo-role-card--trader">
            <div className="fxo-role-card__header">
              <span className="fxo-role-card__icon">📈</span>
              <div>
                <div className="fxo-role-card__title">Trader</div>
                <div className="fxo-role-card__subtitle">Risk Book Owner</div>
              </div>
            </div>
            <div className="fxo-role-card__body">
              <p className="fxo-role-card__mission">
                Owns the bank's aggregate risk position. Prices off the live book — not just the
                theoretical formula — accounting for existing position skew, liquidity, and
                hedging cost. Manages net Greek exposures per currency pair. Hedges residual risk
                in the interbank market. Operates within hard VaR and Greek risk limits.
              </p>
              <div>
                <div className="fxo-role-card__ws-label">Workspace Widgets</div>
                <div className="fxo-role-card__widgets">
                  {TRADER_WIDGETS.map(w => (
                    <div key={w.label} className="fxo-role-card__widget">
                      <span className="fxo-role-card__widget-dot" />
                      <span><strong>{w.label}</strong> — {w.detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="fxo-flow">
          <div className="fxo-flow__title">Request Flow — Client to Risk Book</div>
          <div className="fxo-flow__steps">
            {REQUEST_FLOW.map((s, i) => (
              <>
                {i > 0 && <div key={`a-${i}`} className="fxo-flow__arrow">→</div>}
                <div key={s.label + i} className="fxo-flow__step">
                  <div className="fxo-flow__step-bubble">{s.label}</div>
                  <div className="fxo-flow__step-label">{s.sub}</div>
                </div>
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── Strategy Selection Guide ─────────────────────────────────────── */}
      <section id="strategies" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">07 · Strategy Selection</span>
          <h2 className="fxo-section__title">When to Use Which Strategy</h2>
          <p className="fxo-section__lead">
            Real-world FX options strategy selection depends on the client's role (importer vs
            exporter), premium budget, risk tolerance, and currency pair type. This guide maps
            common business scenarios to the right strategy and shows which pairs are applicable.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {STRATEGIES.map(s => (
            <div key={s.name} className="fxo-greek-card" style={{ borderLeft: `4px solid ${s.color}` }}>
              <div className="fxo-greek-card__header">
                <div className="fxo-greek-card__symbol" style={{ fontSize: '1.6rem', width: 48, minWidth: 48 }}>{s.icon}</div>
                <div style={{ flex: 1 }}>
                  <div className="fxo-greek-card__name" style={{ color: s.color }}>{s.name}</div>
                  <div className="fxo-greek-card__plain">{s.when}</div>
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: s.pairType.includes('Non-') ? '#fbbf2420' : '#34d39920',
                  color: s.pairType.includes('Non-') ? '#ca8a04' : '#059669',
                  whiteSpace: 'nowrap',
                  alignSelf: 'flex-start',
                }}>
                  {s.pairType}
                </div>
              </div>
              <div className="fxo-greek-card__body" style={{ paddingTop: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Common Pairs</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{s.pairs}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Premium</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{s.premium}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Upside</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{s.upside}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Risk</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text)' }}>{s.downside}</div>
                  </div>
                </div>
                <div style={{ background: 'var(--color-surface)', borderRadius: 8, padding: '10px 14px', fontSize: '0.83rem', color: 'var(--color-text-muted)', borderLeft: `3px solid ${s.color}` }}>
                  <strong style={{ color: 'var(--color-text)' }}>Real example: </strong>{s.realExample}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Deliverable vs NDF ───────────────────────────────────────────── */}
      <section id="pairs" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">08 · Currency Pair Types</span>
          <h2 className="fxo-section__title">Deliverable vs Non-Deliverable Options</h2>
          <p className="fxo-section__lead">
            Whether a currency is "deliverable" determines the entire settlement mechanism and
            which systems are involved. NDF markets exist for restricted currencies where
            physical delivery is prohibited by the local regulator. The option economics are
            identical — only the settlement leg differs.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
          {PAIR_TYPES.map(pt => (
            <div key={pt.type} className="fxo-system-card" style={{ borderTop: `3px solid ${pt.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="fxo-system-card__name" style={{ margin: 0 }}>{pt.type}</div>
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: `${pt.color}20`, color: pt.color }}>{pt.badge}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {pt.pairs.map(p => (
                  <span key={p} className="fxo-system-card__tool">{p}</span>
                ))}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                <strong style={{ color: 'var(--color-text)' }}>Settlement: </strong>{pt.settlement}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                <strong style={{ color: 'var(--color-text)' }}>Options: </strong>{pt.options}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                <strong style={{ color: 'var(--color-text)' }}>Systems: </strong>{pt.systems}
              </div>
            </div>
          ))}
        </div>

        <div className="fxo-example__takeaway">
          <span className="fxo-example__takeaway-icon">💡</span>
          <p className="fxo-example__takeaway-body">
            <strong>System design implication:</strong> For deliverable options, the booking
            system must generate two settlement instructions (premium leg T+2, and the
            exercise delivery at expiry), interface with CLS, and reconcile nostro accounts.
            For NDOs, settlement is always a single USD cash flow against an official fixing
            rate — no local currency nostro required, but a reliable fixing feed (e.g.
            RBI reference rate for INR, KFTC for KRW) is a critical external dependency
            that must be monitored and have a fallback process for holidays or delayed publications.
          </p>
        </div>
      </section>

      {/* ── Worked Examples ──────────────────────────────────────────────── */}
      <section id="examples" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">09 · Applied</span>
          <h2 className="fxo-section__title">Worked Examples</h2>
          <p className="fxo-section__lead">
            Four real-world FX options scenarios covering the most common strategies, currency
            types, and client archetypes. Each example shows the client profile, instrument
            chosen, why that specific strategy, and the outcome scenarios.
          </p>
        </div>

        {/* Tab strip */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
          {EXAMPLES.map((ex, i) => (
            <button
              key={ex.id}
              className="fxo-hero__nav-link"
              onClick={() => setActiveExample(i)}
              style={activeExample === i ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'var(--color-primary-dim)' } : {}}
            >
              {ex.icon} {ex.label}
            </button>
          ))}
        </div>

        {/* ── Example 0: Zero-Cost Collar ─────────────────────────────── */}
        {activeExample === 0 && (
          <div className="fxo-example">
            <div className="fxo-example__scenario">
              <div className="fxo-example__scenario-header">
                <span className="fxo-example__scenario-icon">🏭</span>
                <div>
                  <div className="fxo-example__scenario-title">Meridian Apparel Exports, Tirupur</div>
                  <div className="fxo-example__scenario-sub">USD/INR · Deliverable · Exporter · Zero premium</div>
                </div>
              </div>
              <div className="fxo-example__scenario-body">
                {[
                  { label: 'Receivable', value: 'USD 2,000,000', note: 'Export proceeds' },
                  { label: 'Horizon', value: '90 days', note: 'Invoice due date' },
                  { label: 'Spot Rate', value: '86.42', note: 'USD/INR at trade date' },
                  { label: 'Risk', value: 'USD/INR falls', note: 'INR strengthens → fewer rupees' },
                  { label: 'Objective', value: 'Zero premium', note: 'No upfront cash outflow' },
                  { label: 'Structure', value: 'Zero-Cost Collar', note: 'Buy put floor + sell call cap' },
                ].map(f => (
                  <div key={f.label} className="fxo-example__fact">
                    <div className="fxo-example__fact-label">{f.label}</div>
                    <div className="fxo-example__fact-value">{f.value}</div>
                    <div className="fxo-example__fact-note">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="fxo-example__structure">
              <div className="fxo-collar-leg fxo-collar-leg--buy">
                <div className="fxo-collar-leg__action">Buy (Client Owns)</div>
                <div className="fxo-collar-leg__type">USD Put / INR Call — Floor</div>
                <div className="fxo-collar-leg__detail">
                  Strike: <strong>USD/INR 85.50</strong><br />
                  Right to sell USD at 85.50 if spot falls below<br />
                  Premium: ~₹0.45 per USD
                </div>
                <div className="fxo-collar-leg__why">
                  Downside protection: if USD/INR collapses, client converts at 85.50. Costs premium.
                </div>
              </div>
              <div className="fxo-collar-leg fxo-collar-leg--sell">
                <div className="fxo-collar-leg__action">Sell (Client Grants)</div>
                <div className="fxo-collar-leg__type">USD Call / INR Put — Cap</div>
                <div className="fxo-collar-leg__detail">
                  Strike: <strong>USD/INR 88.50</strong><br />
                  Bank has right to buy USD at 88.50 if spot rises above<br />
                  Premium received: ~₹0.45 per USD
                </div>
                <div className="fxo-collar-leg__why">
                  Upside sold: client gives up gains above 88.50. Premium offsets the put cost → zero net premium.
                </div>
              </div>
            </div>

            <div className="fxo-example__chart">
              <div className="fxo-example__chart-title">Effective Conversion Rate at Maturity — Collar vs Unhedged</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={COLLAR_DATA} margin={{ top: 8, right: 16, bottom: 20, left: 8 }}>
                  <ReferenceArea x1={82} x2={85.5} fill="#34d399" fillOpacity={0.08} label={{ value: 'Floor active', fill: '#059669', fontSize: 9, position: 'insideTopLeft' }} />
                  <ReferenceArea x1={85.5} x2={88.5} fill="#60a5fa" fillOpacity={0.07} label={{ value: 'Free range', fill: '#3b82f6', fontSize: 9, position: 'insideTop' }} />
                  <ReferenceArea x1={88.5} x2={92} fill="#f87171" fillOpacity={0.08} label={{ value: 'Cap active', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }} />
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="spot"
                    stroke="var(--color-text-muted)"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Spot at Maturity (USD/INR)', position: 'insideBottomRight', offset: -8, fontSize: 11, fill: 'var(--color-text-muted)' }}
                  />
                  <YAxis
                    stroke="var(--color-text-muted)"
                    tick={{ fontSize: 11 }}
                    domain={[83, 91]}
                    label={{ value: 'Effective Rate', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'var(--color-text-muted)' }}
                  />
                  <Tooltip content={<CollarTooltip />} />
                  <ReferenceLine x={85.5} stroke="#059669" strokeDasharray="4 2" label={{ value: 'Floor 85.50', fill: '#059669', fontSize: 10 }} />
                  <ReferenceLine x={88.5} stroke="#ef4444" strokeDasharray="4 2" label={{ value: 'Cap 88.50', fill: '#ef4444', fontSize: 10 }} />
                  <Line type="monotone" dataKey="unhedged" stroke="var(--color-text-dim)" dot={false} strokeWidth={1.5} strokeDasharray="6 3" name="Unhedged" />
                  <Line type="monotone" dataKey="collar" stroke="var(--color-primary)" dot={false} strokeWidth={2.5} name="Zero-Cost Collar" />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="fxo-example__outcomes">
              <div className="fxo-outcome fxo-outcome--bad">
                <div className="fxo-outcome__spot">Spot = 84.00</div>
                <div className="fxo-outcome__action">Client exercises the Put</div>
                <p className="fxo-outcome__result">
                  Market collapsed below floor. Client exercises and converts at <strong>85.50</strong> — ₹3,000,000 better than market on full notional.
                </p>
                <div className="fxo-outcome__verdict">Floor protected ✓</div>
              </div>
              <div className="fxo-outcome fxo-outcome--neutral">
                <div className="fxo-outcome__spot">Spot = 87.00</div>
                <div className="fxo-outcome__action">Both options lapse</div>
                <p className="fxo-outcome__result">
                  Spot between floor and cap. Neither option exercised. Client converts at market rate of <strong>87.00</strong>.
                </p>
                <div className="fxo-outcome__verdict">Both lapse — market rate</div>
              </div>
              <div className="fxo-outcome fxo-outcome--cap">
                <div className="fxo-outcome__spot">Spot = 90.00</div>
                <div className="fxo-outcome__action">Bank exercises the Call</div>
                <p className="fxo-outcome__result">
                  USD surged. Bank exercises its call; client converts at <strong>88.50</strong> — misses ₹3,000,000 upside but still better than initial spot 86.42.
                </p>
                <div className="fxo-outcome__verdict">Upside capped at 88.50</div>
              </div>
            </div>

            <div className="fxo-example__takeaway">
              <span className="fxo-example__takeaway-icon">💡</span>
              <p className="fxo-example__takeaway-body">
                <strong>Why this strategy:</strong> Meridian has no premium budget. By selling the upside call (cap at 88.50),
                they fund the put floor (85.50) at zero net cost. Compare to a plain vanilla put: full upside kept but ~₹900,000
                premium paid upfront. Collar is the right product for cash-flow-conscious exporters. For systems: books as
                two legs — each requiring independent lifecycle management and settlement flows.
              </p>
            </div>
          </div>
        )}

        {/* ── Example 1: NDF Put ───────────────────────────────────────── */}
        {activeExample === 1 && (
          <div className="fxo-example">
            <div className="fxo-example__scenario">
              <div className="fxo-example__scenario-header">
                <span className="fxo-example__scenario-icon">🌏</span>
                <div>
                  <div className="fxo-example__scenario-title">Samsung SDI Parts Division, Seoul</div>
                  <div className="fxo-example__scenario-sub">USD/KRW · Non-Deliverable Option · Exporter · Premium paid upfront</div>
                </div>
              </div>
              <div className="fxo-example__scenario-body">
                {[
                  { label: 'Receivable', value: 'USD 5,000,000', note: 'Component export revenue' },
                  { label: 'Horizon', value: '6 months', note: 'Sales cycle quarter' },
                  { label: 'Spot Rate', value: 'USD/KRW 1,340', note: 'At trade date' },
                  { label: 'Risk', value: 'USD/KRW falls', note: 'KRW strengthens → fewer won' },
                  { label: 'Currency type', value: 'Restricted', note: 'KRW physical delivery limited offshore' },
                  { label: 'Structure', value: 'NDO Put (USD put / KRW call)', note: 'Cash settled in USD vs KFTC fixing' },
                ].map(f => (
                  <div key={f.label} className="fxo-example__fact">
                    <div className="fxo-example__fact-label">{f.label}</div>
                    <div className="fxo-example__fact-value">{f.value}</div>
                    <div className="fxo-example__fact-note">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--color-text)' }}>Why an NDO instead of a deliverable option?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Deliverable KRW Option — Not available offshore</div>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingLeft: 16, margin: 0 }}>
                    <li>KRW physical delivery restricted by Bank of Korea for offshore players</li>
                    <li>Would require an onshore KRW nostro account</li>
                    <li>Not practical for Singapore-booked trades</li>
                  </ul>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>NDO Put — How it works</div>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingLeft: 16, margin: 0 }}>
                    <li>Strike: USD/KRW 1,320 (protection floor)</li>
                    <li>Premium: ~0.6% of USD notional, paid in USD</li>
                    <li>At expiry: compare strike vs KFTC fixing rate</li>
                    <li>If fixing &lt; 1,320: SCB pays (1,320 − fixing) × notional ÷ fixing in USD</li>
                    <li>No KRW ever moves — all in USD</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="fxo-example__outcomes">
              <div className="fxo-outcome fxo-outcome--bad">
                <div className="fxo-outcome__spot">Fixing = 1,280</div>
                <div className="fxo-outcome__action">NDO exercised — SCB pays</div>
                <p className="fxo-outcome__result">
                  KRW strengthened. SCB pays (1,320 − 1,280) / 1,280 × USD 5m ≈ <strong>USD 156,250</strong> in cash. Effective rate equivalent to 1,320.
                </p>
                <div className="fxo-outcome__verdict">Floor at 1,320 protected ✓</div>
              </div>
              <div className="fxo-outcome fxo-outcome--neutral">
                <div className="fxo-outcome__spot">Fixing = 1,340</div>
                <div className="fxo-outcome__action">NDO lapses OTM</div>
                <p className="fxo-outcome__result">
                  KRW unchanged. Option expires worthless. Client converts at prevailing <strong>1,340</strong> market rate. Premium of ~USD 30,000 was the cost of the hedge.
                </p>
                <div className="fxo-outcome__verdict">Lapse — market rate applied</div>
              </div>
              <div className="fxo-outcome fxo-outcome--cap">
                <div className="fxo-outcome__spot">Fixing = 1,380</div>
                <div className="fxo-outcome__action">NDO lapses — client benefits</div>
                <p className="fxo-outcome__result">
                  USD strengthened (KRW weakened). Option lapses OTM. Client converts at <strong>1,380</strong> — full USD upside captured (minus the premium already paid).
                </p>
                <div className="fxo-outcome__verdict">Option lapses — upside kept ✓</div>
              </div>
            </div>

            <div className="fxo-example__takeaway">
              <span className="fxo-example__takeaway-icon">💡</span>
              <p className="fxo-example__takeaway-body">
                <strong>Key NDO system implication:</strong> The settlement amount is calculated against the official
                KFTC (Korea Financial Telecommunications &amp; Clearings Institute) fixing, published at 3:30pm KST.
                The booking system must subscribe to this fixing feed, apply it on exercise date, generate a
                single USD payment to the client, and manage the fixing holiday calendar (KRW fixes have Korean
                public holiday gaps). Fixing publication failures require a pre-defined fallback procedure — typically
                the previous business day's rate or a Reuters composite average.
              </p>
            </div>
          </div>
        )}

        {/* ── Example 2: Vanilla Call (Importer) ──────────────────────── */}
        {activeExample === 2 && (
          <div className="fxo-example">
            <div className="fxo-example__scenario">
              <div className="fxo-example__scenario-header">
                <span className="fxo-example__scenario-icon">💻</span>
                <div>
                  <div className="fxo-example__scenario-title">Infosys BPM, Bangalore — AWS Cloud Spend</div>
                  <div className="fxo-example__scenario-sub">USD/INR · Non-Deliverable Option · Importer · Premium paid in INR equivalent</div>
                </div>
              </div>
              <div className="fxo-example__scenario-body">
                {[
                  { label: 'Payable', value: 'USD 3,000,000', note: 'Annual AWS cloud invoice' },
                  { label: 'Horizon', value: '3 months', note: 'Payment due date' },
                  { label: 'Spot Rate', value: '86.42', note: 'USD/INR today' },
                  { label: 'Risk', value: 'USD/INR rises', note: 'INR weakens → more rupees per dollar' },
                  { label: 'Objective', value: 'Cap USD cost', note: 'Willing to pay premium for certainty' },
                  { label: 'Structure', value: 'USD Call / INR Put (NDO)', note: 'Right to buy USD at strike' },
                ].map(f => (
                  <div key={f.label} className="fxo-example__fact">
                    <div className="fxo-example__fact-label">{f.label}</div>
                    <div className="fxo-example__fact-value">{f.value}</div>
                    <div className="fxo-example__fact-note">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--color-text)' }}>Trade Structure: USD Call NDO</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Strike</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>USD/INR 87.00</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Slightly OTM from current 86.42</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Premium</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-warning)' }}>~₹0.70 / USD</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>= ₹21,00,000 total upfront</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Break-even</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-success)' }}>87.70</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Strike + premium = when option starts saving money</div>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>Settlement</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-text)' }}>USD cash</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>vs RBI reference rate (FBIL) on expiry date</div>
                </div>
              </div>
            </div>

            <div className="fxo-example__outcomes">
              <div className="fxo-outcome fxo-outcome--bad">
                <div className="fxo-outcome__spot">Fixing = 86.20</div>
                <div className="fxo-outcome__action">NDO Call lapses OTM</div>
                <p className="fxo-outcome__result">
                  INR strengthened — spot below strike. Option lapses. Infosys buys USD at market <strong>86.20</strong>. Premium of ₹21L was the insurance cost.
                </p>
                <div className="fxo-outcome__verdict">Lapse — cheaper at market</div>
              </div>
              <div className="fxo-outcome fxo-outcome--neutral">
                <div className="fxo-outcome__spot">Fixing = 87.50</div>
                <div className="fxo-outcome__action">NDO Call exercised</div>
                <p className="fxo-outcome__result">
                  USD rose above strike. SCB pays (87.50 − 87.00) / 87.50 × USD 3m ≈ <strong>USD 17,143</strong>. Effective rate = 87.00. Saves ₹15L vs open market.
                </p>
                <div className="fxo-outcome__verdict">Exercised — cap at 87.00 ✓</div>
              </div>
              <div className="fxo-outcome fxo-outcome--cap">
                <div className="fxo-outcome__spot">Fixing = 90.00</div>
                <div className="fxo-outcome__action">NDO Call deeply exercised</div>
                <p className="fxo-outcome__result">
                  Severe INR depreciation. Option pays (90.00 − 87.00) / 90.00 × USD 3m ≈ <strong>USD 100,000</strong>. Effective cost stays at <strong>87.00</strong>. Saves ₹1.08Cr vs unhedged.
                </p>
                <div className="fxo-outcome__verdict">Deep ITM — maximum protection ✓</div>
              </div>
            </div>

            <div className="fxo-example__takeaway">
              <span className="fxo-example__takeaway-icon">💡</span>
              <p className="fxo-example__takeaway-body">
                <strong>Importer vs exporter asymmetry:</strong> Importers buy calls (fear USD rising); exporters buy puts (fear
                USD falling). The same USD/INR pair is used for both — direction of hedge flips. Infosys chose a vanilla
                call (not a collar) because they want unlimited benefit if INR strengthens, accepting the ₹21L premium as
                a budgeted hedging cost. If they were more premium-sensitive, they could sell an OTM USD put to offset —
                creating a risk reversal structure.
              </p>
            </div>
          </div>
        )}

        {/* ── Example 3: Knock-Out Barrier Put ────────────────────────── */}
        {activeExample === 3 && (
          <div className="fxo-example">
            <div className="fxo-example__scenario">
              <div className="fxo-example__scenario-header">
                <span className="fxo-example__scenario-icon">🚧</span>
                <div>
                  <div className="fxo-example__scenario-title">Olam International, Singapore — EUR Receivable</div>
                  <div className="fxo-example__scenario-sub">EUR/USD · Deliverable · Exporter · Knock-Out Barrier Put · Cheaper premium</div>
                </div>
              </div>
              <div className="fxo-example__scenario-body">
                {[
                  { label: 'Receivable', value: 'EUR 4,000,000', note: 'Commodity export proceeds' },
                  { label: 'Horizon', value: '3 months', note: '90-day horizon' },
                  { label: 'Spot Rate', value: '1.0850', note: 'EUR/USD at trade date' },
                  { label: 'Risk', value: 'EUR/USD falls', note: 'EUR weakens → fewer USD received' },
                  { label: 'Premium budget', value: 'Tight', note: 'Willing to accept barrier risk' },
                  { label: 'Structure', value: 'EUR Put KO — strike 1.0700, KO barrier 1.1200', note: 'Knock-out if EUR rallies to 1.1200' },
                ].map(f => (
                  <div key={f.label} className="fxo-example__fact">
                    <div className="fxo-example__fact-label">{f.label}</div>
                    <div className="fxo-example__fact-value">{f.value}</div>
                    <div className="fxo-example__fact-note">{f.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--color-surface)', borderRadius: 12, padding: 20, marginBottom: 20, border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--color-text)' }}>Vanilla Put vs Knock-Out Put — Premium Comparison</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--color-surface-elevated)', borderRadius: 8, padding: 16 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Vanilla EUR Put (K=1.0700)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>0.85% of notional</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>~USD 34,000 upfront</div>
                  <div style={{ marginTop: 8, fontSize: '0.82rem', color: '#34d399' }}>Full protection regardless of where EUR/USD goes</div>
                </div>
                <div style={{ background: 'var(--color-surface-elevated)', borderRadius: 8, padding: 16, border: '2px solid var(--color-primary)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8, textTransform: 'uppercase' }}>Knock-Out Put (K=1.0700, KO=1.1200)</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 4 }}>0.42% of notional</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>~USD 16,800 upfront — 51% cheaper!</div>
                  <div style={{ marginTop: 8, fontSize: '0.82rem', color: '#fbbf24' }}>Option disappears if EUR/USD ever touches 1.1200</div>
                </div>
              </div>
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#fbbf2415', borderRadius: 8, fontSize: '0.83rem', color: 'var(--color-text-muted)', borderLeft: '3px solid #fbbf24' }}>
                <strong style={{ color: 'var(--color-text)' }}>The knock-out logic:</strong> The option trades at a discount because it disappears
                the moment EUR/USD rises to 1.1200. The bank's risk vanishes at that point — savings passed to the client.
                Olam accepts this because a EUR rally to 1.1200 would mean their receivable is worth more in USD anyway,
                reducing the need for downside protection.
              </div>
            </div>

            <div className="fxo-example__outcomes">
              <div className="fxo-outcome fxo-outcome--bad">
                <div className="fxo-outcome__spot">EUR/USD → 1.0500</div>
                <div className="fxo-outcome__action">KO Put exercised (barrier never hit)</div>
                <p className="fxo-outcome__result">
                  EUR fell as feared. Barrier (1.1200) never touched. Put exercised at <strong>1.0700</strong>. Olam sells EUR at 1.0700 vs market 1.0500 — saves USD 80,000 on EUR 4m.
                </p>
                <div className="fxo-outcome__verdict">KO Put protected ✓ (barrier intact)</div>
              </div>
              <div className="fxo-outcome fxo-outcome--neutral">
                <div className="fxo-outcome__spot">EUR/USD → 1.1200 then 1.0400</div>
                <div className="fxo-outcome__action">Barrier hit — option extinguished</div>
                <p className="fxo-outcome__result">
                  EUR briefly rallied to 1.1200, knocking out the option. EUR then fell to 1.0400. Option is <strong>gone</strong> — Olam converts at 1.0400, unprotected.
                </p>
                <div className="fxo-outcome__verdict">Barrier hit — protection lost</div>
              </div>
              <div className="fxo-outcome fxo-outcome--cap">
                <div className="fxo-outcome__spot">EUR/USD → 1.1000</div>
                <div className="fxo-outcome__action">Put lapses OTM (barrier not hit)</div>
                <p className="fxo-outcome__result">
                  EUR rallied above strike but stayed below 1.1200. Put lapses OTM. Olam converts at <strong>1.1000</strong> — above strike, above hedge rate. Premium was the only cost.
                </p>
                <div className="fxo-outcome__verdict">Lapse — EUR stronger, upside kept</div>
              </div>
            </div>

            <div className="fxo-example__takeaway">
              <span className="fxo-example__takeaway-icon">💡</span>
              <p className="fxo-example__takeaway-body">
                <strong>Critical system requirement for barrier options:</strong> The booking system must monitor EUR/USD
                tick data continuously throughout the option's life — any tick at or above 1.1200 extinguishes the option
                instantly. This requires a real-time market data feed with sub-second latency, event-driven barrier
                monitoring, and an automated notification workflow to both the trading desk and the client. Barrier events
                must be timestamped and stored for dispute resolution. Late detection of a barrier hit is a significant
                operational risk — client gets protection that should not exist, creating a loss for the bank.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
