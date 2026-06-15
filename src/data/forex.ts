import { Concept } from '../types';

export const forexConcepts: Concept[] = [
  {
    id: 'spot-rate',
    title: 'Spot Rate',
    category: 'Rates',
    description:
      'The current market exchange rate for immediate delivery of one currency against another, settling T+2 business days. The foundation of all FX pricing. Quoted as units of quote currency per unit of base currency (e.g., USD/SGD = 1.3450).',
    formula: 'USD/SGD = 1.3450 \\Rightarrow 1\\ USD = 1.3450\\ SGD',
    formulaLabel: 'Spot Rate Convention',
    tags: ['spot', 'FX', 'T+2', 'exchange rate', 'base currency', 'quote currency'],
    details: [
      'Convention: Base/Quote (EUR/USD: EUR is base, USD is quote)',
      'Bid < Mid < Ask — the spread is the market-maker profit',
      'T+2 settlement for most major pairs (USD/CAD is T+1)',
    ],
  },
  {
    id: 'forward-rate-fx',
    title: 'Forward Rate (FX)',
    category: 'Rates',
    description:
      'Exchange rate agreed today for delivery at a future date. Determined by covered interest rate parity — no-arbitrage relationship between spot, forward, and interest rate differentials. Used extensively by SCB corporate clients for hedging.',
    formula: 'F = S \\cdot \\frac{1 + r_d \\cdot T}{1 + r_f \\cdot T}',
    formulaLabel: 'Forward Rate (simple interest)',
    tags: ['forward', 'FX', 'IRP', 'covered interest rate parity', 'hedging', 'forward points'],
    details: [
      'Continuous: F = S · e^(r_d − r_f)T',
      'Forward points = F − S (expressed in pips)',
      'If r_d > r_f: currency trades at forward premium',
    ],
  },
  {
    id: 'cross-rate',
    title: 'Cross Rate',
    category: 'Rates',
    description:
      'An exchange rate derived from two other currency pairs, neither of which involves USD as base or quote (though USD is often used as the intermediate). Essential for pricing exotic EM currency pairs at SCB.',
    formula: '\\frac{EUR}{JPY} = \\frac{EUR}{USD} \\times \\frac{USD}{JPY}',
    formulaLabel: 'Cross Rate via USD',
    tags: ['cross rate', 'triangular arbitrage', 'FX', 'currency pair', 'EM'],
    details: [
      'If EUR/USD = 1.0850 and USD/JPY = 149.50, then EUR/JPY = 162.21',
      'Cross rate misalignment creates triangular arbitrage opportunity',
      'Synthetic pairs often have wider spreads than direct quotes',
    ],
  },
  {
    id: 'pip',
    title: 'Pip & Pip Value',
    category: 'Rates',
    description:
      'A pip (percentage in point) is the smallest standard price increment for an FX rate — the fourth decimal place for most pairs (0.0001). Pipette = 0.00001. Pip value quantifies profit/loss in account currency.',
    formula: 'Pip\\ Value = \\frac{Pip\\ Size}{Exchange\\ Rate} \\times Lot\\ Size',
    formulaLabel: 'Pip Value (in base currency)',
    tags: ['pip', 'pipette', 'lot size', 'FX', 'price increment', 'P&L'],
    details: [
      'USD/JPY: 1 pip = 0.01 (2nd decimal place)',
      'Standard lot = 100,000 units of base currency',
      '1 pip on EUR/USD standard lot ≈ $10 (when USD is quote)',
    ],
  },
  {
    id: 'bid-ask-spread',
    title: 'Bid-Ask Spread',
    category: 'Rates',
    description:
      'The difference between the price at which a market maker will sell (ask/offer) and buy (bid) a currency. The spread compensates for inventory risk and is the primary revenue source for FX market makers. SCB quotes tight spreads on major G10 pairs.',
    formula: 'Spread\\ (pips) = \\frac{Ask - Bid}{Pip\\ Size}',
    formulaLabel: 'Spread in Pips',
    tags: ['bid', 'ask', 'spread', 'market maker', 'liquidity', 'transaction cost'],
    details: [
      'Tighter spread = more liquid pair (EUR/USD typically 0.1–0.5 pips)',
      'EM pairs have wider spreads due to lower liquidity',
      'Client buys at ask, sells at bid — always disadvantaged vs mid',
    ],
  },
  {
    id: 'fx-swap',
    title: 'FX Swap',
    category: 'Risk & Hedging',
    description:
      'A simultaneous purchase (sale) of a currency at spot and sale (purchase) at a forward date. FX swaps do not alter net currency exposure but manage liquidity timing mismatches. Largest segment of FX market by volume.',
    formula: 'FX\\ Swap = Spot\\ Leg + Forward\\ Leg',
    formulaLabel: 'FX Swap Structure',
    tags: ['FX swap', 'swap', 'liquidity', 'rollover', 'spot', 'forward', 'funding'],
    details: [
      'The swap price = forward points (difference between forward and spot)',
      'Used for short-term funding in foreign currency',
      'Different from cross-currency swap (which exchanges coupons in 2 currencies)',
    ],
  },
  {
    id: 'fx-option',
    title: 'FX Option (Garman-Kohlhagen)',
    category: 'Options',
    description:
      'European-style option on a currency pair. Priced using Garman-Kohlhagen model — Black-Scholes adapted for continuous foreign interest rate. Call = right to buy base currency (USD), put = right to sell. SCB structures vanilla and barrier FX options for corporate hedgers.',
    formula: 'C = S e^{-r_f T} N(d_1) - K e^{-r_d T} N(d_2)',
    formulaLabel: 'Garman-Kohlhagen Call',
    tags: ['FX option', 'Garman-Kohlhagen', 'vanilla', 'call', 'put', 'barrier', 'exotic'],
    details: [
      'd₁ = [ln(S/K) + (r_d − r_f + σ²/2)T] / (σ√T)',
      'd₂ = d₁ − σ√T',
      'Delta of FX call = e^(-r_f·T)·N(d₁) — slightly different from equity',
    ],
  },
  {
    id: 'irp',
    title: 'Interest Rate Parity (IRP)',
    category: 'Parity',
    description:
      'No-arbitrage condition linking spot rate, forward rate, and interest rate differentials between two currencies. Covered IRP holds in liquid markets; uncovered IRP (UIP) is an expectation about future spot rates.',
    formula: '\\frac{F}{S} = \\frac{1 + r_d}{1 + r_f} \\approx e^{(r_d - r_f)T}',
    formulaLabel: 'Covered Interest Rate Parity',
    tags: ['IRP', 'covered IRP', 'uncovered IRP', 'arbitrage', 'parity', 'interest rate differential'],
    details: [
      'CIP violation (basis) expanded post-GFC due to regulatory constraints',
      'UIP: E[S_T] = F — forward is unbiased predictor of future spot (often fails empirically)',
      'Cross-currency basis measures CIP deviation',
    ],
  },
  {
    id: 'ppp',
    title: 'Purchasing Power Parity (PPP)',
    category: 'Parity',
    description:
      'Macroeconomic theory that exchange rates adjust to equalise the purchasing power of currencies. Absolute PPP: same goods cost the same globally. Relative PPP: exchange rate changes reflect inflation differentials. Long-run exchange rate anchor.',
    formula: 'E[S_T] = S_0 \\cdot \\frac{1 + \\pi_d}{1 + \\pi_f}',
    formulaLabel: 'Relative PPP',
    tags: ['PPP', 'inflation', 'parity', 'macroeconomics', 'long-run', 'exchange rate'],
    details: [
      'The Economist Big Mac Index: practical test of absolute PPP',
      'PPP is a poor short-term predictor but useful for long-term valuation',
      'Deviations from PPP create "real exchange rate" misalignments',
    ],
  },
  {
    id: 'fx-delta',
    title: 'FX Delta & Notional Delta',
    category: 'Risk & Hedging',
    description:
      'Delta for FX options measures the change in option value per unit change in spot. FX delta conventions differ from equity — delta is often quoted as a percentage of notional, used for hedging and margining.',
    formula: '\\Delta_{call}^{FX} = e^{-r_f T} N(d_1)',
    formulaLabel: 'FX Call Delta (Garman-Kohlhagen)',
    tags: ['delta', 'FX delta', 'Greeks', 'notional delta', 'hedging', 'risk management'],
    details: [
      'Spot delta vs forward delta — convention varies by trading desk',
      'Notional delta = Δ% × notional amount',
      '25-delta put and call widely used as vol surface markers',
    ],
  },
  {
    id: 'fx-gamma-vega',
    title: 'FX Gamma & Vega',
    category: 'Risk & Hedging',
    description:
      'Second-order (gamma) and vol sensitivity (vega) of FX options. Gamma is highest for near-expiry ATM options. FX vol markets quote vega-weighted butterfly and risk reversal to characterise the smile.',
    formula: '\\Gamma = \\frac{e^{-r_f T} N\'(d_1)}{S \\sigma \\sqrt{T}}, \\quad \\nu = S e^{-r_f T} \\sqrt{T} N\'(d_1)',
    formulaLabel: 'FX Gamma & Vega',
    tags: ['gamma', 'vega', 'Greeks', 'FX', 'vol smile', 'risk reversal', 'butterfly'],
    details: [
      'Risk reversal = vol(call Δ) − vol(put Δ) — measures skew',
      'Butterfly = ½[vol(call Δ) + vol(put Δ)] − vol(ATM) — measures kurtosis',
      'Vega hedging requires trading options with the same maturity',
    ],
  },
  {
    id: 'correlation-trading',
    title: 'Correlation Trading & Quantos',
    category: 'Options',
    description:
      'Basket options and quanto products expose traders to correlation between assets or between an asset and an exchange rate. SCB structures quanto notes where a foreign asset payoff is paid in domestic currency — introducing FX-asset correlation risk.',
    formula: '\\sigma_{basket}^2 = \\sum_i w_i^2 \\sigma_i^2 + 2\\sum_{i<j} w_i w_j \\rho_{ij} \\sigma_i \\sigma_j',
    formulaLabel: 'Basket Variance (2-asset)',
    tags: ['correlation', 'quanto', 'basket', 'multi-asset', 'exotic', 'FX-rate correlation'],
    details: [
      'Quanto: payoff in non-natural currency uses average FX rate',
      'Correlation risk is hard to hedge — limited liquid instruments',
      'Dispersion trading: index options vs single stock options exploits correlation premium',
    ],
  },
];

export const forexCategories = ['All', 'Rates', 'Options', 'Risk & Hedging', 'Parity'];
