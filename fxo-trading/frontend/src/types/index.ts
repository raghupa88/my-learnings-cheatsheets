export type TradeType = 'VANILLA_CALL' | 'VANILLA_PUT' | 'NDF' | 'COLLAR';
export type TradeStatus = 'ACTIVE' | 'CONFIRMED' | 'SETTLED' | 'EXPIRED';
export type RFQStatus = 'PENDING' | 'QUOTED' | 'BOOKED';
export type UserRole = 'SALES' | 'TRADER' | 'OPERATIONS' | 'RISK';
export type LifecycleEventType = 'CONFIRMED' | 'BARRIER_HIT' | 'EXPIRED' | 'SETTLED';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface RFQ {
  id: string;
  requestingUserId: string;
  currencyPair: string;
  notional: number;
  type: TradeType;
  status: RFQStatus;
  bidRate?: number;
  offerRate?: number;
  createdAt: string;
}

export interface Trade {
  id: string;
  rfqId?: string;
  type: TradeType;
  currencyPair: string;
  notional: number;
  strike: number;
  expiry: string;
  premium: number;
  status: TradeStatus;
  userId: string;
  role: string;
  createdAt: string;
}

export interface GreeksSnapshot {
  id?: string;
  tradeId: string;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  timestamp: string;
}

export interface LifecycleEvent {
  id: string;
  tradeId: string;
  eventType: LifecycleEventType;
  payload: string;
  timestamp: string;
}
