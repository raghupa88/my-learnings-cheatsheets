import { Concept } from '../types';

export const derivativesConcepts: Concept[] = [
  {
    id: 'forward-contract',
    title: 'Forward Contract',
    category: 'Forwards & Futures',
    description:
      'An OTC bilateral agreement to buy or sell an asset at a predetermined price (forward price) on a specified future date. No upfront premium; settlement occurs at maturity. Used extensively in FX and commodity hedging at SCB.',
    formula: 'F = S \\cdot e^{(r-q)T}',
    formulaLabel: 'Forward Price',
    tags: ['forward', 'OTC', 'hedging', 'FX', 'commodity'],
    chartType: 'long-forward',
    details: [
      'S = spot price, r = risk-free rate, q = dividend/convenience yield, T = time to maturity',
      'No exchange of cash at inception; all settlement at maturity',
      'Counterparty credit risk is a key concern (mitigated by CSAs)',
    ],
  },
  {
    id: 'futures-contract',
    title: 'Futures Contract',
    category: 'Forwards & Futures',
    description:
      'Exchange-traded, standardised forward contract with daily mark-to-market (variation margin). Eliminates counterparty credit risk via central clearing. Highly liquid; used for hedging and speculation.',
    formula: 'F = S \\cdot e^{(r-q)T}',
    formulaLabel: 'Futures Price (cost-of-carry)',
    tags: ['futures', 'exchange-traded', 'margin', 'mark-to-market', 'clearing'],
    chartType: 'short-forward',
    details: [
      'Daily MTM: gains/losses settled in cash each day',
      'Initial margin posted at inception; variation margin maintained daily',
      'Basis risk: difference between futures price and spot price',
    ],
  },
  {
    id: 'european-call',
    title: 'European Call Option',
    category: 'Options',
    description:
      'The right (not obligation) to buy the underlying asset at strike price K at expiry T. Buyer pays a premium upfront. Profit = max(S_T − K, 0) − Premium. Used in SCB structured products and client hedging.',
    formula: 'C = S \\cdot N(d_1) - K e^{-rT} \\cdot N(d_2)',
    formulaLabel: 'Black-Scholes Call Price',
    tags: ['call', 'option', 'Black-Scholes', 'European', 'premium', 'strike'],
    chartType: 'long-call',
    details: [
      'd₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)',
      'd₂ = d₁ − σ√T',
      'N(·) is the cumulative standard normal distribution',
    ],
  },
  {
    id: 'european-put',
    title: 'European Put Option',
    category: 'Options',
    description:
      'The right (not obligation) to sell the underlying at strike K at expiry T. Profit = max(K − S_T, 0) − Premium. Commonly used as downside protection in portfolio and FX hedges.',
    formula: 'P = K e^{-rT} \\cdot N(-d_2) - S \\cdot N(-d_1)',
    formulaLabel: 'Black-Scholes Put Price',
    tags: ['put', 'option', 'Black-Scholes', 'European', 'downside protection'],
    chartType: 'long-put',
    details: [
      'N(-d₂) = probability of exercise under risk-neutral measure',
      'As S → 0, put approaches intrinsic value K·e^(-rT)',
      'Deep ITM put behaves like a short forward',
    ],
  },
  {
    id: 'put-call-parity',
    title: 'Put-Call Parity',
    category: 'Options',
    description:
      'Fundamental no-arbitrage relationship linking call and put prices with the same strike and maturity. Violation implies a riskless arbitrage opportunity. Critical for derivatives pricing desks.',
    formula: 'C - P = S - K e^{-rT}',
    formulaLabel: 'Put-Call Parity',
    tags: ['arbitrage', 'parity', 'no-arbitrage', 'put', 'call', 'pricing'],
    details: [
      'Equivalently: C + K·e^(-rT) = P + S (portfolio equivalence)',
      'For dividend-paying assets: C − P = S·e^(-qT) − K·e^(-rT)',
      'Used to derive implied forwards and detect pricing inconsistencies',
    ],
  },
  {
    id: 'delta',
    title: 'Delta (Δ)',
    category: 'Greeks',
    description:
      'First-order sensitivity of option price to a unit change in the underlying price. Represents the hedge ratio — number of units of underlying needed to delta-hedge the option.',
    formula: '\\Delta_{call} = N(d_1), \\quad \\Delta_{put} = N(d_1) - 1',
    formulaLabel: 'Delta (Black-Scholes)',
    tags: ['delta', 'Greeks', 'hedge ratio', 'sensitivity', 'delta hedging'],
    details: [
      'Call delta ∈ (0, 1); Put delta ∈ (−1, 0)',
      'ATM option delta ≈ 0.5 (call) / −0.5 (put)',
      'Delta changes over time and with spot moves — requires dynamic hedging',
    ],
  },
  {
    id: 'gamma',
    title: 'Gamma (Γ)',
    category: 'Greeks',
    description:
      'Second-order sensitivity of option price to underlying price movements; rate of change of delta. High gamma near ATM at expiry. Gamma long positions profit from large spot moves.',
    formula: '\\Gamma = \\frac{N\'(d_1)}{S \\cdot \\sigma \\sqrt{T}}',
    formulaLabel: 'Gamma (Black-Scholes)',
    tags: ['gamma', 'Greeks', 'convexity', 'delta hedging', 'second-order'],
    details: [
      "N'(d₁) = standard normal PDF evaluated at d₁",
      'Gamma is highest for ATM options close to expiry',
      'Long gamma (long options) profits from realised vol > implied vol',
    ],
  },
  {
    id: 'vega',
    title: 'Vega (ν)',
    category: 'Greeks',
    description:
      'Sensitivity of option price to a 1% change in implied volatility. Long options are long vega — they benefit from rising vol. Central to vol trading and exotic structuring at SCB.',
    formula: '\\nu = S \\sqrt{T} \\cdot N\'(d_1)',
    formulaLabel: 'Vega (Black-Scholes)',
    tags: ['vega', 'Greeks', 'implied volatility', 'vol trading', 'sensitivity'],
    details: [
      'Vega is the same for calls and puts with same strike and maturity',
      'Measured per 1% change in vol (divide by 100 for decimal vol)',
      'Highest for ATM options with longer maturities',
    ],
  },
  {
    id: 'theta',
    title: 'Theta (Θ)',
    category: 'Greeks',
    description:
      'Rate of change of option price with respect to the passage of time. Usually negative for long option positions (time decay). Theta and gamma have opposite signs for standard options.',
    formula: '\\Theta = -\\frac{S\\sigma N\'(d_1)}{2\\sqrt{T}} - rKe^{-rT}N(d_2)',
    formulaLabel: 'Theta — Call (Black-Scholes)',
    tags: ['theta', 'Greeks', 'time decay', 'time value', 'sensitivity'],
    details: [
      'Theta is typically expressed per calendar day',
      'Gamma-Theta relationship: Γ·σ²·S²/2 + Θ + r·S·Δ = r·C (Black-Scholes PDE)',
      'Long option positions bleed theta daily; short option positions earn it',
    ],
  },
  {
    id: 'rho',
    title: 'Rho (ρ)',
    category: 'Greeks',
    description:
      'Sensitivity of option price to a 1% change in the risk-free interest rate. Less critical for short-dated options but material for long-dated structured notes.',
    formula: '\\rho_{call} = K T e^{-rT} N(d_2)',
    formulaLabel: 'Rho — Call (Black-Scholes)',
    tags: ['rho', 'Greeks', 'interest rate', 'sensitivity', 'rates'],
    details: [
      'Call rho is positive (higher rates increase call value)',
      'Put rho = −K·T·e^(-rT)·N(−d₂) — negative',
      'For FX options, rho includes both domestic and foreign rate sensitivity',
    ],
  },
  {
    id: 'irs',
    title: 'Interest Rate Swap (IRS)',
    category: 'Swaps & Credit',
    description:
      'OTC contract exchanging fixed-rate cash flows for floating-rate cash flows (typically SOFR/SONIA) on a notional principal. The most liquid derivative market globally. SCB uses IRS for balance-sheet hedging and client rate risk management.',
    formula: 'V_{IRS} = PV_{float} - PV_{fixed}',
    formulaLabel: 'IRS Value (pay-fixed)',
    tags: ['IRS', 'swap', 'fixed', 'floating', 'SOFR', 'rates', 'notional'],
    details: [
      'Par swap rate: rate at which V_IRS = 0 at inception',
      'Floating leg ≈ par initially; its value changes as forward rates evolve',
      'Duration of fixed leg ≈ annuity duration; floating leg ≈ next reset tenor',
    ],
  },
  {
    id: 'cds',
    title: 'Credit Default Swap (CDS)',
    category: 'Swaps & Credit',
    description:
      'Protection buyer pays periodic spread (in bps) to protection seller; seller pays face value minus recovery upon a credit event. Acts as insurance against issuer default. Key tool for SCB credit risk management.',
    formula: 'CDS\\ Spread \\approx (1 - R) \\times \\lambda',
    formulaLabel: 'Spread ≈ (1−Recovery) × Default Intensity',
    tags: ['CDS', 'credit', 'default', 'protection', 'spread', 'recovery', 'credit risk'],
    details: [
      'R = recovery rate (typically 40% for senior unsecured)',
      'λ = hazard rate (instantaneous default probability)',
      'Credit triangle: Spread = (1−R)·PD for small probabilities',
    ],
  },
  {
    id: 'vol-surface',
    title: 'Volatility Surface',
    category: 'Options',
    description:
      'The 3D surface of implied volatilities across strikes (or deltas) and maturities. The volatility smile/skew reflects market demand for tail-risk protection. Essential for exotic option pricing at SCB.',
    formula: '\\sigma_{imp} = \\sigma_{imp}(K, T)',
    formulaLabel: 'Implied Vol Surface',
    tags: ['vol surface', 'smile', 'skew', 'implied volatility', 'term structure', 'exotic'],
    details: [
      'FX: vol quoted by delta (10Δ put, 25Δ put, ATM, 25Δ call, 10Δ call)',
      'Equity: typically negative skew (puts more expensive than calls)',
      'Risk reversals and butterflies parametrise the smile shape',
    ],
  },
  {
    id: 'var',
    title: 'VaR (Value at Risk)',
    category: 'Risk',
    description:
      'Statistical measure of the maximum expected loss over a holding period at a given confidence level. Regulatory capital and internal risk limit metric. SCB reports 1-day and 10-day 99% VaR.',
    formula: 'VaR_{\\alpha} = \\mu - z_{\\alpha} \\cdot \\sigma',
    formulaLabel: 'Parametric VaR (normal)',
    tags: ['VaR', 'risk', 'market risk', 'confidence interval', 'regulatory', 'capital'],
    details: [
      'Parametric: assumes normal distribution of P&L',
      'Historical simulation: uses actual historical scenarios',
      'Monte Carlo: simulates thousands of scenarios; captures non-linearity',
      '10-day VaR = 1-day VaR × √10 (under i.i.d. assumption)',
    ],
  },
  {
    id: 'black-scholes',
    title: 'Black-Scholes Model',
    category: 'Options',
    description:
      'Landmark continuous-time model for European option pricing assuming GBM dynamics for the underlying. Foundation of modern derivatives pricing. Assumes constant vol — real markets exhibit vol smile.',
    formula: 'd_1 = \\frac{\\ln(S/K) + (r + \\sigma^2/2)T}{\\sigma\\sqrt{T}}, \\quad d_2 = d_1 - \\sigma\\sqrt{T}',
    formulaLabel: 'Black-Scholes d₁ and d₂',
    tags: ['Black-Scholes', 'BSM', 'GBM', 'lognormal', 'continuous-time', 'pricing model'],
    details: [
      'Assumptions: no dividends, constant r and σ, continuous trading, no transaction costs',
      'SDE: dS = r·S·dt + σ·S·dW under risk-neutral measure Q',
      'PDE: ∂V/∂t + ½σ²S²∂²V/∂S² + rS·∂V/∂S − rV = 0',
    ],
  },
];

export const derivativesCategories = [
  'All',
  'Options',
  'Forwards & Futures',
  'Greeks',
  'Swaps & Credit',
  'Risk',
];
