import { GlossaryTerm } from '../types';

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'arbitrage',
    term: 'Arbitrage',
    definition:
      'The simultaneous purchase and sale of an asset in different markets to profit from a price discrepancy, with no net investment and no risk. Pure arbitrage opportunities are rare and short-lived in efficient markets.',
    category: 'Pricing',
  },
  {
    id: 'atm',
    term: 'At-the-Money (ATM)',
    definition:
      'An option where the strike price equals (or is close to) the current market price of the underlying. ATM options have the highest time value and are the most liquid on the vol surface.',
    category: 'Options',
  },
  {
    id: 'basis',
    term: 'Basis',
    definition:
      'The difference between the spot price of an asset and the price of the futures contract: Basis = Spot − Futures. Basis converges to zero at futures expiry. Also refers to the cross-currency basis in FX swaps.',
    category: 'Futures',
  },
  {
    id: 'basis-risk',
    term: 'Basis Risk',
    definition:
      'The risk that the hedging instrument does not move perfectly in line with the exposure being hedged, leaving residual P&L. Common when using futures to hedge a non-identical underlying asset.',
    category: 'Risk',
  },
  {
    id: 'black-scholes',
    term: 'Black-Scholes-Merton (BSM)',
    definition:
      'Continuous-time model for pricing European options, assuming the underlying follows geometric Brownian motion with constant volatility. The closed-form formula is the industry benchmark despite known limitations (constant vol, no jumps).',
    category: 'Pricing',
  },
  {
    id: 'bond',
    term: 'Bond',
    definition:
      'A fixed-income debt instrument where the issuer pays periodic coupons and repays face value at maturity. Bond price is the present value of future cash flows discounted at the yield. Duration and convexity measure interest-rate sensitivity.',
    category: 'Fixed Income',
  },
  {
    id: 'cap',
    term: 'Cap',
    definition:
      'An interest rate derivative consisting of a series of caplets, each of which is a call option on a floating rate (e.g., SOFR). Provides protection against rising rates for floating-rate borrowers. Priced as a sum of Black-model caplets.',
    category: 'Rates',
  },
  {
    id: 'collar',
    term: 'Collar',
    definition:
      'A combined options strategy: buy an OTM put (or cap) and sell an OTM call (or floor) to limit both downside and upside. Zero-cost collar: premium of bought option equals premium of sold option.',
    category: 'Options',
  },
  {
    id: 'collateral',
    term: 'Collateral',
    definition:
      'Assets posted as security by one counterparty to another to mitigate credit risk in OTC derivatives. Governed by a Credit Support Annex (CSA). Cash and government bonds are the most common forms.',
    category: 'Credit',
  },
  {
    id: 'convexity',
    term: 'Convexity',
    definition:
      'The second-order sensitivity of bond price to yield changes: the rate of change of duration. Positive convexity means the bond gains more from yield falls than it loses from yield rises of equal magnitude.',
    category: 'Fixed Income',
  },
  {
    id: 'counterparty-risk',
    term: 'Counterparty Risk',
    definition:
      'The risk that a trading counterparty defaults on its obligations before settlement. Measured as CVA (Credit Valuation Adjustment). Mitigated through netting agreements, collateral, and central clearing.',
    category: 'Credit',
  },
  {
    id: 'credit-risk',
    term: 'Credit Risk',
    definition:
      'The risk of loss from a borrower or counterparty failing to meet contractual obligations. In derivatives, this manifests as counterparty credit risk (CCR). Metrics include PD (probability of default), LGD (loss given default), and EAD (exposure at default).',
    category: 'Credit',
  },
  {
    id: 'delta-hedging',
    term: 'Delta Hedging',
    definition:
      'Dynamic hedging strategy that offsets an option position by holding delta units of the underlying asset. Requires continuous rebalancing as delta changes. A delta-neutral portfolio has zero first-order exposure to spot moves.',
    category: 'Risk',
  },
  {
    id: 'derivative',
    term: 'Derivative',
    definition:
      'A financial contract whose value is derived from the price of an underlying asset, index, rate, or event. Examples include options, forwards, futures, swaps, and credit derivatives. Used for hedging, speculation, and arbitrage.',
    category: 'General',
  },
  {
    id: 'duration',
    term: 'Duration (Modified)',
    definition:
      'Measure of a bond\'s price sensitivity to a 1% parallel shift in yield. Modified Duration = Macaulay Duration / (1 + y/m). A bond with duration 5 loses approximately 5% in price for a 100bps yield increase.',
    category: 'Fixed Income',
  },
  {
    id: 'european-option',
    term: 'European Option',
    definition:
      'An option that can only be exercised at expiry (unlike American options, which can be exercised anytime before expiry). European options are analytically tractable and priced using Black-Scholes. Most index options are European.',
    category: 'Options',
  },
  {
    id: 'american-option',
    term: 'American Option',
    definition:
      'An option that may be exercised at any time up to and including the expiry date. American options are worth at least as much as European options. They are priced using binomial trees or numerical methods as no closed-form solution exists (except for calls on non-dividend-paying assets).',
    category: 'Options',
  },
  {
    id: 'exotic-option',
    term: 'Exotic Option',
    definition:
      'Options with features beyond standard European or American payoffs. Examples include barrier options (knock-in/knock-out), Asian options (average price), digital options, lookback options, and quanto options. Require numerical pricing methods.',
    category: 'Options',
  },
  {
    id: 'expiry',
    term: 'Expiry / Expiration Date',
    definition:
      'The date on which an option or other derivative contract expires. After expiry, the option either lapses (OTM) or is exercised/settled (ITM). Last trading day is typically one business day before expiry for listed options.',
    category: 'Options',
  },
  {
    id: 'fixed-income',
    term: 'Fixed Income',
    definition:
      'Asset class comprising debt securities that pay periodic interest (coupons) and return principal at maturity. Includes government bonds, corporate bonds, structured products, and interest rate derivatives. SCB\'s Global Banking & Markets desk is a major fixed-income player.',
    category: 'Fixed Income',
  },
  {
    id: 'floor',
    term: 'Floor',
    definition:
      'An interest rate derivative consisting of a series of floorlets (put options on a floating rate). Provides protection against falling rates for floating-rate investors. The mirror image of a cap.',
    category: 'Rates',
  },
  {
    id: 'forward-points',
    term: 'Forward Points',
    definition:
      'The number of pips added to or subtracted from the spot rate to get the forward rate. Forward points = F − S. Positive if domestic rate > foreign rate (forward premium); negative if domestic rate < foreign rate (forward discount).',
    category: 'FX',
  },
  {
    id: 'fva',
    term: 'Funding Valuation Adjustment (FVA)',
    definition:
      'An adjustment to the fair value of an OTC derivative to account for the cost of funding uncollateralised positions. FVA = FCA + FBA (Funding Cost Adjustment + Funding Benefit Adjustment). Became material post-GFC.',
    category: 'XVA',
  },
  {
    id: 'greeks',
    term: 'Greeks',
    definition:
      'Sensitivity measures of an option\'s price to various risk factors: Delta (Δ, spot), Gamma (Γ, second-order spot), Vega (ν, volatility), Theta (Θ, time), Rho (ρ, interest rate), Vanna (cross: spot-vol), Volga (vol-of-vol).',
    category: 'Options',
  },
  {
    id: 'hedge',
    term: 'Hedge',
    definition:
      'A position taken in a financial instrument to reduce the risk of adverse price movements in an existing exposure. A perfect hedge eliminates all risk; in practice hedges are imperfect due to basis risk and discrete rebalancing.',
    category: 'Risk',
  },
  {
    id: 'implied-volatility',
    term: 'Implied Volatility (IV)',
    definition:
      'The volatility value that, when input to Black-Scholes, produces the observed market option price. It reflects the market\'s expectation of future volatility and is the standard quoting convention for options. IV ≠ realised future volatility.',
    category: 'Options',
  },
  {
    id: 'itm',
    term: 'In-the-Money (ITM)',
    definition:
      'An option with positive intrinsic value: a call is ITM when spot > strike; a put is ITM when spot < strike. Deep ITM options have delta close to 1 (call) or −1 (put) and behave like the underlying.',
    category: 'Options',
  },
  {
    id: 'initial-margin',
    term: 'Initial Margin (IM)',
    definition:
      'Collateral posted at the inception of a trade to cover potential future exposure. Required by CCPs for cleared derivatives and (under UMR) for bilateral OTC trades. Typically calculated using ISDA SIMM or exchange SPAN methodology.',
    category: 'Credit',
  },
  {
    id: 'knock-in',
    term: 'Knock-In Option',
    definition:
      'A barrier option that comes into existence only if the underlying touches or crosses a barrier level during the option\'s life. Cheaper than vanilla options. Used in FX structured products where clients accept conditionality for lower premium.',
    category: 'Options',
  },
  {
    id: 'knock-out',
    term: 'Knock-Out Option',
    definition:
      'A barrier option that ceases to exist if the underlying touches or crosses a barrier level. The option is extinguished (knocked out) even if it was ITM. Common in FX target redemption notes and structured hedges.',
    category: 'Options',
  },
  {
    id: 'leverage',
    term: 'Leverage',
    definition:
      'The use of borrowed capital or derivatives to amplify market exposure beyond the cash investment. Derivatives provide inherent leverage — a small option premium controls a large notional. Leverage magnifies both gains and losses.',
    category: 'General',
  },
  {
    id: 'liquidity-risk',
    term: 'Liquidity Risk',
    definition:
      'The risk that a position cannot be unwound or hedged at a reasonable price due to insufficient market depth. Two types: (1) Funding liquidity risk — inability to meet cash obligations; (2) Market liquidity risk — inability to transact without significant price impact.',
    category: 'Risk',
  },
  {
    id: 'margin-call',
    term: 'Margin Call',
    definition:
      'A demand by a broker or clearinghouse to deposit additional funds or collateral to bring the account back to the required maintenance margin level. Failure to meet a margin call can result in forced liquidation of positions.',
    category: 'Credit',
  },
  {
    id: 'mtm',
    term: 'Mark-to-Market (MTM)',
    definition:
      'The practice of valuing a position or portfolio at current market prices (fair value), rather than historical cost. Derivatives are MTM daily; unrealised gains/losses flow through P&L or via variation margin for cleared products.',
    category: 'General',
  },
  {
    id: 'market-risk',
    term: 'Market Risk',
    definition:
      'The risk of loss from adverse movements in market variables such as equity prices, interest rates, FX rates, commodity prices, and credit spreads. Measured using VaR, stressed VaR, and sensitivities (DV01, CS01, FX01).',
    category: 'Risk',
  },
  {
    id: 'moneyness',
    term: 'Moneyness',
    definition:
      'A measure of how far an option\'s strike is from the current market price of the underlying. ATM (at-the-money): S ≈ K; ITM: intrinsic value > 0; OTM: no intrinsic value. Standardised moneyness: log(F/K) / (σ√T).',
    category: 'Options',
  },
  {
    id: 'netting',
    term: 'Netting',
    definition:
      'The offsetting of obligations between counterparties to reduce gross exposures to net exposures. Close-out netting (under ISDA Master Agreement) allows all trades with a defaulted counterparty to be terminated and settled on a net basis, drastically reducing credit exposure.',
    category: 'Credit',
  },
  {
    id: 'notional',
    term: 'Notional Principal',
    definition:
      'The face or nominal amount on which payments in a derivative contract are calculated. The notional is not exchanged in most interest rate swaps. It determines the size of cash flows: e.g., in an IRS, the fixed leg pays notional × fixed rate × day fraction.',
    category: 'General',
  },
  {
    id: 'otc',
    term: 'OTC (Over-the-Counter)',
    definition:
      'Transactions negotiated directly between two parties, outside of a formal exchange. OTC derivatives are customised and flexible but carry counterparty credit risk. Post-2009 regulation (Dodd-Frank, EMIR) mandates central clearing for standardised OTC derivatives.',
    category: 'General',
  },
  {
    id: 'otm',
    term: 'Out-of-the-Money (OTM)',
    definition:
      'An option with no intrinsic value: a call is OTM when spot < strike; a put is OTM when spot > strike. OTM options consist entirely of time value. Deep OTM options have low delta and high gamma/vega relative to premium.',
    category: 'Options',
  },
  {
    id: 'premium',
    term: 'Premium',
    definition:
      'The price paid by the option buyer to the option seller for the rights conveyed. Comprised of intrinsic value and time value. Premium is paid upfront for exchange-traded options; OTC options may have deferred premium arrangements.',
    category: 'Options',
  },
  {
    id: 'rollover',
    term: 'Rollover',
    definition:
      'The process of extending the settlement date of an open FX position from one value date to a later one, usually by closing the expiring position and opening a new one at the current forward rate. Rollover incurs swap cost equal to the forward points.',
    category: 'FX',
  },
  {
    id: 'settlement',
    term: 'Settlement',
    definition:
      'The delivery of the underlying asset (physical settlement) or payment of the cash equivalent of the payoff (cash settlement) at the maturity or exercise of a derivative. FX spot settles T+2; futures mark-to-market daily with final settlement at expiry.',
    category: 'General',
  },
  {
    id: 'strike-price',
    term: 'Strike Price (Exercise Price)',
    definition:
      'The predetermined price at which the option holder may buy (call) or sell (put) the underlying asset upon exercise. The strike determines the option\'s intrinsic value and is a key parameter of the options contract.',
    category: 'Options',
  },
  {
    id: 'swap-rate',
    term: 'Swap Rate',
    definition:
      'The fixed rate in an interest rate swap at which the present value of the fixed leg equals the present value of the floating leg, making the swap\'s fair value zero at inception. The swap curve (collection of swap rates across tenors) is a key benchmark yield curve.',
    category: 'Rates',
  },
  {
    id: 'tenor',
    term: 'Tenor',
    definition:
      'The remaining time to maturity of a financial instrument. Standard tenors for OTC derivatives: ON (overnight), 1W, 2W, 1M, 2M, 3M, 6M, 9M, 1Y, 2Y, 5Y, 10Y, 30Y. Tenor drives time value of options and duration of fixed-income instruments.',
    category: 'General',
  },
  {
    id: 'underlying',
    term: 'Underlying Asset',
    definition:
      'The financial instrument (equity, bond, commodity, currency, index, or rate) whose price determines the value of a derivative contract. The underlying is not necessarily owned or exchanged — it serves as the reference for the derivative payoff calculation.',
    category: 'General',
  },
  {
    id: 'variation-margin',
    term: 'Variation Margin (VM)',
    definition:
      'Daily cash payments exchanged between counterparties to reflect the current mark-to-market value of a derivative position. Ensures that accumulated unrealised losses are settled daily, eliminating the build-up of credit exposure over time.',
    category: 'Credit',
  },
  {
    id: 'volatility',
    term: 'Volatility (σ)',
    definition:
      'A measure of the dispersion of returns of an asset. Historical (realised) volatility is computed from past price data. Implied volatility is extracted from option market prices. Volatility is a key driver of option value — higher vol → higher option premiums.',
    category: 'Options',
  },
  {
    id: 'yield-curve',
    term: 'Yield Curve',
    definition:
      'A graph showing the relationship between interest rates (yields) and maturities for a set of comparable debt instruments (typically government bonds). Key curve shapes: normal (upward sloping), flat, inverted (downward). Curve shape drives IRS pricing and relative value trades.',
    category: 'Fixed Income',
  },
  {
    id: 'cva',
    term: 'CVA (Credit Valuation Adjustment)',
    definition:
      'An adjustment to the risk-neutral fair value of a derivative to reflect the expected loss from counterparty default. CVA = LGD × ∫ EE(t) × PD(t) dt, where EE is expected exposure and PD is default probability density.',
    category: 'XVA',
  },
  {
    id: 'dv01',
    term: 'DV01 / PV01',
    definition:
      'The change in the present value of a fixed-income instrument or derivative for a 1 basis point (0.01%) change in yield or interest rate. DV01 (Dollar Value of 01) = −Modified Duration × Price × 0.0001. The primary rates risk metric.',
    category: 'Fixed Income',
  },
];

export const glossaryCategories = [
  'All',
  'Options',
  'Rates',
  'Fixed Income',
  'FX',
  'Credit',
  'Risk',
  'Pricing',
  'XVA',
  'Futures',
  'General',
];
