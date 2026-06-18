import type { Trade } from '../../types';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import './TradeBlotter.css';

interface Props {
  trades: Trade[];
  onSelect?: (t: Trade) => void;
  selectedId?: string;
}

export function TradeBlotter({ trades, onSelect, selectedId }: Props) {
  if (trades.length === 0) return <p className="blotter__empty">No trades found.</p>;
  return (
    <div className="blotter">
      <table className="blotter__table">
        <thead>
          <tr>
            <th>ID</th><th>Type</th><th>Pair</th><th>Notional</th>
            <th>Strike</th><th>Expiry</th><th>Status</th><th>User</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t => (
            <tr
              key={t.id}
              className={`blotter__row${onSelect ? ' blotter__row--clickable' : ''}${selectedId === t.id ? ' blotter__row--selected' : ''}`}
              onClick={() => onSelect?.(t)}
            >
              <td className="blotter__id">{t.id.substring(0, 8)}</td>
              <td>{t.type.replace('_', ' ')}</td>
              <td>{t.currencyPair}</td>
              <td>{t.notional?.toLocaleString()}</td>
              <td>{t.strike?.toFixed(4)}</td>
              <td>{t.expiry}</td>
              <td><StatusBadge status={t.status} /></td>
              <td>{t.userId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
