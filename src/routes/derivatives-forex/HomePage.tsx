import { Link } from 'react-router-dom';
import './HomePage.css';

const SECTIONS = [
  {
    to: '/derivatives-forex/derivatives',
    icon: '◈',
    title: 'Derivatives',
    count: '15 concepts',
    description:
      'Options, forwards, futures, swaps, credit derivatives, and the full Greeks suite. Black-Scholes, VaR, IRS, CDS.',
    color: 'blue',
  },
  {
    to: '/derivatives-forex/forex',
    icon: '⟳',
    title: 'Forex',
    count: '12 concepts',
    description:
      'Spot rates, forward rates, cross rates, FX options, interest rate parity, PPP, Garman-Kohlhagen, and FX Greeks.',
    color: 'purple',
  },
  {
    to: '/derivatives-forex/glossary',
    icon: '⊞',
    title: 'Glossary',
    count: '50+ terms',
    description:
      'Comprehensive A-Z reference: arbitrage to yield curve, covering all key terms for derivatives and FX trading.',
    color: 'green',
  },
];

const QUICK_STATS = [
  { label: 'Derivatives Concepts', value: '15' },
  { label: 'Forex Concepts', value: '12' },
  { label: 'Glossary Terms', value: '50+' },
  { label: 'Payoff Diagrams', value: '7' },
];

export default function HomePage() {
  return (
    <div className="home">
      <section className="home__hero">
        <h1 className="home__hero-title">
          Derivatives &amp; Forex
          <br />
          <span className="home__hero-title-accent">Cheatsheet</span>
        </h1>
        <p className="home__hero-subtitle">
          A concise, formula-rich reference for supporting SCB's derivatives and foreign exchange
          business teams. KaTeX-rendered formulas, interactive payoff diagrams, and live search.
        </p>
        <div className="home__hero-actions">
          <Link to="/derivatives-forex/derivatives" className="home__cta-primary">
            Derivatives →
          </Link>
          <Link to="/derivatives-forex/glossary" className="home__cta-secondary">
            Browse Glossary
          </Link>
        </div>
      </section>

      <section className="home__stats">
        {QUICK_STATS.map(s => (
          <div key={s.label} className="home__stat">
            <span className="home__stat-value">{s.value}</span>
            <span className="home__stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="home__sections">
        <h2 className="home__section-heading">Reference Sections</h2>
        <div className="home__cards">
          {SECTIONS.map(s => (
            <Link key={s.to} to={s.to} className={`home__card home__card--${s.color}`}>
              <div className="home__card-icon">{s.icon}</div>
              <div className="home__card-body">
                <div className="home__card-header">
                  <h3 className="home__card-title">{s.title}</h3>
                  <span className="home__card-count">{s.count}</span>
                </div>
                <p className="home__card-desc">{s.description}</p>
              </div>
              <span className="home__card-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home__features">
        <h2 className="home__section-heading">Features</h2>
        <div className="home__feature-grid">
          {[
            { icon: '∫', title: 'KaTeX Formulas', desc: 'All pricing formulas rendered with KaTeX — Black-Scholes, IRP, PPP, Greeks, and more.' },
            { icon: '◬', title: 'Payoff Diagrams', desc: 'Interactive Recharts payoff diagrams for forwards, calls, puts with P&L including premium.' },
            { icon: '⌕', title: 'Live Search', desc: 'Debounced search filters concepts and glossary terms in real time as you type.' },
            { icon: '◐', title: 'Dark / Light Mode', desc: 'CSS custom property theming toggles between dark and light modes, persisted in localStorage.' },
          ].map(f => (
            <div key={f.title} className="home__feature">
              <span className="home__feature-icon">{f.icon}</span>
              <h4 className="home__feature-title">{f.title}</h4>
              <p className="home__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
