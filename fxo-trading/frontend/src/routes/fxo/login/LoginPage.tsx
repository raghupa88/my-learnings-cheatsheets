import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import type { UserRole } from '../../../types';
import './LoginPage.css';

const PERSONAS = [
  {
    userId: 'U001', name: 'Alice Chen', role: 'SALES' as UserRole,
    description: 'Submit client RFQs, get live quotes, send to client',
    defaultRoute: '/fxo/rfq',
  },
  {
    userId: 'U002', name: 'Bob Kumar', role: 'TRADER' as UserRole,
    description: 'Price options, book trades, manage risk book',
    defaultRoute: '/fxo/deal-ticket',
  },
  {
    userId: 'U003', name: 'Carol White', role: 'OPERATIONS' as UserRole,
    description: 'Confirm trades, view SWIFT messages, manage settlements',
    defaultRoute: '/fxo/confirmation',
  },
  {
    userId: 'U004', name: 'David Park', role: 'RISK' as UserRole,
    description: 'Monitor live Greeks, portfolio risk, position management',
    defaultRoute: '/fxo/risk',
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (userId: string, defaultRoute: string) => {
    try {
      const user = await api.login(userId);
      login(user);
      navigate(defaultRoute);
    } catch {
      alert('Login failed — is the backend running?');
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__hero">
        <span className="login-page__icon">⬡</span>
        <h1 className="login-page__title">FXO Trading Platform</h1>
        <p className="login-page__subtitle">Select a test persona to explore the system</p>
      </div>
      <div className="login-page__grid">
        {PERSONAS.map((p) => (
          <button
            key={p.userId}
            className={`login-page__card login-page__card--${p.role.toLowerCase()}`}
            onClick={() => handleLogin(p.userId, p.defaultRoute)}
          >
            <div className="login-page__card-role">{p.role}</div>
            <div className="login-page__card-name">{p.name}</div>
            <div className="login-page__card-id">{p.userId}</div>
            <p className="login-page__card-desc">{p.description}</p>
          </button>
        ))}
      </div>
      <p className="login-page__note">
        Local development only — mock authentication, H2 in-memory database
      </p>
    </div>
  );
}
