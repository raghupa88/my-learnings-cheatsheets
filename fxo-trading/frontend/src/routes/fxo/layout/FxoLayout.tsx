import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { connectWebSocket, disconnectWebSocket } from '../../../services/websocket';
import './FxoLayout.css';

const NAV_LINKS = [
  { to: '/fxo/rfq', label: 'RFQ Blotter' },
  { to: '/fxo/deal-ticket', label: 'Deal Ticket' },
  { to: '/fxo/risk', label: 'Risk / Greeks' },
  { to: '/fxo/confirmation', label: 'Confirmation' },
  { to: '/fxo/lifecycle', label: 'Lifecycle' },
];

export default function FxoLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/fxo/login';

  useEffect(() => {
    if (user) {
      connectWebSocket();
      return () => disconnectWebSocket();
    }
  }, [user]);

  const handleLogout = () => { logout(); navigate('/fxo/login'); };

  return (
    <div className="fxo-layout">
      {!isLogin && (
        <nav className="fxo-layout__nav">
          <div className="fxo-layout__nav-inner">
            <span className="fxo-layout__logo">⬡ FXO Trading</span>
            <ul className="fxo-layout__nav-links">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `fxo-layout__nav-link${isActive ? ' fxo-layout__nav-link--active' : ''}`
                    }
                  >{label}</NavLink>
                </li>
              ))}
            </ul>
            <div className="fxo-layout__user">
              {user && (
                <>
                  <span className="fxo-layout__user-name">{user.name}</span>
                  <span className={`fxo-layout__role fxo-layout__role--${user.role.toLowerCase()}`}>{user.role}</span>
                  <button className="fxo-layout__logout" onClick={handleLogout}>Logout</button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
      <main className="fxo-layout__main">
        <Outlet />
      </main>
    </div>
  );
}
