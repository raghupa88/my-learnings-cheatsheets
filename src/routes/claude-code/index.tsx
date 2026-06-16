import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { ThemeToggle } from '../../components/ThemeToggle/ThemeToggle';
import '../../routes/derivatives-forex/layout.css';

const NAV_LINKS = [
  { to: '/derivatives-forex', label: 'D&FX' },
  { to: '/claude-code', label: 'Claude Code', end: true },
];

export default function ClaudeCodeLayout() {
  const [theme, toggleTheme] = useTheme();
  const location = useLocation();

  return (
    <div className="layout">
      <nav className="layout__nav">
        <div className="layout__nav-inner">
          <NavLink to="/claude-code" className="layout__logo" aria-label="Claude Code">
            <span className="layout__logo-icon">⬡</span>
            <span className="layout__logo-text">Claude Code<span className="layout__logo-sub"> Cheatsheet</span></span>
          </NavLink>

          <ul className="layout__nav-links">
            {NAV_LINKS.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `layout__nav-link${isActive ? ' layout__nav-link--active' : ''}`
                  }
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </nav>

      <main className="layout__main">
        <Outlet />
      </main>

      <footer className="layout__footer">
        <p>Claude Code CLI Reference · {new Date().getFullYear()}</p>
        <p className="layout__footer-sub">
          <span className="layout__route-indicator">{location.pathname}</span>
        </p>
      </footer>
    </div>
  );
}
