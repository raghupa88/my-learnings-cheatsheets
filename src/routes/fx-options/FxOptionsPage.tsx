import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import { FormulaBlock } from '../../components/FormulaBlock/FormulaBlock';
import './FxOptionsPage.css';

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

/* ─── Greek chart data generators ───────────────────────────────────────── */
function deltaData() {
  const d = [];
  for (let S = 60; S <= 140; S += 2) {
    // N(d1) approximated as sigmoid for illustration; call delta
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
  for (let T = 0.05; T <= 1; T += 0.02) {
    const theta = -5 / Math.sqrt(T * 2 * Math.PI) - 0.5;
    d.push({ T: parseFloat(T.toFixed(2)), theta: parseFloat(theta.toFixed(3)) });
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

const TOOLTIP_STYLE = {
  contentStyle: {
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: '6px',
    fontSize: '11px',
    color: 'var(--color-text)',
  },
};

const GREEKS = [
  {
    symbol: 'Δ',
    name: 'Delta',
    plain: 'Current exposure to spot',
    description:
      'Delta measures how much the option\'s value changes for a $1 move in the underlying spot rate. A call with Δ = 0.60 gains ~$0.60 in value if spot rises by $1. Delta is also the hedge ratio: to delta-hedge a long call, sell Δ units of the underlying.',
    insight:
      'SCB trading desks run books with net delta close to zero — any residual is either a deliberate position or must be hedged in the spot market. Delta changes as spot moves, so hedges must be rebalanced continuously (dynamic delta hedging).',
    formula: '\\Delta_{call} = N(d_1), \\quad \\Delta_{put} = N(d_1) - 1',
    formulaLabel: 'Delta (Garman-Kohlhagen)',
    renderChart: () => (
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={DELTA_DATA} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="S" stroke="var(--color-text-muted)" tick={{ fontSize: 10 }} label={{ value: 'Spot', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }} />
          <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 10 }} domain={[-1, 1]} />
          <Tooltip {...TOOLTIP_STYLE} />
          <ReferenceLine y={0} stroke="var(--color-text-dim)" strokeDasharray="3 2" />
          <ReferenceLine x={100} stroke="var(--color-warning)" strokeDasharray="3 2" label={{ value: 'ATM', fill: 'var(--color-warning)', fontSize: 10 }} />
          <Line type="monotone" dataKey="callDelta" stroke="var(--color-primary)" dot={false} strokeWidth={2} name="Call Δ" />
          <Line type="monotone" dataKey="putDelta" stroke="var(--color-secondary)" dot={false} strokeWidth={2} name="Put Δ" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </LineChart>
      </ResponsiveContainer>
    ),
  },
  {
    symbol: 'Γ',
    name: 'Gamma',
    plain: 'Exposure instability / speed of delta change',
    description:
      'Gamma is the second derivative of option value with respect to spot — the rate at which delta itself changes. High gamma means a small spot move causes a large delta shift, requiring frequent and costly hedge rebalancing. Gamma peaks for ATM options close to expiry.',
    insight:
      'Being "long gamma" (long options) profits from large spot moves regardless of direction — the position self-adjusts. Being "short gamma" (sold options) bleeds on vol as you must constantly re-hedge. This is the P&L driver in exotics trading at SCB.',
    formula: '\\Gamma = \\frac{N\'(d_1)}{S \\sigma \\sqrt{T}}',
    formulaLabel: 'Gamma',
    renderChart: () => (
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={GAMMA_DATA} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="S" stroke="var(--color-text-muted)" tick={{ fontSize: 10 }} label={{ value: 'Spot', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }} />
          <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 10 }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <ReferenceLine x={100} stroke="var(--color-warning)" strokeDasharray="3 2" label={{ value: 'ATM', fill: 'var(--color-warning)', fontSize: 10 }} />
          <Line type="monotone" dataKey="gamma" stroke="var(--color-success)" dot={false} strokeWidth={2} name="Gamma Γ" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </LineChart>
      </ResponsiveContainer>
    ),
  },
  {
    symbol: 'ν',
    name: 'Vega',
    plain: 'Fear sensitivity / implied vol exposure',
    description:
      'Vega measures option value change for a 1% move in implied volatility. It is the same for calls and puts with the same strike and maturity. Long options = long vega: rising market fear benefits option holders. Vega is highest for ATM options with longer maturities.',
    insight:
      'In FX options, the volatility surface is quoted by delta and tenor. SCB vol traders actively trade vega via risk reversals (skew) and butterflies (kurtosis/smile). A large vega position means the desk is significantly exposed to changes in market sentiment.',
    formula: '\\nu = S \\sqrt{T} \\cdot N\'(d_1)',
    formulaLabel: 'Vega',
    renderChart: () => (
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={VEGA_DATA} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="S" stroke="var(--color-text-muted)" tick={{ fontSize: 10 }} label={{ value: 'Spot', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }} />
          <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 10 }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <ReferenceLine x={100} stroke="var(--color-warning)" strokeDasharray="3 2" label={{ value: 'ATM', fill: 'var(--color-warning)', fontSize: 10 }} />
          <Line type="monotone" dataKey="vega" stroke="var(--color-warning)" dot={false} strokeWidth={2} name="Vega ν" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </LineChart>
      </ResponsiveContainer>
    ),
  },
  {
    symbol: 'Θ',
    name: 'Theta',
    plain: 'Daily cost of holding time value',
    description:
      'Theta is the daily erosion of an option\'s value purely from time passing, all else equal. It is negative for option buyers (you bleed theta every day you hold) and positive for option sellers (you collect it). Theta accelerates as expiry approaches for ATM options.',
    insight:
      'Theta vs Gamma trade-off is central to options P&L: long gamma earns money from spot moves but bleeds theta daily; short gamma collects theta but risks large losses on big moves. This is the fundamental tension a vol desk manages. Expressed as: Γ·σ²·S²/2 + Θ + r·S·Δ = r·V.',
    formula: '\\Theta = -\\frac{S\\sigma N\'(d_1)}{2\\sqrt{T}} - rKe^{-rT}N(d_2)',
    formulaLabel: 'Theta (call)',
    renderChart: () => (
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={THETA_DATA} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="T" stroke="var(--color-text-muted)" tick={{ fontSize: 10 }} label={{ value: 'Time to Expiry (T)', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: 'var(--color-text-muted)' }} />
          <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 10 }} />
          <Tooltip {...TOOLTIP_STYLE} />
          <ReferenceLine y={0} stroke="var(--color-text-dim)" strokeDasharray="3 2" />
          <Line type="monotone" dataKey="theta" stroke="var(--color-error)" dot={false} strokeWidth={2} name="Theta Θ" />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </LineChart>
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
    desc: 'Ensures trade-as-booked = trade-as-confirmed = trade-as-settled across systems that don\'t always agree. Breaks surface from timing differences, fee calculations, or system misalignments. Critical for regulatory reporting accuracy and audit trails.',
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

export default function FxOptionsPage() {
  const [activeStep, setActiveStep] = useState(0);
  const step = LIFECYCLE_STEPS[activeStep];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
          Options business. Covers the full trade lifecycle, forward vs option systems
          architecture, all four Greeks with interactive charts, the systems landscape, and
          a real-world zero-cost collar worked example.
        </p>
        <nav className="fxo-hero__nav" aria-label="Page sections">
          {[
            ['lifecycle', 'Trade Lifecycle'],
            ['greeks', 'The Greeks'],
            ['terms', 'Key Terms'],
            ['systems', 'Systems'],
            ['roles', 'Sales vs Trader'],
            ['example', 'Worked Example'],
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
            action. Understanding them is the foundation of options risk management at SCB.
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

      {/* ── Key Terms ────────────────────────────────────────────────────── */}
      <section id="terms" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">03 · Vocabulary</span>
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
          <span className="fxo-section__eyebrow">04 · Technology</span>
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
          <span className="fxo-section__eyebrow">05 · Business Roles</span>
          <h2 className="fxo-section__title">Sales vs Trader</h2>
          <p className="fxo-section__lead">
            Two distinct roles with very different system needs. Sales owns the client
            relationship and translates business needs into trade requests. The Trader owns
            the risk book and prices off live market conditions. Systems must serve both —
            but with very different data, permissions, and latency requirements.
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

      {/* ── Worked Example ───────────────────────────────────────────────── */}
      <section id="example" className="fxo-section">
        <div className="fxo-section__header">
          <span className="fxo-section__eyebrow">06 · Applied</span>
          <h2 className="fxo-section__title">Worked Example — Zero-Cost Collar</h2>
          <p className="fxo-section__lead">
            A real-world structuring scenario: an Indian apparel exporter with a USD receivable
            wants to protect against INR depreciation without paying an upfront premium.
            Solution: a zero-cost collar.
          </p>
        </div>

        <div className="fxo-example">
          {/* Scenario facts */}
          <div className="fxo-example__scenario">
            <div className="fxo-example__scenario-header">
              <span className="fxo-example__scenario-icon">🏭</span>
              <div>
                <div className="fxo-example__scenario-title">Meridian Apparel Exports, Tirupur</div>
                <div className="fxo-example__scenario-sub">Client type: Mid-cap export corporate · Currency pair: USD/INR</div>
              </div>
            </div>
            <div className="fxo-example__scenario-body">
              {[
                { label: 'Receivable', value: 'USD 2,000,000', note: 'Export proceeds' },
                { label: 'Horizon', value: '90 days', note: 'Invoice due date' },
                { label: 'Spot Rate', value: '86.42', note: 'USD/INR at trade date' },
                { label: 'Risk', value: 'USD/INR falls', note: 'INR strengthens → fewer rupees' },
                { label: 'Objective', value: 'Zero premium', note: 'No upfront cash outflow' },
                { label: 'Structure', value: 'Zero-Cost Collar', note: 'Floor + Cap' },
              ].map(f => (
                <div key={f.label} className="fxo-example__fact">
                  <div className="fxo-example__fact-label">{f.label}</div>
                  <div className="fxo-example__fact-value">{f.value}</div>
                  <div className="fxo-example__fact-note">{f.note}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Collar structure */}
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
                Downside protection: if USD/INR collapses, client converts at 85.50 not the lower market rate. Costs premium.
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
                Upside participation sold: client gives up gains above 88.50. Premium offsets the put cost → zero net premium.
              </div>
            </div>
          </div>

          {/* Payoff chart */}
          <div className="fxo-example__chart">
            <div className="fxo-example__chart-title">Effective Conversion Rate at Maturity — Collar vs Unhedged</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={COLLAR_DATA} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
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
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', color: 'var(--color-text)' }}
                  formatter={(v: number) => [v.toFixed(2), '']}
                  labelFormatter={(l: number) => `Spot: ${l}`}
                />
                <ReferenceLine x={85.5} stroke="var(--color-success)" strokeDasharray="4 2" label={{ value: 'Floor 85.50', fill: 'var(--color-success)', fontSize: 10 }} />
                <ReferenceLine x={88.5} stroke="var(--color-error)" strokeDasharray="4 2" label={{ value: 'Cap 88.50', fill: 'var(--color-error)', fontSize: 10 }} />
                <Line type="monotone" dataKey="unhedged" stroke="var(--color-text-dim)" dot={false} strokeWidth={1.5} strokeDasharray="6 3" name="Unhedged" />
                <Line type="monotone" dataKey="collar" stroke="var(--color-primary)" dot={false} strokeWidth={2.5} name="Zero-Cost Collar" />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Outcome scenarios */}
          <div className="fxo-example__outcomes">
            <div className="fxo-outcome fxo-outcome--bad">
              <div className="fxo-outcome__spot">Spot = 84.00</div>
              <div className="fxo-outcome__action">Client exercises the Put</div>
              <p className="fxo-outcome__result">
                Market rate collapsed below the floor. Client exercises their put option and converts at <strong>85.50</strong> — ₹3,000,000 better than the market rate on the full notional.
              </p>
              <div className="fxo-outcome__verdict">Floor protected ✓</div>
            </div>
            <div className="fxo-outcome fxo-outcome--neutral">
              <div className="fxo-outcome__spot">Spot = 87.00</div>
              <div className="fxo-outcome__action">Both options lapse</div>
              <p className="fxo-outcome__result">
                Spot settled between floor and cap. Neither option is exercised. Client converts at the prevailing market rate of <strong>87.00</strong>. Full upside within the collar range captured.
              </p>
              <div className="fxo-outcome__verdict">Both lapse — market rate</div>
            </div>
            <div className="fxo-outcome fxo-outcome--cap">
              <div className="fxo-outcome__spot">Spot = 90.00</div>
              <div className="fxo-outcome__action">Bank exercises the Call</div>
              <p className="fxo-outcome__result">
                USD strengthened sharply. The bank exercises its call; client converts at <strong>88.50</strong> cap — misses ₹3,000,000 of upside but still achieved a better rate than the initial spot of 86.42.
              </p>
              <div className="fxo-outcome__verdict">Upside capped at 88.50</div>
            </div>
          </div>

          {/* Key takeaway */}
          <div className="fxo-example__takeaway">
            <span className="fxo-example__takeaway-icon">💡</span>
            <p className="fxo-example__takeaway-body">
              <strong>The collar trade-off:</strong> By selling the upside call (cap at 88.50),
              Meridian funds the cost of buying downside protection (floor at 85.50), resulting in
              <strong> zero net premium</strong>. Compare this to a plain vanilla put: the client
              would keep full upside if USD surges past 88.50, but would pay ~₹0.45/USD (~₹900,000
              total) upfront. The collar is the right product for cash-flow-conscious exporters who
              can tolerate a capped upside in exchange for <strong>free downside protection</strong>.
              For systems: the collar books as two option legs — each leg requires independent
              lifecycle management, exercise monitoring, and potentially different settlement flows.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
